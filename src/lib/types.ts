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
  steps?: string[];
  bodyPart?: string;
  target?: string;
  secondary?: string[];
  media?: string;
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

export interface Workout {
  id?: string;
  type: "gym" | "cardio";
  name: string;
  date: string; // ISO yyyy-mm-dd
  durationMin: number;
  notes?: string;
  exercises?: WorkoutExercise[];
  cardio?: CardioData;
  volumeKg?: number;
  // ID de la actividad original si se importó desde Strava (evita duplicados)
  stravaId?: number;
  // ID de la sesión si se importó del reloj vía Health Connect (app Android)
  healthConnectId?: string;
  // ID estable si se importó de un archivo GPX (evita duplicados)
  gpxId?: string;
  createdAt: number;
  profileId?: string;
  profileName?: string;
}

export type ProfileSex = "mujer" | "hombre" | "otro";
export type TrainingLevel = "principiante" | "intermedio" | "avanzado";
export type FitnessGoal =
  | "salud"
  | "perder grasa"
  | "ganar musculo"
  | "fuerza"
  | "resistencia"
  | "movilidad";

export interface TrainingProfile {
  id?: string;
  name: string;
  sex: ProfileSex;
  birthYear?: number;
  heightCm: number;
  weightKg: number;
  level: TrainingLevel;
  goal: FitnessGoal;
  activity: "baja" | "moderada" | "alta";
  daysPerWeek: number;
  limitations?: string;
  createdAt: number;
}

export type TrainingPlace = "gimnasio" | "casa" | "exterior";
export type TrainingFocus = "musculacion" | "cardio" | "mixto";

export interface SessionPreferences {
  profileId?: string;
  profileName: string;
  place: TrainingPlace;
  focus: TrainingFocus;
  level: TrainingLevel;
  goal: FitnessGoal;
  participants: number;
  durationMin: number;
  equipment: string[];
  energy: "baja" | "normal" | "alta";
}

export interface GeneratedSession {
  name: string;
  description: string;
  focus: TrainingFocus;
  durationMin: number;
  exercises: WorkoutExercise[];
  cardioMinutes?: number;
  rounds?: number;
  profileId?: string;
  profileName: string;
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
