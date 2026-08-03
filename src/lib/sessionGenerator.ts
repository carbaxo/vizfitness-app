import type { Exercise, GeneratedSession, MuscleGroup, SessionPreferences, WodStation, WorkoutExercise } from "./types";

const GROUP_ORDER: MuscleGroup[] = ["pierna", "pecho", "espalda", "gluteo", "hombro", "core", "biceps", "triceps"];

const equipmentMatches = (exercise: Exercise, selected: string[]) => {
  if (selected.length === 0) return true;
  const value = (exercise.equipment ?? "peso corporal").toLowerCase();
  return selected.some((item) => {
    if (item === "peso corporal") return value.includes("peso corporal") || value.includes("body");
    if (item === "mancuernas") return value.includes("mancuerna") || value.includes("dumbbell");
    if (item === "bandas") return value.includes("banda") || value.includes("band");
    if (item === "barra") return value.includes("barra") || value.includes("barbell");
    if (item === "maquinas") return value.includes("máquina") || value.includes("machine") || value.includes("polea") || value.includes("cable");
    return true;
  });
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function chooseExercises(library: Exercise[], groups: MuscleGroup[], equipment: string[], count: number) {
  const pool = library.filter((exercise) => groups.includes(exercise.muscleGroup) && equipmentMatches(exercise, equipment));
  const chosen: Exercise[] = [];
  for (const group of groups) {
    const option = shuffle(pool.filter((exercise) => exercise.muscleGroup === group && !chosen.includes(exercise)))[0];
    if (option) chosen.push(option);
    if (chosen.length >= count) break;
  }
  if (chosen.length < count) chosen.push(...shuffle(pool.filter((exercise) => !chosen.includes(exercise))).slice(0, count - chosen.length));
  return chosen;
}

function wodTiming(format: SessionPreferences["format"]) {
  if (format === "tabata") return { workSec: 20, restSec: 10 };
  if (format === "emom") return { workSec: 45, restSec: 15 };
  return { workSec: 0, restSec: 0 };
}

export function generateSession(preferences: SessionPreferences, library: Exercise[]): GeneratedSession {
  const isWod = preferences.format !== "clasico";
  const circuit = preferences.participants > 1;
  const focusLabel = preferences.focus === "musculacion" ? "Fuerza" : preferences.focus === "cardio" ? "Cardio" : "Mixto";
  const placeLabel = preferences.place === "gimnasio" ? "gimnasio" : preferences.place === "casa" ? "casa" : "exterior";

  if (isWod) {
    const wodFormat = preferences.format as Exclude<SessionPreferences["format"], "clasico">;
    const stationCount = preferences.format === "hyrox" ? 8 : preferences.level === "principiante" ? 5 : preferences.level === "intermedio" ? 6 : 8;
    const groups: MuscleGroup[] = preferences.format === "hyrox" || preferences.focus !== "musculacion"
      ? ["cardio", "pierna", "cuerpo completo", "core", "gluteo", "hombro", "espalda", "pecho"]
      : GROUP_ORDER;
    const chosen = chooseExercises(library, groups, preferences.equipment, stationCount);
    const timing = wodTiming(wodFormat);
    const targetReps = preferences.level === "principiante" ? 10 : preferences.level === "intermedio" ? 12 : 15;
    const stations: WodStation[] = chosen.map((exercise, index) => ({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      workSec: timing.workSec,
      restSec: timing.restSec,
      target: wodFormat === "hyrox" && exercise.muscleGroup === "cardio"
        ? index % 2 === 0 ? "500 m o 2 min" : "45–60 s"
        : wodFormat === "tabata" || wodFormat === "emom"
          ? `${timing.workSec} s de trabajo`
          : `${targetReps} repeticiones`,
    }));
    const rounds = wodFormat === "for-time" ? 3 : wodFormat === "tabata" ? 4 : wodFormat === "emom" ? Math.max(2, Math.round(preferences.durationMin / Math.max(stations.length, 1))) : wodFormat === "hyrox" ? 1 : undefined;
    const formatName = { "for-time": "For Time", amrap: "AMRAP", emom: "EMOM", tabata: "Tabata", hyrox: "HYROX" }[wodFormat];
    const exercises: WorkoutExercise[] = stations.map((station) => ({ name: station.name, muscleGroup: station.muscleGroup, sets: [{ weight: 0, reps: targetReps, done: false }] }));
    return {
      name: `${formatName} · ${stations.length} estaciones`,
      description: wodFormat === "amrap"
        ? `Completa tantas rondas como puedas en ${preferences.durationMin} minutos, manteniendo una técnica limpia.`
        : wodFormat === "hyrox"
          ? "Sesión híbrida inspirada en HYROX: alterna esfuerzos de cardio con estaciones funcionales y completa el recorrido por tiempo."
          : `${formatName} adaptado a nivel ${preferences.level}, con ${circuit ? `${preferences.participants} participantes` : "un participante"}.`,
      focus: preferences.focus,
      format: wodFormat,
      durationMin: preferences.durationMin,
      exercises,
      stations,
      rounds,
      cardioMinutes: preferences.focus !== "musculacion" ? Math.round(preferences.durationMin * 0.4) : 0,
      profileId: preferences.profileId,
      profileName: preferences.profileName,
    };
  }

  const strengthMinutes = preferences.focus === "cardio" ? 0 : preferences.focus === "mixto" ? Math.round(preferences.durationMin * 0.65) : preferences.durationMin;
  const cardioMinutes = preferences.focus === "cardio" ? preferences.durationMin : preferences.focus === "mixto" ? preferences.durationMin - strengthMinutes : 0;
  const exerciseCount = preferences.focus === "cardio" && circuit ? Math.max(4, Math.min(8, preferences.participants + 2)) : strengthMinutes === 0 ? 0 : Math.max(4, Math.min(9, Math.round(strengthMinutes / (circuit ? 6 : 7))));
  const groups = preferences.focus === "cardio" && circuit ? (["cardio"] as MuscleGroup[]) : preferences.goal === "movilidad" ? (["pierna", "hombro", "espalda", "core"] as MuscleGroup[]) : preferences.goal === "ganar musculo" || preferences.goal === "fuerza" ? GROUP_ORDER : (["pierna", "pecho", "espalda", "gluteo", "core", "hombro"] as MuscleGroup[]);
  const chosen = chooseExercises(library, groups, preferences.equipment, exerciseCount);
  const sets = circuit ? 3 : preferences.level === "principiante" ? 3 : preferences.level === "intermedio" ? 4 : 5;
  const reps = preferences.goal === "fuerza" ? 6 : preferences.goal === "movilidad" ? 10 : preferences.level === "principiante" ? 10 : 12;
  const exercises: WorkoutExercise[] = chosen.map((exercise) => ({ name: exercise.name, muscleGroup: exercise.muscleGroup, sets: Array.from({ length: sets }, () => ({ weight: 0, reps, done: false })) }));
  const intensity = preferences.energy === "baja" ? "suave" : preferences.energy === "alta" ? "exigente" : "progresiva";
  return {
    name: circuit ? `${focusLabel} · circuito de ${Math.max(exercises.length, 4)} estaciones` : `${focusLabel} en ${placeLabel}`,
    description: circuit ? `${preferences.participants} personas: rotad de estación cada 45–60 segundos y descansad 60–90 segundos al completar cada vuelta.` : `Sesión ${intensity} de ${preferences.durationMin} minutos para ${preferences.profileName}. Empieza con 5 minutos de calentamiento y termina con movilidad suave.`,
    focus: preferences.focus,
    format: "clasico",
    durationMin: preferences.durationMin,
    exercises,
    cardioMinutes,
    rounds: circuit ? sets : undefined,
    profileId: preferences.profileId,
    profileName: preferences.profileName,
  };
}
