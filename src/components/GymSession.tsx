"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addWorkout, useCustomExercises, usePlans } from "@/lib/db";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import { isoDate, workoutVolumeKg } from "@/lib/stats";
import type { SetEntry, Workout, WorkoutExercise } from "@/lib/types";
import ExerciseImage from "./ExerciseImage";
import RestTimer from "./RestTimer";

export default function GymSession() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: customExercises } = useCustomExercises();
  const { library } = useExerciseLibrary();
  const { data: plans } = usePlans();

  const [name, setName] = useState("Sesión de gimnasio");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [notes, setNotes] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [picker, setPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Cronómetro de sesión
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  // Precargar rutina si venimos de un plan: /entrenar?plan=<id>&dia=<n>
  const planId = searchParams.get("plan");
  const dayIdx = searchParams.get("dia");
  useEffect(() => {
    if (!planId || dayIdx === null || exercises.length > 0) return;
    const plan = plans.find((p) => p.id === planId);
    const day = plan?.days[Number(dayIdx)];
    if (!plan || !day) return;
    setName(`${plan.name} · ${day.name}`);
    setExercises(
      day.exercises.map((e) => ({
        name: e.name,
        sets: Array.from({ length: e.sets }, () => ({ weight: 0, reps: 0, done: false })),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, dayIdx, plans]);

  const allExercises = useMemo(() => {
    const custom = customExercises.map((e) => ({ ...e, custom: true }));
    const q = search.toLowerCase();
    return [...custom, ...library]
      .filter((e) => e.name.toLowerCase().includes(q))
      .slice(0, 60);
  }, [customExercises, library, search]);

  const addExerciseToSession = (exName: string, muscleGroup?: WorkoutExercise["muscleGroup"]) => {
    setExercises((xs) => [
      ...xs,
      { name: exName, muscleGroup, sets: [{ weight: 0, reps: 0, done: false }] },
    ]);
    setPicker(false);
    setSearch("");
  };

  const updateSet = (ei: number, si: number, patch: Partial<SetEntry>) => {
    setExercises((xs) =>
      xs.map((ex, i) =>
        i !== ei
          ? ex
          : { ...ex, sets: ex.sets.map((s, j) => (j !== si ? s : { ...s, ...patch })) }
      )
    );
  };

  const addSet = (ei: number) => {
    setExercises((xs) =>
      xs.map((ex, i) => {
        if (i !== ei) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 0, done: false }],
        };
      })
    );
  };

  const removeSet = (ei: number, si: number) => {
    setExercises((xs) =>
      xs.map((ex, i) =>
        i !== ei ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== si) }
      )
    );
  };

  const removeExercise = (ei: number) => {
    setExercises((xs) => xs.filter((_, i) => i !== ei));
  };

  const save = async () => {
    if (!user || exercises.length === 0) return;
    setSaving(true);
    try {
      const cleaned = exercises
        .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.reps > 0) }))
        .filter((ex) => ex.sets.length > 0);
      if (cleaned.length === 0) {
        alert("Registra al menos una serie con repeticiones antes de guardar.");
        setSaving(false);
        return;
      }
      const workout: Omit<Workout, "id"> = {
        type: "gym",
        name: name.trim() || "Sesión de gimnasio",
        date: isoDate(new Date()),
        durationMin: Math.max(1, Math.round(elapsed / 60000)),
        exercises: cleaned,
        createdAt: Date.now(),
      };
      if (notes.trim()) workout.notes = notes.trim();
      workout.volumeKg = workoutVolumeKg(workout as Workout);
      await addWorkout(user.uid, workout);
      router.push("/");
    } catch (e) {
      alert("No se pudo guardar el entrenamiento. Inténtalo de nuevo.");
      console.error(e);
      setSaving(false);
    }
  };

  const mm = Math.floor(elapsed / 60000);
  const ss = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");
  const totalVolume = exercises.reduce(
    (a, ex) => a + ex.sets.reduce((b, s) => b + s.weight * s.reps, 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <input
          className="input max-w-xs !bg-transparent !border-0 !px-0 !text-lg !font-semibold"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nombre de la sesión"
        />
        <div className="flex items-center gap-4 text-sm">
          <span className="font-bold tabular-nums text-gym">
            ⏱ {mm}:{ss}
          </span>
          <span className="text-slate-400">
            {Math.round(totalVolume).toLocaleString("es-ES")} kg
          </span>
        </div>
      </div>

      <RestTimer />

      {exercises.map((ex, ei) => (
        <div key={ei} className="card">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{ex.name}</p>
            <button
              onClick={() => removeExercise(ei)}
              className="text-xs text-red-400 hover:underline"
            >
              Quitar
            </button>
          </div>
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem_2rem] items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <span>#</span>
              <span>Peso (kg)</span>
              <span>Reps</span>
              <span className="text-center">✓</span>
              <span />
            </div>
            {ex.sets.map((s, si) => (
              <div
                key={si}
                className="grid grid-cols-[2rem_1fr_1fr_2.5rem_2rem] items-center gap-2"
              >
                <span className="text-sm text-slate-400">{si + 1}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  className="input !py-1.5"
                  value={s.weight || ""}
                  placeholder="0"
                  onChange={(e) => updateSet(ei, si, { weight: Number(e.target.value) })}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className="input !py-1.5"
                  value={s.reps || ""}
                  placeholder="0"
                  onChange={(e) => updateSet(ei, si, { reps: Number(e.target.value) })}
                />
                <button
                  onClick={() => updateSet(ei, si, { done: !s.done })}
                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg border text-sm ${
                    s.done
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-base-600 text-slate-500"
                  }`}
                  aria-label="Marcar serie completada"
                >
                  ✓
                </button>
                <button
                  onClick={() => removeSet(ei, si)}
                  className="text-center text-slate-500 hover:text-red-400"
                  aria-label="Eliminar serie"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => addSet(ei)} className="btn-secondary mt-3 !px-3 !py-1.5 !text-xs">
            + Añadir serie
          </button>
        </div>
      ))}

      {picker ? (
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Elegir ejercicio</p>
            <button onClick={() => setPicker(false)} className="text-sm text-slate-400">
              Cancelar
            </button>
          </div>
          <input
            autoFocus
            className="input mt-3"
            placeholder="Buscar ejercicio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {allExercises.map((e, i) => (
              <button
                key={`${e.name}-${i}`}
                onClick={() => addExerciseToSession(e.name, e.muscleGroup)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-base-800"
              >
                <ExerciseImage
                  media={e.media}
                  alt={e.name}
                  className="h-10 w-10 shrink-0 rounded-lg"
                />
                <span className="min-w-0 flex-1 truncate">
                  {e.name}
                  {e.custom && <span className="ml-2 chip bg-accent/15 text-accent">propio</span>}
                </span>
                <span className="shrink-0 text-xs capitalize text-slate-500">{e.muscleGroup}</span>
              </button>
            ))}
            {search && (
              <button
                onClick={() => addExerciseToSession(search)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-accent hover:bg-base-800"
              >
                + Usar “{search}”
              </button>
            )}
          </div>
        </div>
      ) : (
        <button onClick={() => setPicker(true)} className="btn-secondary w-full">
          + Añadir ejercicio
        </button>
      )}

      <textarea
        className="input"
        rows={2}
        placeholder="Notas de la sesión (sensaciones, energía…)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={save}
        disabled={saving || exercises.length === 0}
        className="btn-primary w-full py-3 text-base"
      >
        {saving ? "Guardando…" : "Finalizar y guardar sesión"}
      </button>
    </div>
  );
}
