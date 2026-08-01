import type { PlanDay } from "./types";

// Plantillas de rutinas listas para usar. El usuario las añade a "Planes" con
// un toque y luego puede editarlas o iniciar cada día como sesión.
// Los ejercicios usan nombres EXACTOS de la base de datos (hasaneyldrm/
// exercises-dataset), así que la búsqueda y el autocompletado los reconocen.
export type RoutineGroup = "gimnasio" | "casa";

export const ROUTINE_GROUPS: { value: RoutineGroup; label: string; emoji: string }[] = [
  { value: "gimnasio", label: "Gimnasio", emoji: "🏋️" },
  { value: "casa", label: "Casa + cardio", emoji: "🏠" },
];

export interface RoutineTemplate {
  id: string;
  name: string;
  emoji: string;
  group: RoutineGroup;
  level: "Principiante" | "Intermedio" | "Avanzado";
  daysPerWeek: number;
  description: string;
  days: PlanDay[];
}

const REST_HEAVY = 180;
const REST_COMPOUND = 120;
const REST_ISOLATION = 75;
const REST_CORE = 60;

const rest = (name: string) => ({ name, type: "descanso" as const, exercises: [] });

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "inicio-2",
    group: "gimnasio",
    name: "Iniciación · 2 días",
    emoji: "🌱",
    level: "Principiante",
    daysPerWeek: 2,
    description:
      "Dos sesiones de cuerpo completo a la semana con los movimientos básicos. Perfecta para empezar sin agobios y crear el hábito.",
    days: [
      {
        name: "Día 1 · Cuerpo completo A",
        focus: "básicos",
        type: "gym",
        exercises: [
          { name: "Smith leg press", sets: 3, reps: "10-12", restSec: REST_COMPOUND },
          { name: "Dumbbell bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable bar lateral pulldown", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell lateral raise", sets: 2, reps: "12-15", restSec: REST_CORE },
          { name: "Tuck crunch", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      rest("Día 2 · Descanso"),
      rest("Día 3 · Descanso"),
      {
        name: "Día 4 · Cuerpo completo B",
        focus: "básicos",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell incline bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable seated row", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell biceps curl", sets: 2, reps: "12-15", restSec: REST_CORE },
          { name: "Russian twist", sets: 3, reps: "20", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "mancuernas-3",
    group: "casa",
    name: "En casa con mancuernas · 3 días",
    emoji: "🏠",
    level: "Principiante",
    daysPerWeek: 3,
    description:
      "Tres sesiones de cuerpo completo usando solo mancuernas. Perfecta para entrenar en casa sin más material.",
    days: [
      {
        name: "Día 1 · Cuerpo completo A",
        focus: "empuje + pierna",
        type: "gym",
        exercises: [
          { name: "Dumbbell goblet squat", sets: 3, reps: "10-12", restSec: REST_COMPOUND },
          { name: "Dumbbell bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell bent over row", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell standing overhead press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Tuck crunch", sets: 3, reps: "15", restSec: REST_CORE },
        ],
      },
      rest("Día 2 · Descanso"),
      {
        name: "Día 3 · Cuerpo completo B",
        focus: "tracción + pierna",
        type: "gym",
        exercises: [
          { name: "Dumbbell romanian deadlift", sets: 3, reps: "10-12", restSec: REST_COMPOUND },
          { name: "Dumbbell lunge", sets: 3, reps: "10 por pierna", restSec: REST_ISOLATION },
          { name: "Dumbbell fly", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Dumbbell biceps curl", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Russian twist", sets: 3, reps: "20", restSec: REST_CORE },
        ],
      },
      rest("Día 4 · Descanso"),
      {
        name: "Día 5 · Cuerpo completo C",
        focus: "general",
        type: "gym",
        exercises: [
          { name: "Dumbbell goblet squat", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Dumbbell standing overhead press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell bent over row", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Dumbbell lateral raise", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Dumbbell hammer curl", sets: 2, reps: "12-15", restSec: REST_CORE },
          { name: "Dumbbell standing calf raise", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "calistenia-3",
    group: "casa",
    name: "Calistenia · 3 días",
    emoji: "🤸",
    level: "Intermedio",
    daysPerWeek: 3,
    description:
      "Entrenamiento con el peso corporal, casi sin material (como mucho una barra de dominadas). Fuerza y control en cualquier sitio.",
    days: [
      {
        name: "Día 1 · Torso",
        focus: "empuje + tracción",
        type: "gym",
        exercises: [
          { name: "Chin-up", sets: 4, reps: "máx", restSec: REST_COMPOUND },
          { name: "Push-up", sets: 4, reps: "máx", restSec: REST_ISOLATION },
          { name: "Inverted row", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Chest dip", sets: 3, reps: "máx", restSec: REST_ISOLATION },
          { name: "Hanging leg raise", sets: 3, reps: "10-15", restSec: REST_CORE },
        ],
      },
      rest("Día 2 · Descanso"),
      {
        name: "Día 3 · Pierna y core",
        focus: "tren inferior",
        type: "gym",
        exercises: [
          { name: "Split squats", sets: 4, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Walking lunge", sets: 3, reps: "20 pasos", restSec: REST_ISOLATION },
          { name: "Low glute bridge on floor", sets: 3, reps: "15-20", restSec: REST_CORE },
          { name: "Jump squat", sets: 3, reps: "15", restSec: REST_CORE },
          { name: "Reverse crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      rest("Día 4 · Descanso"),
      {
        name: "Día 5 · Cuerpo completo",
        focus: "general",
        type: "gym",
        exercises: [
          { name: "Chin-up", sets: 3, reps: "máx", restSec: REST_COMPOUND },
          { name: "Push-up", sets: 3, reps: "máx", restSec: REST_ISOLATION },
          { name: "Inverted row", sets: 3, reps: "12", restSec: REST_ISOLATION },
          { name: "Three bench dip", sets: 3, reps: "máx", restSec: REST_CORE },
          { name: "Hyperextension", sets: 3, reps: "15", restSec: REST_CORE },
          { name: "Russian twist", sets: 3, reps: "20", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "fullbody-3",
    group: "gimnasio",
    name: "Cuerpo completo · 3 días",
    emoji: "🔰",
    level: "Principiante",
    daysPerWeek: 3,
    description:
      "Tres sesiones de cuerpo completo (lunes, miércoles, viernes). Trabaja todos los grupos con los básicos: ideal para progresar rápido al principio.",
    days: [
      {
        name: "Día 1 · Cuerpo completo A",
        focus: "empuje + pierna",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell bench press", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell bent over row", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell seated overhead press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Tuck crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      rest("Día 2 · Descanso"),
      {
        name: "Día 3 · Cuerpo completo B",
        focus: "tracción + pierna",
        type: "gym",
        exercises: [
          { name: "Barbell deadlift", sets: 3, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Cable bar lateral pulldown", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell lunge", sets: 3, reps: "10 por pierna", restSec: REST_ISOLATION },
          { name: "Hanging leg raise", sets: 3, reps: "10-15", restSec: REST_CORE },
        ],
      },
      rest("Día 4 · Descanso"),
      {
        name: "Día 5 · Cuerpo completo C",
        focus: "general",
        type: "gym",
        exercises: [
          { name: "Smith leg press", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Barbell incline bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable seated row", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Dumbbell lateral raise", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Dumbbell biceps curl", sets: 2, reps: "12-15", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "fuerza-5x5",
    group: "gimnasio",
    name: "Fuerza 5×5 · 3 días",
    emoji: "🏋️",
    level: "Intermedio",
    daysPerWeek: 3,
    description:
      "Rutina de fuerza estilo 5×5 alternando dos sesiones (A y B). Pocos ejercicios, mucho peso y progresión lineal en los grandes básicos.",
    days: [
      {
        name: "Día 1 · Fuerza A",
        focus: "sentadilla",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 5, reps: "5", restSec: REST_HEAVY },
          { name: "Barbell bench press", sets: 5, reps: "5", restSec: REST_HEAVY },
          { name: "Barbell bent over row", sets: 5, reps: "5", restSec: REST_COMPOUND },
        ],
      },
      rest("Día 2 · Descanso"),
      {
        name: "Día 3 · Fuerza B",
        focus: "peso muerto",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 5, reps: "5", restSec: REST_HEAVY },
          { name: "Barbell seated overhead press", sets: 5, reps: "5", restSec: REST_HEAVY },
          { name: "Barbell deadlift", sets: 1, reps: "5", restSec: REST_HEAVY },
        ],
      },
      rest("Día 4 · Descanso"),
      {
        name: "Día 5 · Fuerza A",
        focus: "sentadilla",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 5, reps: "5", restSec: REST_HEAVY },
          { name: "Barbell bench press", sets: 5, reps: "5", restSec: REST_HEAVY },
          { name: "Barbell bent over row", sets: 5, reps: "5", restSec: REST_COMPOUND },
        ],
      },
    ],
  },
  {
    id: "upper-lower-4",
    group: "gimnasio",
    name: "Torso / Pierna · 4 días",
    emoji: "⚖️",
    level: "Intermedio",
    daysPerWeek: 4,
    description:
      "Cuatro días alternando torso y pierna (2 de cada). Buen equilibrio entre volumen y recuperación para seguir progresando.",
    days: [
      {
        name: "Día 1 · Torso A",
        focus: "empuje dominante",
        type: "gym",
        exercises: [
          { name: "Barbell bench press", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Barbell bent over row", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell seated overhead press", sets: 3, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Cable bar lateral pulldown", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell lateral raise", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 2 · Pierna A",
        focus: "cuádriceps dominante",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Smith leg press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Lever lying leg curl", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Cable standing calf raise", sets: 4, reps: "15-20", restSec: REST_CORE },
          { name: "Tuck crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      rest("Día 3 · Descanso"),
      {
        name: "Día 4 · Torso B",
        focus: "tracción dominante",
        type: "gym",
        exercises: [
          { name: "Chin-up", sets: 4, reps: "máx", restSec: REST_COMPOUND },
          { name: "Dumbbell bench press", sets: 4, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Dumbbell bent over row", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable rear delt row (with rope)", sets: 3, reps: "15-20", restSec: REST_CORE },
          { name: "Barbell curl", sets: 3, reps: "10-12", restSec: REST_CORE },
          { name: "Cable pushdown", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 5 · Pierna B",
        focus: "glúteo/femoral dominante",
        type: "gym",
        exercises: [
          { name: "Barbell romanian deadlift", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell glute bridge", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Barbell lunge", sets: 3, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Lever leg extension", sets: 3, reps: "15", restSec: REST_CORE },
          { name: "Cable standing calf raise", sets: 4, reps: "15-20", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "gluteo-pierna-3",
    group: "gimnasio",
    name: "Glúteo y pierna · 3 días",
    emoji: "🍑",
    level: "Intermedio",
    daysPerWeek: 3,
    description:
      "Tres días centrados en el tren inferior: glúteo, cuádriceps y femoral. Con algo de core al final de cada sesión.",
    days: [
      {
        name: "Día 1 · Glúteo",
        focus: "glúteo dominante",
        type: "gym",
        exercises: [
          { name: "Barbell glute bridge", sets: 4, reps: "8-12", restSec: REST_COMPOUND },
          { name: "Barbell romanian deadlift", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell lunge", sets: 3, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Cable standing calf raise", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 2 · Cuádriceps",
        focus: "cuádriceps dominante",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Smith leg press", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Lever leg extension", sets: 3, reps: "15", restSec: REST_CORE },
          { name: "Dumbbell lunge", sets: 3, reps: "10 por pierna", restSec: REST_ISOLATION },
        ],
      },
      rest("Día 3 · Descanso"),
      {
        name: "Día 4 · Femoral y glúteo",
        focus: "cadena posterior",
        type: "gym",
        exercises: [
          { name: "Barbell deadlift", sets: 4, reps: "5-6", restSec: REST_HEAVY },
          { name: "Lever lying leg curl", sets: 4, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Barbell glute bridge", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Hanging leg raise", sets: 3, reps: "10-15", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "ppl-6",
    group: "gimnasio",
    name: "Push Pull Legs · 6 días",
    emoji: "🔥",
    level: "Avanzado",
    daysPerWeek: 6,
    description:
      "Empuje, tracción y pierna repetidos dos veces por semana. Máximo volumen para quien ya tiene experiencia y buena recuperación.",
    days: [
      {
        name: "Día 1 · Empuje",
        focus: "pecho · hombro · tríceps",
        type: "gym",
        exercises: [
          { name: "Barbell bench press", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Barbell seated overhead press", sets: 3, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Barbell incline bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell lateral raise", sets: 4, reps: "12-15", restSec: REST_CORE },
          { name: "Cable pushdown", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 2 · Tracción",
        focus: "espalda · bíceps",
        type: "gym",
        exercises: [
          { name: "Chin-up", sets: 4, reps: "máx", restSec: REST_COMPOUND },
          { name: "Barbell bent over row", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Cable bar lateral pulldown", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable rear delt row (with rope)", sets: 3, reps: "15-20", restSec: REST_CORE },
          { name: "Barbell curl", sets: 3, reps: "10-12", restSec: REST_CORE },
          { name: "Dumbbell hammer curl", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 3 · Pierna",
        focus: "cuádriceps · femoral · glúteo",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Barbell romanian deadlift", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Smith leg press", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Lever lying leg curl", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Cable standing calf raise", sets: 4, reps: "15-20", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 4 · Empuje",
        focus: "pecho · hombro · tríceps",
        type: "gym",
        exercises: [
          { name: "Dumbbell bench press", sets: 4, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Dumbbell standing overhead press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable cross-over variation", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Dumbbell lateral raise", sets: 4, reps: "15", restSec: REST_CORE },
          { name: "Barbell lying triceps extension", sets: 3, reps: "10-12", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 5 · Tracción",
        focus: "espalda · bíceps",
        type: "gym",
        exercises: [
          { name: "Dumbbell bent over row", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable seated row", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Cable bar lateral pulldown", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Dumbbell rear lateral raise", sets: 3, reps: "15-20", restSec: REST_CORE },
          { name: "Dumbbell biceps curl", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 6 · Pierna",
        focus: "cuádriceps · glúteo",
        type: "gym",
        exercises: [
          { name: "Barbell deadlift", sets: 4, reps: "5-6", restSec: REST_HEAVY },
          { name: "Barbell glute bridge", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Barbell lunge", sets: 3, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Lever leg extension", sets: 3, reps: "15", restSec: REST_CORE },
          { name: "Wheel rollerout", sets: 3, reps: "10-12", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "arnold-6",
    group: "gimnasio",
    name: "Arnold split · 6 días",
    emoji: "💪",
    level: "Avanzado",
    daysPerWeek: 6,
    description:
      "Clásico split de Arnold: pecho+espalda, hombro+brazos y pierna, dos veces por semana. Mucho volumen orientado a hipertrofia.",
    days: [
      {
        name: "Día 1 · Pecho + Espalda",
        type: "gym",
        exercises: [
          { name: "Barbell bench press", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell incline bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Chin-up", sets: 4, reps: "máx", restSec: REST_COMPOUND },
          { name: "Barbell bent over row", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell fly", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 2 · Hombro + Brazos",
        type: "gym",
        exercises: [
          { name: "Barbell seated overhead press", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Dumbbell lateral raise", sets: 4, reps: "12-15", restSec: REST_CORE },
          { name: "Barbell curl", sets: 3, reps: "10-12", restSec: REST_CORE },
          { name: "Barbell lying triceps extension", sets: 3, reps: "10-12", restSec: REST_CORE },
          { name: "Dumbbell hammer curl", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Cable pushdown", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 3 · Pierna",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Lever leg extension", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Lever lying leg curl", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Cable standing calf raise", sets: 4, reps: "15-20", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 4 · Pecho + Espalda",
        type: "gym",
        exercises: [
          { name: "Dumbbell bench press", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable cross-over variation", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Cable bar lateral pulldown", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cable seated row", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Dumbbell rear lateral raise", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 5 · Hombro + Brazos",
        type: "gym",
        exercises: [
          { name: "Barbell upright row", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell lateral raise", sets: 4, reps: "15", restSec: REST_CORE },
          { name: "Dumbbell biceps curl", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Three bench dip", sets: 3, reps: "máx", restSec: REST_CORE },
          { name: "Cable pushdown", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 6 · Pierna",
        type: "gym",
        exercises: [
          { name: "Barbell romanian deadlift", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Smith leg press", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Barbell lunge", sets: 3, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Cable standing calf raise", sets: 4, reps: "15-20", restSec: REST_CORE },
          { name: "Hanging leg raise", sets: 3, reps: "10-15", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "powerbuilding-4",
    group: "gimnasio",
    name: "Powerbuilding · 4 días",
    emoji: "🏆",
    level: "Avanzado",
    daysPerWeek: 4,
    description:
      "Combina fuerza en los grandes básicos (series pesadas) con accesorios de hipertrofia. Para ganar fuerza y músculo a la vez.",
    days: [
      {
        name: "Día 1 · Pecho pesado",
        focus: "empuje",
        type: "gym",
        exercises: [
          { name: "Barbell bench press", sets: 5, reps: "3-5", restSec: REST_HEAVY },
          { name: "Barbell incline bench press", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Dumbbell fly", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Cable pushdown", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 2 · Espalda pesada",
        focus: "tracción",
        type: "gym",
        exercises: [
          { name: "Barbell deadlift", sets: 5, reps: "3-5", restSec: REST_HEAVY },
          { name: "Barbell bent over row", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Cable bar lateral pulldown", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Barbell curl", sets: 3, reps: "10-12", restSec: REST_CORE },
        ],
      },
      rest("Día 3 · Descanso"),
      {
        name: "Día 4 · Pierna pesada",
        focus: "tren inferior",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 5, reps: "3-5", restSec: REST_HEAVY },
          { name: "Barbell romanian deadlift", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Lever leg extension", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Cable standing calf raise", sets: 4, reps: "15-20", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 5 · Hombro y brazos",
        focus: "accesorios",
        type: "gym",
        exercises: [
          { name: "Barbell seated overhead press", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Dumbbell lateral raise", sets: 4, reps: "12-15", restSec: REST_CORE },
          { name: "Dumbbell hammer curl", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Barbell lying triceps extension", sets: 3, reps: "10-12", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "core-abs-3",
    group: "casa",
    name: "Abdomen y core · 3 días",
    emoji: "🎯",
    level: "Principiante",
    daysPerWeek: 3,
    description:
      "Sesiones cortas centradas en el abdomen y el core. Úsala sola o como complemento de otra rutina o del cardio.",
    days: [
      {
        name: "Día 1 · Core A",
        type: "gym",
        exercises: [
          { name: "Tuck crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
          { name: "Reverse crunch", sets: 3, reps: "15", restSec: REST_CORE },
          { name: "Hanging leg raise", sets: 3, reps: "10-15", restSec: REST_CORE },
          { name: "Russian twist", sets: 3, reps: "20", restSec: REST_CORE },
        ],
      },
      rest("Día 2 · Descanso"),
      {
        name: "Día 3 · Core B",
        type: "gym",
        exercises: [
          { name: "Wheel rollerout", sets: 3, reps: "8-12", restSec: REST_CORE },
          { name: "Lying leg raise flat bench", sets: 3, reps: "15", restSec: REST_CORE },
          { name: "Oblique crunches floor", sets: 3, reps: "20", restSec: REST_CORE },
          { name: "Mountain climber", sets: 3, reps: "40s", restSec: REST_CORE },
        ],
      },
      rest("Día 4 · Descanso"),
      {
        name: "Día 5 · Core C",
        type: "gym",
        exercises: [
          { name: "Sit-up v. 2", sets: 3, reps: "20", restSec: REST_CORE },
          { name: "Hanging leg raise", sets: 3, reps: "12", restSec: REST_CORE },
          { name: "Reverse crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
          { name: "Russian twist", sets: 3, reps: "20", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "brazos-2",
    group: "gimnasio",
    name: "Bíceps y tríceps · 2 días",
    emoji: "💥",
    level: "Intermedio",
    daysPerWeek: 2,
    description:
      "Especialización de brazos dos días por semana para ganar volumen en bíceps y tríceps. Ideal como complemento de otra rutina.",
    days: [
      {
        name: "Día 1 · Brazos A",
        focus: "fuerza",
        type: "gym",
        exercises: [
          { name: "Barbell curl", sets: 4, reps: "8-12", restSec: REST_ISOLATION },
          { name: "Barbell lying triceps extension", sets: 4, reps: "8-12", restSec: REST_ISOLATION },
          { name: "Dumbbell biceps curl", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Cable pushdown", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Dumbbell hammer curl", sets: 3, reps: "12-15", restSec: REST_CORE },
        ],
      },
      rest("Día 2 · Descanso"),
      rest("Día 3 · Descanso"),
      {
        name: "Día 4 · Brazos B",
        focus: "volumen",
        type: "gym",
        exercises: [
          { name: "Chest dip", sets: 4, reps: "máx", restSec: REST_ISOLATION },
          { name: "Dumbbell hammer curl", sets: 4, reps: "10-12", restSec: REST_CORE },
          { name: "Cable pushdown", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Dumbbell biceps curl", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Three bench dip", sets: 3, reps: "máx", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "quema-grasa-4",
    group: "gimnasio",
    name: "Quema grasa · 4 días",
    emoji: "⚡",
    level: "Intermedio",
    daysPerWeek: 4,
    description:
      "Dos días de fuerza de cuerpo completo y dos de circuitos HIIT de alta intensidad para maximizar el gasto calórico.",
    days: [
      {
        name: "Día 1 · Fuerza cuerpo completo",
        focus: "fuerza",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Dumbbell bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Dumbbell bent over row", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Barbell seated overhead press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
        ],
      },
      {
        name: "Día 2 · HIIT",
        type: "cardio",
        exercises: [],
        cardioNote: "5 rondas: 40s burpees · 40s mountain climber · 40s jump squat · 60s descanso.",
      },
      {
        name: "Día 3 · Fuerza cuerpo completo",
        focus: "fuerza",
        type: "gym",
        exercises: [
          { name: "Barbell romanian deadlift", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Chin-up", sets: 3, reps: "máx", restSec: REST_COMPOUND },
          { name: "Dumbbell standing overhead press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Walking lunge", sets: 3, reps: "20 pasos", restSec: REST_ISOLATION },
        ],
      },
      {
        name: "Día 4 · HIIT",
        type: "cardio",
        exercises: [],
        cardioNote: "Tabata 20s/10s × 8 en 4 ejercicios: sentadilla con salto, flexiones, mountain climber y plancha.",
      },
    ],
  },
  {
    id: "gym-cardio-5",
    group: "gimnasio",
    name: "Fuerza + cardio · 5 días",
    emoji: "🏃",
    level: "Intermedio",
    daysPerWeek: 5,
    description:
      "Combina tres sesiones de fuerza con dos de cardio. Pensada para mejorar la salud cardiovascular sin perder músculo.",
    days: [
      {
        name: "Día 1 · Fuerza torso",
        focus: "empuje + tracción",
        type: "gym",
        exercises: [
          { name: "Barbell bench press", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Barbell bent over row", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Barbell seated overhead press", sets: 3, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Cable bar lateral pulldown", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
        ],
      },
      {
        name: "Día 2 · Cardio",
        type: "cardio",
        exercises: [],
        cardioNote: "30-40 min a ritmo suave (zona 2) o 5-6 km trotando.",
      },
      {
        name: "Día 3 · Fuerza pierna",
        focus: "tren inferior",
        type: "gym",
        exercises: [
          { name: "Barbell full squat", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Barbell romanian deadlift", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Smith leg press", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Cable standing calf raise", sets: 4, reps: "15-20", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 4 · Cardio (series)",
        type: "cardio",
        exercises: [],
        cardioNote: "Interválico: 6-8 × 400 m fuerte con 90 s de recuperación.",
      },
      {
        name: "Día 5 · Fuerza cuerpo completo",
        focus: "general + core",
        type: "gym",
        exercises: [
          { name: "Chin-up", sets: 3, reps: "máx", restSec: REST_COMPOUND },
          { name: "Dumbbell bench press", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Barbell glute bridge", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Russian twist", sets: 3, reps: "20", restSec: REST_CORE },
          { name: "Hanging leg raise", sets: 3, reps: "10-15", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "casa-fullbody-bw-3",
    group: "casa",
    name: "Cuerpo completo en casa · 3 días",
    emoji: "🏡",
    level: "Principiante",
    daysPerWeek: 3,
    description:
      "Tres sesiones de cuerpo completo solo con el peso corporal (como mucho una silla para los fondos). Sin gimnasio ni material.",
    days: [
      {
        name: "Día 1 · Cuerpo completo A",
        type: "gym",
        exercises: [
          { name: "Push-up", sets: 4, reps: "máx", restSec: REST_ISOLATION },
          { name: "Split squats", sets: 3, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Low glute bridge on floor", sets: 3, reps: "15-20", restSec: REST_CORE },
          { name: "Superman push-up", sets: 3, reps: "12", restSec: REST_CORE },
          { name: "Reverse crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      rest("Día 2 · Descanso"),
      {
        name: "Día 3 · Cuerpo completo B",
        type: "gym",
        exercises: [
          { name: "Walking lunge", sets: 3, reps: "20 pasos", restSec: REST_ISOLATION },
          { name: "Three bench dip", sets: 3, reps: "máx", restSec: REST_ISOLATION },
          { name: "Jump squat", sets: 3, reps: "15", restSec: REST_CORE },
          { name: "Mountain climber", sets: 3, reps: "40s", restSec: REST_CORE },
          { name: "Tuck crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      rest("Día 4 · Descanso"),
      {
        name: "Día 5 · Cuerpo completo C",
        type: "gym",
        exercises: [
          { name: "Push-up", sets: 3, reps: "máx", restSec: REST_ISOLATION },
          { name: "Split squats", sets: 3, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Low glute bridge on floor", sets: 3, reps: "15-20", restSec: REST_CORE },
          { name: "Flutter kicks", sets: 3, reps: "30s", restSec: REST_CORE },
          { name: "Russian twist", sets: 3, reps: "20", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "casa-hiit-3",
    group: "casa",
    name: "Cardio HIIT en casa · 3 días",
    emoji: "💨",
    level: "Intermedio",
    daysPerWeek: 3,
    description:
      "Circuitos de alta intensidad sin material para quemar grasa y mejorar el fondo. Cada ejercicio son 40s a tope; repite las rondas indicadas.",
    days: [
      {
        name: "Día 1 · Circuito HIIT A",
        focus: "5 rondas · 40s por ejercicio",
        type: "gym",
        exercises: [
          { name: "Burpee", sets: 5, reps: "40s", restSec: REST_CORE },
          { name: "Mountain climber", sets: 5, reps: "40s", restSec: REST_CORE },
          { name: "Jump squat", sets: 5, reps: "40s", restSec: REST_CORE },
          { name: "High knee against wall", sets: 5, reps: "40s", restSec: REST_CORE },
        ],
      },
      rest("Día 2 · Descanso"),
      {
        name: "Día 3 · Circuito HIIT B",
        focus: "5 rondas · 40s por ejercicio",
        type: "gym",
        exercises: [
          { name: "Push-up", sets: 5, reps: "40s", restSec: REST_CORE },
          { name: "Split squats", sets: 5, reps: "40s", restSec: REST_CORE },
          { name: "Burpee", sets: 5, reps: "30s", restSec: REST_CORE },
          { name: "Reverse crunch", sets: 5, reps: "40s", restSec: REST_CORE },
        ],
      },
      rest("Día 4 · Descanso"),
      {
        name: "Día 5 · Circuito HIIT C",
        focus: "5 rondas · 40s por ejercicio",
        type: "gym",
        exercises: [
          { name: "Jump squat", sets: 5, reps: "40s", restSec: REST_CORE },
          { name: "Mountain climber", sets: 5, reps: "40s", restSec: REST_CORE },
          { name: "Walking lunge", sets: 5, reps: "40s", restSec: REST_CORE },
          { name: "Flutter kicks", sets: 5, reps: "40s", restSec: REST_CORE },
        ],
      },
    ],
  },
  {
    id: "casa-cardio-fuerza-4",
    group: "casa",
    name: "Cardio + fuerza en casa · 4 días",
    emoji: "🏃‍♂️",
    level: "Intermedio",
    daysPerWeek: 4,
    description:
      "Dos días de fuerza con mancuernas/peso corporal y dos de cardio, todo en casa. Salud cardiovascular sin perder músculo.",
    days: [
      {
        name: "Día 1 · Fuerza (mancuernas)",
        focus: "cuerpo completo",
        type: "gym",
        exercises: [
          { name: "Dumbbell goblet squat", sets: 3, reps: "12", restSec: REST_COMPOUND },
          { name: "Push-up", sets: 3, reps: "máx", restSec: REST_ISOLATION },
          { name: "Dumbbell bent over row", sets: 3, reps: "12", restSec: REST_ISOLATION },
          { name: "Dumbbell standing overhead press", sets: 3, reps: "12", restSec: REST_ISOLATION },
          { name: "Reverse crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 2 · Cardio HIIT",
        type: "cardio",
        exercises: [],
        cardioNote: "5 rondas: 40s burpees · 40s mountain climber · 40s jump squat · 60s descanso.",
      },
      {
        name: "Día 3 · Fuerza (mancuernas)",
        focus: "cuerpo completo",
        type: "gym",
        exercises: [
          { name: "Dumbbell romanian deadlift", sets: 3, reps: "12", restSec: REST_COMPOUND },
          { name: "Walking lunge", sets: 3, reps: "20 pasos", restSec: REST_ISOLATION },
          { name: "Three bench dip", sets: 3, reps: "máx", restSec: REST_ISOLATION },
          { name: "Dumbbell biceps curl", sets: 3, reps: "12-15", restSec: REST_CORE },
          { name: "Tuck crunch", sets: 3, reps: "15-20", restSec: REST_CORE },
        ],
      },
      {
        name: "Día 4 · Cardio",
        type: "cardio",
        exercises: [],
        cardioNote: "30-40 min de carrera suave, o intervalos 8 × (1 min fuerte / 1 min andando).",
      },
    ],
  },
];
