"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import ExerciseImage from "@/components/ExerciseImage";
import ExerciseDetailView from "@/components/ExerciseDetailView";
import { useAuth } from "@/context/AuthContext";
import { addExercise, deleteExercise, useCustomExercises } from "@/lib/db";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from "@/lib/types";
import Icon from "@/components/Icon";

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
      <div className="flex items-center justify-between">
        <div><p className="section-kicker">Técnica y movimiento</p><h1 className="text-3xl font-extrabold tracking-tight">Biblioteca de ejercicios</h1><p className="mt-1 text-sm text-slate-400">{loading ? "Cargando ejercicios…" : `${all.length.toLocaleString("es-ES")} ejercicios con GIF y técnica animada`}</p></div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
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

      <div className="relative"><Icon name="book" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input aria-label="Buscar ejercicio" className="input !pl-10" placeholder="Buscar ejercicio…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setGroup("todos")}
          aria-pressed={group === "todos"}
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
            aria-pressed={group === g}
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
          <button key={`${e.id ?? e.name}-${i}`} onClick={() => setDetail(e)} className="exercise-card card press group overflow-hidden !p-0 text-left transition hover:-translate-y-0.5 hover:border-accent/40">
            <div className="relative aspect-square overflow-hidden bg-white">
              <ExerciseImage media={e.media} alt={e.name} alwaysAnimate className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
              {e.media && <span className="absolute bottom-2 left-2 chip bg-black/65 text-[10px] uppercase tracking-wide text-white backdrop-blur">GIF</span>}
              {e.custom && <span className="absolute right-2 top-2 chip bg-accent/90 text-[10px] text-base-950">propio</span>}
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-semibold leading-tight">{e.name}</p>
              <p className="mt-1 text-xs capitalize text-slate-400">{e.muscleGroup}{e.equipment ? ` · ${e.equipment}` : ""}</p>
            </div>
          </button>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full text-sm text-slate-400">No hay ejercicios que coincidan.</p>
        )}
      </div>

      {detail && (
        <div className="sheet-backdrop" onClick={() => setDetail(null)}>
          <div className="sheet" onClick={(event) => event.stopPropagation()}>
            <div className="grabber" />
            <div className="relative min-h-0 flex-1 overflow-y-auto scroll-momentum">
              <button onClick={() => setDetail(null)} className="press absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur" aria-label="Cerrar">✕</button>
              <ExerciseDetailView name={detail.name} exercise={detail} />
              {detail.custom && detail.id && (
                <div className="px-5 pb-5"><button onClick={() => { if (user) deleteExercise(user.uid, detail.id!); setDetail(null); }} className="btn-danger w-full">Eliminar ejercicio</button></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
