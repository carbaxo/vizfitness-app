"use client";

import { useMemo, useState } from "react";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import type { MuscleGroup } from "@/lib/types";
import ExerciseImage from "./ExerciseImage";

// Selector visual de ejercicios de la biblioteca: se elige por imagen, no solo
// por el nombre. Sugiere el mismo grupo muscular por defecto y busca en todos.
export default function ExercisePicker({
  preferredGroup,
  onPick,
}: {
  preferredGroup?: MuscleGroup;
  onPick: (name: string) => void;
}) {
  const { library } = useExerciseLibrary();
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return library
      .filter((e) =>
        q
          ? e.name.toLowerCase().includes(q) ||
            e.target?.toLowerCase().includes(q) ||
            e.equipment?.toLowerCase().includes(q)
          : preferredGroup
            ? e.muscleGroup === preferredGroup
            : true
      )
      .slice(0, 60);
  }, [library, search, preferredGroup]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="p-4">
        <input
          autoFocus
          className="input"
          placeholder="🔍 Buscar por nombre, músculo o equipo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!search && preferredGroup && (
          <p className="mt-2 text-xs text-slate-500">
            Sugerencias de <span className="capitalize">{preferredGroup}</span> · busca para
            ver todos
          </p>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 pb-4 scroll-momentum">
        {list.map((e, i) => (
          <button
            key={`${e.id ?? e.name}-${i}`}
            onClick={() => onPick(e.name)}
            className="press flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-base-800"
          >
            <ExerciseImage media={e.media} alt={e.name} className="h-11 w-11 shrink-0 rounded-xl" />
            <span className="min-w-0 flex-1 truncate">{e.name}</span>
            <span className="shrink-0 text-xs capitalize text-slate-500">{e.muscleGroup}</span>
          </button>
        ))}
        {list.length === 0 && (
          <p className="px-2 py-6 text-sm text-slate-400">No hay ejercicios que coincidan.</p>
        )}
      </div>
    </div>
  );
}
