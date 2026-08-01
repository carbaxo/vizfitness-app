"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import ExerciseImage from "@/components/ExerciseImage";
import { useAuth } from "@/context/AuthContext";
import { addExercise, deleteExercise, useCustomExercises } from "@/lib/db";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from "@/lib/types";

export default function EjerciciosPage() {
  return (
    <AppShell>
      <Ejercicios />
    </AppShell>
  );
}

function Ejercicios() {
  const { user } = useAuth();
  const { data: custom } = useCustomExercises();
  const { library, loading } = useExerciseLibrary();
  const [group, setGroup] = useState<MuscleGroup | "todos">("todos");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [newGroup, setNewGroup] = useState<MuscleGroup>("pecho");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");

  const all: Exercise[] = useMemo(
    () => [...custom.map((e) => ({ ...e, custom: true })), ...library],
    [custom, library]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter(
      (e) =>
        (group === "todos" || e.muscleGroup === group) &&
        (q === "" ||
          e.name.toLowerCase().includes(q) ||
          e.equipment?.toLowerCase().includes(q) ||
          e.target?.toLowerCase().includes(q))
    );
  }, [all, group, search]);

  const create = async () => {
    if (!user || !name.trim()) return;
    await addExercise(user.uid, {
      name: name.trim(),
      muscleGroup: newGroup,
      equipment: equipment.trim() || undefined,
      instructions: instructions.trim() || undefined,
      custom: true,
    });
    setName("");
    setEquipment("");
    setInstructions("");
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Biblioteca de ejercicios</h1>
          <p className="text-sm text-slate-400">
            {loading
              ? "Cargando ejercicios…"
              : `${all.length.toLocaleString("es-ES")} ejercicios con imágenes y técnica`}
          </p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary shrink-0">
          {showForm ? "Cancelar" : "+ Crear"}
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <p className="font-semibold">Nuevo ejercicio personalizado</p>
          <input
            className="input"
            placeholder="Nombre del ejercicio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input capitalize"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value as MuscleGroup)}
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g} className="capitalize">
                  {g}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Equipamiento (opcional)"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            />
          </div>
          <textarea
            className="input"
            rows={2}
            placeholder="Instrucciones o notas de técnica (opcional)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <button onClick={create} disabled={!name.trim()} className="btn-primary">
            Guardar ejercicio
          </button>
        </div>
      )}

      <input
        className="input"
        placeholder="🔍 Buscar por nombre, músculo o equipo…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setGroup("todos")}
          className={`chip capitalize ${
            group === "todos" ? "bg-accent/20 text-accent" : "bg-base-800 text-slate-400"
          }`}
        >
          todos
        </button>
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`chip capitalize ${
              group === g ? "bg-accent/20 text-accent" : "bg-base-800 text-slate-400"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((e, i) => (
          <button
            key={`${e.id ?? e.name}-${i}`}
            onClick={() => setDetail(e)}
            className="card press group !p-0 overflow-hidden text-left hover:border-accent/40"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <ExerciseImage
                media={e.media}
                alt={e.name}
                className="h-full w-full transition-transform group-hover:scale-105"
              />
              {e.custom && (
                <span className="absolute right-1.5 top-1.5 chip bg-accent/80 text-[10px] text-white">
                  propio
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-semibold leading-tight">{e.name}</p>
              <p className="mt-1 text-xs capitalize text-slate-400">
                {e.muscleGroup}
                {e.equipment ? ` · ${e.equipment}` : ""}
              </p>
            </div>
          </button>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full text-sm text-slate-400">
            No hay ejercicios que coincidan.
          </p>
        )}
      </div>

      {detail && (
        <ExerciseDetail
          exercise={detail}
          onClose={() => setDetail(null)}
          onDelete={
            detail.custom && detail.id
              ? () => {
                  if (user) deleteExercise(user.uid, detail.id!);
                  setDetail(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function ExerciseDetail({
  exercise,
  onClose,
  onDelete,
}: {
  exercise: Exercise;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const steps = exercise.steps?.length
    ? exercise.steps
    : exercise.instructions
      ? [exercise.instructions]
      : [];

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <div className="min-h-0 flex-1 overflow-y-auto scroll-momentum">
          <div className="relative">
            <div className="aspect-square w-full overflow-hidden sm:aspect-video">
              <ExerciseImage
                media={exercise.media}
                alt={exercise.name}
                alwaysAnimate
                className="h-full w-full"
              />
            </div>
            <button
              onClick={onClose}
              className="press absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-black/50 text-lg text-white backdrop-blur"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-bold">{exercise.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip capitalize bg-accent/15 text-accent">
                {exercise.muscleGroup}
              </span>
              {exercise.equipment && (
                <span className="chip bg-base-800 text-slate-300">{exercise.equipment}</span>
              )}
              {exercise.target && (
                <span className="chip bg-base-800 text-slate-300">🎯 {exercise.target}</span>
              )}
            </div>
          </div>

          {steps.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-300">Cómo se hace</p>
              <ol className="space-y-2">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {exercise.secondary && exercise.secondary.length > 0 && (
            <p className="text-xs text-slate-500">
              Músculos secundarios: {exercise.secondary.join(", ")}
            </p>
          )}

          {onDelete && (
            <button onClick={onDelete} className="btn-danger w-full">
              Eliminar ejercicio
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
