import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { haversineM } from "./geo";
import type { CardioSport, RoutePoint } from "./types";

// Grabación GPS con soporte de segundo plano.
//
// En lugar de un watcher ligado a la pantalla, usamos un servicio en primer
// plano de Android (notificación persistente) que sigue recibiendo posiciones
// con la pantalla apagada o la app minimizada. La tarea escribe la sesión en
// AsyncStorage y la interfaz la lee periódicamente, de modo que la grabación
// sobrevive incluso si Android mata el proceso de la app.

export const GPS_TASK = "vizfitness-gps-tracking";
const SESSION_KEY = "gps_session_v1";
const AUTO_PAUSE_PREF_KEY = "gps_autopause_pref";

// Lecturas con precisión peor que esto (metros) se descartan
const MAX_ACCURACY_M = 35;
// Saltos imposibles entre lecturas consecutivas se ignoran (GPS perdido)
const MAX_JUMP_M = 200;
// Movimientos menores que esto se consideran ruido estando parado
const MIN_STEP_M = 2;

// Autopausa (con histéresis para no oscilar):
// por debajo de esta velocidad se considera que estás parado…
const AUTO_PAUSE_BELOW_MS = 0.6; // m/s
// …y hace falta superar esta velocidad para reanudar
const AUTO_RESUME_ABOVE_MS = 1.0; // m/s
// Tiempo parado antes de activar la autopausa
const AUTO_PAUSE_AFTER_MS = 5000;

export interface TrackingSession {
  sport: CardioSport;
  startedAt: number; // epoch ms
  pausedAccumMs: number; // tiempo total en pausa manual acumulado
  pauseStartedAt: number | null; // null = grabando
  distanceM: number;
  points: RoutePoint[];
  lastPoint: RoutePoint | null;
  lastTimestamp: number | null; // epoch ms de la última lectura válida
  gotFix: boolean; // ya hay señal GPS válida
  // Autopausa (opcional)
  autoPauseEnabled: boolean;
  autoPausedAccumMs: number; // tiempo total en autopausa acumulado
  autoPauseStartedAt: number | null; // null = no está en autopausa
  stillSince: number | null; // desde cuándo estás parado (aún sin autopausar)
}

// Preferencia del usuario (persistente): ¿autopausa activada?
export async function getAutoPausePref(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(AUTO_PAUSE_PREF_KEY);
  return raw === null ? true : raw === "1";
}

export async function setAutoPausePref(enabled: boolean) {
  await AsyncStorage.setItem(AUTO_PAUSE_PREF_KEY, enabled ? "1" : "0");
}

export async function getSession(): Promise<TrackingSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as TrackingSession) : null;
}

async function setSession(s: TrackingSession) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export function elapsedSec(s: TrackingSession): number {
  const pausedMs =
    s.pausedAccumMs + (s.pauseStartedAt ? Date.now() - s.pauseStartedAt : 0);
  const autoPausedMs =
    s.autoPausedAccumMs + (s.autoPauseStartedAt ? Date.now() - s.autoPauseStartedAt : 0);
  return Math.max(
    0,
    Math.floor((Date.now() - s.startedAt - pausedMs - autoPausedMs) / 1000)
  );
}

export function isAutoPaused(s: TrackingSession): boolean {
  return s.autoPauseStartedAt !== null;
}

// Cierra un intervalo de autopausa abierto (al pausar manualmente, terminar
// o detectar movimiento) acumulando su duración.
function foldAutoPause(s: TrackingSession, now: number): TrackingSession {
  if (s.autoPauseStartedAt === null) return s;
  return {
    ...s,
    autoPausedAccumMs: s.autoPausedAccumMs + (now - s.autoPauseStartedAt),
    autoPauseStartedAt: null,
    stillSince: null,
  };
}

