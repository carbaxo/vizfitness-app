"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import WorkoutCard from "@/components/WorkoutCard";
import { useWorkouts } from "@/lib/db";
import Icon from "@/components/Icon";

export default function HistorialPage() {
  return (
    <AppShell>
      <Historial />
    </AppShell>
  );
}

function Historial() {
  const { data: workouts, loading } = useWorkouts();
  const [filter, setFilter] = useState<"todos" | "gym" | "cardio">("todos");

  const filtered = workouts.filter((w) => filter === "todos" || w.type === filter);

  return (
    <div className="space-y-5">
      <div><p className="section-kicker">Tu actividad</p><h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight"><Icon name="history" className="h-7 w-7 text-accent" />Historial</h1><p className="mt-1 text-sm text-slate-400">Todas tus sesiones, marcas y recorridos en un solo lugar.</p></div>

      <div className="flex gap-2">
        {(
          [
            ["todos", "Todos"],
            ["gym", "🏋️ Gimnasio"],
            ["cardio", "🏃 Cardio"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`chip ${
              filter === value ? "bg-accent/20 text-accent" : "bg-base-800 text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No hay entrenamientos.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}
    </div>
  );
}
