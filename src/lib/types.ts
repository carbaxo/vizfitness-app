export type MuscleGroup =
  | "pecho"
  | "espalda"
  | "pierna"
  | "gluteo"
  | "hombro"
  | "biceps"
  | "triceps"
  | "antebrazo"
  | "core"
  | "cardio"
  | "cuerpo completo"
  | "otro";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "pecho",
  "espalda",
  "pierna",
  "gluteo",
  "hombro",
  "biceps",
  "triceps",
  "antebrazo",
  "core",
  "cardio",
  "cuerpo completo",
  "otro",
];

export interface Exercise {
  id?: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: string;
  instructions?: string;
  custom?: boolean;
  // Campos de la base de datos de ejercicios (hasaneyldrm/exercises-dataset).
  // Presentes en los ejercicios de la biblioteca ilustrada, ausentes en los
  // curados a mano y en los personalizados del usuario.
  steps?: string[]; // instrucciones paso a paso en español
  bodyPart?: string; // zona del cuerpo original del dataset
  target?: string; // músculo objetivo principal (en inglés, del dataset)
  secondary?: string[]; // músculos secundarios (en inglés, del dataset)
  media?: string; // identificador de imagen/gif: "0001-2gPfomN"
}

export interface SetEntry {
  weight: number; // kg
  reps: number;
  done?: boolean;
}

export interface WorkoutExercise {
  name: string;
  muscleGroup?: MuscleGroup;
  sets: SetEntry[];
}

export type CardioSport =
  | "correr"
  | "bici"
  | "natacion"
  | "caminar"
  | "senderismo"
  | "remo"
  | "eliptica"
  | "otro";

export const CARDIO_SPORTS: { value: CardioSport; label: string; emoji: string }[] = [
  { value: "correr", label: "Correr", emoji: "🏃" },
  { value: "bici", label: "Bicicleta", emoji: "🚴" },
  { value: "natacion", label: "Natación", emoji: "🏊" },
  { value: "caminar", label: "Caminar", emoji: "🚶" },
  { value: "senderismo", label: "Senderismo", emoji: "🥾" },
  { value: "remo", label: "Remo", emoji: "🚣" },
  { value: "eliptica", label: "Elíptica", emoji: "⚙️" },
  { value: "otro", label: "Otro", emoji: "💪" },
];

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface CardioData {
  sport: CardioSport;
  distanceKm: number;
  avgHr?: number | null;
  elevationM?: number | null;
  calories?: number | null;
  // Trazado GPS grabado desde la app Android o importado de Strava
  route?: RoutePoint[];
}

// ------------------------------- circuitos por estaciones (WOD / Hyrox) ----

/** Material de una estación. Las bandas van separadas porque no se usan igual:
 *  la corta (mini band, un aro cerrado) es de tren inferior y activación; la
 *  larga (tubo o cinta larga, con o sin anclaje) sustituye a poleas y remo. */
export type StationEquipment =
  | "peso corporal"
  | "banda corta"
  | "banda larga"
  | "mancuerna"
  | "kettlebell"
  | "comba"
  | "mochila"
  | "esterilla";

export const STATION_EQUIPMENT: {
  value: StationEquipment;
  label: string;
  emoji: string;
}[] = [
  { value: "peso corporal", label: "Peso corporal", emoji: "🤸" },
  { value: "banda corta", label: "Banda corta", emoji: "⭕" },
  { value: "banda larga", label: "Banda larga", emoji: "🎗️" },
  { value: "mancuerna", label: "Mancuernas", emoji: "🏋️" },
  { value: "kettlebell", label: "Kettlebell", emoji: "🔔" },
  { value: "comba", label: "Comba", emoji: "🪢" },
  { value: "mochila", label: "Mochila lastrada", emoji: "🎒" },
  { value: "esterilla", label: "Esterilla", emoji: "🧘" },
];

export interface CircuitStation {
  name: string;
  equipment: StationEquipment;
  /** Duración de la estación. Si hay `reps`, el tiempo es solo el tope. */
  workSec: number;
  reps?: string;
  /** Cómo montarla o en qué fijarse: anclaje de la banda, tempo, postura… */
  note?: string;
}

export interface Circuit {
  name: string;
  emoji: string;
  description: string;
  stations: CircuitStation[];
  /** Tiempo entre estaciones: lo que tardas en cambiar de sitio y de material. */
  transitionSec: number;
  rounds: number;
  roundRestSec: number;
}

/** Lo que queda guardado de un circuito ya hecho. */
export interface CircuitData {
  stations: { name: string; equipment: StationEquipment }[];
  /** Rondas completadas y rondas que tenía el circuito. */
  rounds: number;
  plannedRounds: number;
  transitionSec: number;
  /** Segundos de trabajo puro, sin transiciones ni descansos. */
  workSec: number;
}

export interface Workout {
  id?: string;
  type: "gym" | "cardio" | "circuito";
  name: string;
  date: string; // ISO yyyy-mm-dd
  durationMin: number;
  notes?: string;
  exercises?: WorkoutExercise[];
  cardio?: CardioData;
  circuit?: CircuitData;
  volumeKg?: number;
  // ID de la actividad original si se importó desde Strava (evita duplicados)
  stravaId?: number;
  // ID de la sesión si se importó del reloj vía Health Connect (app Android)
  healthConnectId?: string;
  // ID estable si se importó de un archivo GPX (evita duplicados)
  gpxId?: string;
  createdAt: number;
}

export interface PlanExercise {
  name: string;
  sets: number;
  reps: string; // ej. "8-12"
  restSec?: number;
}

export interface PlanDay {
  name: string; // ej. "Día 1 · Empuje"
  focus?: string;
  type: "gym" | "cardio" | "descanso";
  exercises: PlanExercise[];
  cardioNote?: string;
}

export interface Plan {
  id?: string;
  name: string;
  description?: string;
  days: PlanDay[];
  active?: boolean;
  createdAt: number;
}

export type GoalType =
  | "distancia_mes"
  | "sesiones_semana"
  | "peso_ejercicio"
  | "peso_corporal";

export interface Goal {
  id?: string;
  title: string;
  type: GoalType;
  target: number;
  exerciseName?: string;
  createdAt: number;
}

export interface BodyMetric {
  id?: string;
  date: string; // ISO yyyy-mm-dd
  weightKg: number;
  createdAt: number;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  est1RM: number;
  date: string;
}