// La tarea debe definirse en el ámbito global del bundle: se importa desde
// index.ts para que quede registrada también si Android relanza la app.
TaskManager.defineTask(GPS_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const session = await getSession();
  if (!session || session.pauseStartedAt !== null) return;

  let s = { ...session, points: [...session.points] };

  for (const loc of locations) {
    const acc = loc.coords.accuracy ?? 999;
    if (acc > MAX_ACCURACY_M) continue;
    s.gotFix = true;
    const now = loc.timestamp || Date.now();
    const p: RoutePoint = { lat: loc.coords.latitude, lng: loc.coords.longitude };

    // Velocidad: la del GPS si es válida; si no, derivada del desplazamiento
    let speed = loc.coords.speed ?? -1;
    if (speed < 0 && s.lastPoint && s.lastTimestamp && now > s.lastTimestamp) {
      speed = haversineM(s.lastPoint, p) / ((now - s.lastTimestamp) / 1000);
    }

    if (s.autoPauseEnabled && speed >= 0) {
      if (s.autoPauseStartedAt !== null) {
        // En autopausa: ¿volvemos a movernos?
        if (speed >= AUTO_RESUME_ABOVE_MS) {
          s = foldAutoPause(s, now);
          // No unimos el hueco: la distancia continúa desde este punto
          s.lastPoint = p;
          s.lastTimestamp = now;
          s.points.push(p);
        }
        continue; // parado: ni distancia ni puntos
      }
      if (speed < AUTO_PAUSE_BELOW_MS) {
        if (s.stillSince === null) s.stillSince = now;
        else if (now - s.stillSince >= AUTO_PAUSE_AFTER_MS) {
          // Llevamos varios segundos parados: activar autopausa,
          // descontando ya el tiempo que llevábamos quietos
          s.autoPauseStartedAt = s.stillSince;
          continue;
        }
      } else {
        s.stillSince = null;
      }
    }

    if (s.lastPoint) {
      const d = haversineM(s.lastPoint, p);
      if (d > MAX_JUMP_M) continue;
      if (d < MIN_STEP_M) {
        s.lastTimestamp = now;
        continue;
      }
      s.distanceM += d;
    }
    s.lastPoint = p;
    s.lastTimestamp = now;
    s.points.push(p);
  }

  await setSession(s);
});

export async function isTracking(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(GPS_TASK);
  } catch {
    return false;
  }
}

// Pide permisos y arranca el servicio. Devuelve el modo conseguido:
// - "background": permiso "todo el tiempo" → graba con pantalla apagada
// - "foreground": solo "mientras se usa" → graba con la app abierta
// - null: sin permiso de ubicación
export async function startTracking(
  sport: CardioSport,
  autoPauseEnabled: boolean
): Promise<"background" | "foreground" | null> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return null;

  // En Android 11+ este diálogo lleva a los ajustes ("Permitir siempre")
  const bg = await Location.requestBackgroundPermissionsAsync();
  const mode = bg.status === "granted" ? "background" : "foreground";

  await setSession({
    sport,
    startedAt: Date.now(),
    pausedAccumMs: 0,
    pauseStartedAt: null,
    distanceM: 0,
    points: [],
    lastPoint: null,
    lastTimestamp: null,
    gotFix: false,
    autoPauseEnabled,
    autoPausedAccumMs: 0,
    autoPauseStartedAt: null,
    stillSince: null,
  });

  await Location.startLocationUpdatesAsync(GPS_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 3000,
    distanceInterval: 5,
    // Servicio en primer plano: mantiene el GPS vivo con la pantalla apagada
    foregroundService: {
      notificationTitle: "VizFitness — grabando ruta",
      notificationBody: "Tu actividad sigue grabándose. Toca para volver a la app.",
      notificationColor: "#FF6F00",
      killServiceOnDestroy: false,
    },
    pausesUpdatesAutomatically: false,
  });

  return mode;
}

export async function pauseTracking() {
  const s = await getSession();
  if (!s || s.pauseStartedAt !== null) return;
  // La pausa manual cierra la autopausa para no descontar el tiempo dos veces
  const now = Date.now();
  await setSession({ ...foldAutoPause(s, now), pauseStartedAt: now });
}

export async function resumeTracking() {
  const s = await getSession();
  if (!s || s.pauseStartedAt === null) return;
  await setSession({
    ...s,
    pausedAccumMs: s.pausedAccumMs + (Date.now() - s.pauseStartedAt),
    pauseStartedAt: null,
    stillSince: null,
    // No unimos el hueco de la pausa: la distancia continúa desde el
    // siguiente punto válido
    lastPoint: null,
    lastTimestamp: null,
  });
}

// Detiene el servicio y devuelve la sesión final (sin borrarla todavía:
// se borra al guardar o descartar).
export async function stopTracking(): Promise<TrackingSession | null> {
  if (await isTracking()) {
    await Location.stopLocationUpdatesAsync(GPS_TASK);
  }
  let s = await getSession();
  if (!s) return null;
  const now = Date.now();
  let changed = false;
  if (s.autoPauseStartedAt !== null) {
    s = foldAutoPause(s, now);
    changed = true;
  }
  if (s.pauseStartedAt !== null) {
    s = {
      ...s,
      pausedAccumMs: s.pausedAccumMs + (now - s.pauseStartedAt),
      pauseStartedAt: null,
    };
    changed = true;
  }
  if (changed) await setSession(s);
  return s;
}
