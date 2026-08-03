import type { Exercise, GeneratedSession, MuscleGroup, SessionPreferences, WorkoutExercise } from "./types";

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

export function generateSession(preferences: SessionPreferences, library: Exercise[]): GeneratedSession {
  const circuit = preferences.participants > 1;
  const strengthMinutes = preferences.focus === "cardio" ? 0 : preferences.focus === "mixto" ? Math.round(preferences.durationMin * 0.65) : preferences.durationMin;
  const cardioMinutes = preferences.focus === "cardio" ? preferences.durationMin : preferences.focus === "mixto" ? preferences.durationMin - strengthMinutes : 0;
  const exerciseCount = preferences.focus === "cardio" && circuit
    ? Math.max(4, Math.min(8, preferences.participants + 2))
    : strengthMinutes === 0 ? 0 : Math.max(4, Math.min(9, Math.round(strengthMinutes / (circuit ? 6 : 7))));
  const groups = preferences.focus === "cardio" && circuit
    ? (["cardio"] as MuscleGroup[])
    : preferences.goal === "movilidad"
    ? (["pierna", "hombro", "espalda", "core"] as MuscleGroup[])
    : preferences.goal === "ganar musculo" || preferences.goal === "fuerza"
      ? GROUP_ORDER
      : (["pierna", "pecho", "espalda", "gluteo", "core", "hombro"] as MuscleGroup[]);

  const pool = library.filter((exercise) => groups.includes(exercise.muscleGroup) && equipmentMatches(exercise, preferences.equipment));
  const chosen: Exercise[] = [];
  for (const group of groups) {
    const option = shuffle(pool.filter((exercise) => exercise.muscleGroup === group && !chosen.includes(exercise)))[0];
    if (option) chosen.push(option);
    if (chosen.length >= exerciseCount) break;
  }
  if (chosen.length < exerciseCount) {
    chosen.push(...shuffle(pool.filter((exercise) => !chosen.includes(exercise))).slice(0, exerciseCount - chosen.length));
  }

  const sets = preferences.participants > 1 ? 3 : preferences.level === "principiante" ? 3 : preferences.level === "intermedio" ? 4 : 5;
  const reps = preferences.goal === "fuerza" ? 6 : preferences.goal === "movilidad" ? 10 : preferences.level === "principiante" ? 10 : 12;
  const exercises: WorkoutExercise[] = chosen.map((exercise) => ({
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets: Array.from({ length: sets }, () => ({ weight: 0, reps, done: false })),
  }));
  const intensity = preferences.energy === "baja" ? "suave" : preferences.energy === "alta" ? "exigente" : "progresiva";
  const placeLabel = preferences.place === "gimnasio" ? "gimnasio" : preferences.place === "casa" ? "casa" : "exterior";
  const focusLabel = preferences.focus === "musculacion" ? "Fuerza" : preferences.focus === "cardio" ? "Cardio" : "Mixto";

  return {
    name: circuit ? `${focusLabel} · circuito de ${Math.max(exercises.length, 4)} estaciones` : `${focusLabel} en ${placeLabel}`,
    description: circuit
      ? `${preferences.participants} personas: rotad de estación cada 45–60 segundos y descansad 60–90 segundos al completar cada vuelta.`
      : `Sesión ${intensity} de ${preferences.durationMin} minutos para ${preferences.profileName}. Empieza con 5 minutos de calentamiento y termina con movilidad suave.`,
    focus: preferences.focus,
    durationMin: preferences.durationMin,
    exercises,
    cardioMinutes,
    rounds: circuit ? sets : undefined,
    profileId: preferences.profileId,
    profileName: preferences.profileName,
  };
}
