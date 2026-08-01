import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { addWorkout } from "../lib/db";
import { capRoute, formatClock, isoDate, pace } from "../lib/geo";
import {
  clearSession,
  elapsedSec as sessionElapsedSec,
  getAutoPausePref,
  getSession,
  isAutoPaused,
  isTracking,
  pauseTracking,
  resumeTracking,
  setAutoPausePref,
  startTracking,
  stopTracking,
  type TrackingSession,
} from "../lib/tracking";
import { CARDIO_SPORTS, type CardioSport } from "../lib/types";
import { colors } from "../theme";
import RouteMap from "../components/RouteMap";
import { Button, Card, Stat } from "../components/ui";

type Status = "idle" | "tracking" | "paused" | "finished";

export default function GpsScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [sport, setSport] = useState<CardioSport>("correr");
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [bgMode, setBgMode] = useState<"background" | "foreground">("background");
  const [autoPause, setAutoPause] = useState(true);
  const statusRef = useRef<Status>("idle");
  statusRef.current = status;

  // Preferencia de autopausa persistida entre sesiones
  useEffect(() => {
    getAutoPausePref().then(setAutoPause);
  }, []);

  const toggleAutoPause = (value: boolean) => {
    setAutoPause(value);
    setAutoPausePref(value);
  };

  // Si la app se cerró con una grabación activa, la restauramos tal cual:
  // el servicio en primer plano siguió grabando mientras tanto.
  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (!s) return;
      const active = await isTracking();
      if (active) {
        setSport(s.sport);
        setSession(s);
        setElapsed(sessionElapsedSec(s));
        setStatus(s.pauseStartedAt !== null ? "paused" : "tracking");
      } else {
        // Sesión huérfana (la app murió tras terminar sin guardar): la
        // ofrecemos como actividad terminada para no perder la ruta.
        setSport(s.sport);
        setSession(s);
        setElapsed(sessionElapsedSec(s));
        setStatus("finished");
      }
    })();
  }, []);

  // La tarea de fondo escribe la sesión en el almacenamiento; la UI la lee
  // cada segundo para refrescar distancia, ruta y cronómetro.
  useEffect(() => {
    if (status !== "tracking" && status !== "paused") return;
    const id = setInterval(async () => {
      const s = await getSession();
      if (!s || statusRef.current === "finished" || statusRef.current === "idle") return;
      setSession(s);
      setElapsed(sessionElapsedSec(s));
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  const start = async () => {
    try {
      const mode = await startTracking(sport, autoPause);
      if (!mode) {
        Alert.alert(
          "Permiso necesario",
          "VizFitness necesita acceso a tu ubicación para grabar la ruta."
        );
        return;
      }
      setBgMode(mode);
      if (mode === "foreground") {
        Alert.alert(
          "Grabación limitada",
          "Sin el permiso «Permitir siempre», la ruta solo se graba con la app en pantalla. Puedes cambiarlo en Ajustes → Aplicaciones → VizFitness → Ubicación."
        );
      }
      setSession(null);
      setElapsed(0);
      setStatus("tracking");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo iniciar el GPS. Inténtalo de nuevo.");
    }
  };

  const pause = async () => {
    await pauseTracking();
    setStatus("paused");
  };

  const resume = async () => {
    await resumeTracking();
    setStatus("tracking");
  };

  const finish = async () => {
    const s = await stopTracking();
    setSession(s);
    if (s) setElapsed(sessionElapsedSec(s));
    setStatus("finished");
  };

  const discard = () => {
    Alert.alert("Descartar actividad", "¿Seguro que quieres descartar esta actividad?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Descartar",
        style: "destructive",
        onPress: async () => {
          await stopTracking();
          await clearSession();
          setSession(null);
          setStatus("idle");
        },
      },
    ]);
  };

  const save = async () => {
    if (!user || !session) return;
    setSaving(true);
    try {
      const distanceKm = Math.round((session.distanceM / 1000) * 100) / 100;
      const durationMin = Math.max(1, Math.round(elapsed / 60));
      const sportInfo = CARDIO_SPORTS.find((s) => s.value === session.sport)!;
      await addWorkout(user.uid, {
        type: "cardio",
        name: `${sportInfo.label} con GPS`,
        date: isoDate(new Date(session.startedAt)),
        durationMin,
        cardio: {
          sport: session.sport,
          distanceKm,
          route: capRoute(session.points),
        },
        createdAt: Date.now(),
      });
      await clearSession();
      setSession(null);
      setStatus("idle");
      Alert.alert("Guardado ✓", "Tu actividad se ha sincronizado con todos tus dispositivos.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo guardar la actividad. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const route = session?.points ?? [];
  const distanceKm = (session?.distanceM ?? 0) / 1000;
  const durationMin = elapsed / 60;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <Text style={styles.title}>🛰️ Cardio con GPS</Text>

      {status === "idle" && (
        <>
          <Card>
            <Text style={styles.label}>Deporte</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {CARDIO_SPORTS.filter((s) =>
                ["correr", "bici", "caminar", "senderismo", "otro"].includes(s.value)
              ).map((s) => (
                <Button
                  key={s.value}
                  title={`${s.emoji} ${s.label}`}
                  variant={sport === s.value ? "primary" : "secondary"}
                  onPress={() => setSport(s.value)}
                  style={{ paddingVertical: 9, paddingHorizontal: 13 }}
                />
              ))}
            </View>
          </Card>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  ⏯ Autopausa
                </Text>
                <Text style={{ color: colors.textFaint, fontSize: 12, marginTop: 2, lineHeight: 17 }}>
                  Pausa el cronómetro automáticamente cuando te paras (semáforos,
                  descansos) y lo reanuda al volver a moverte.
                </Text>
              </View>
              <Switch
                value={autoPause}
                onValueChange={toggleAutoPause}
                trackColor={{ false: colors.inputBorder, true: colors.accentDark }}
                thumbColor={autoPause ? colors.accent : colors.textFaint}
              />
            </View>
          </Card>
          <Button title="▶  Empezar actividad" onPress={start} style={{ paddingVertical: 18 }} />
          <Text style={styles.hint}>
            La grabación funciona también con la pantalla apagada o la app
            minimizada: verás una notificación mientras dure la actividad. Para
            ello, concede el permiso de ubicación «Permitir siempre».
          </Text>
        </>
      )}

      {(status === "tracking" || status === "paused") && (
        <>
          <Card style={{ gap: 14 }}>
            <View style={{ flexDirection: "row" }}>
              <Stat label="Tiempo" value={formatClock(elapsed)} color={colors.text} />
              <Stat label="Distancia" value={`${distanceKm.toFixed(2)} km`} color={colors.cardio} />
              <Stat label="Ritmo" value={`${pace(durationMin, distanceKm)} /km`} />
            </View>
            <Text
              style={{
                color: session && isAutoPaused(session) ? colors.warn : colors.textFaint,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              {status === "paused"
                ? "⏸ En pausa"
                : session && isAutoPaused(session)
                  ? "⏯ Autopausa — te has parado; se reanuda sola al moverte"
                  : !session?.gotFix
                    ? "📡 Buscando señal GPS…"
                    : `📡 GPS activo · ${route.length} puntos` +
                      (bgMode === "background" ? " · graba en segundo plano" : "") +
                      (session?.autoPauseEnabled ? " · autopausa" : "")}
            </Text>
          </Card>

          <Card style={{ padding: 8 }}>
            {route.length > 1 ? (
              <RouteMap route={route} />
            ) : (
              <View style={{ height: 220, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.textFaint }}>
                  El mapa aparecerá aquí en cuanto empieces a moverte
                </Text>
              </View>
            )}
          </Card>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {status === "tracking" ? (
              <Button title="⏸ Pausar" variant="secondary" onPress={pause} style={{ flex: 1 }} />
            ) : (
              <Button title="▶ Reanudar" onPress={resume} style={{ flex: 1 }} />
            )}
            <Button title="⏹ Terminar" variant="danger" onPress={finish} style={{ flex: 1 }} />
          </View>
        </>
      )}

      {status === "finished" && session && (
        <>
          <Card style={{ gap: 14 }}>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
              Resumen de la actividad
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Stat label="Tiempo" value={formatClock(elapsed)} color={colors.text} />
              <Stat label="Distancia" value={`${distanceKm.toFixed(2)} km`} color={colors.cardio} />
              <Stat label="Ritmo" value={`${pace(durationMin, distanceKm)} /km`} />
            </View>
          </Card>
          <Card style={{ padding: 8 }}>
            <RouteMap route={route} />
          </Card>
          <Button
            title="💾 Guardar actividad"
            onPress={save}
            loading={saving}
            style={{ paddingVertical: 16 }}
          />
          <Button title="Descartar" variant="danger" onPress={discard} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  hint: { color: colors.textFaint, fontSize: 13, lineHeight: 19 },
});
