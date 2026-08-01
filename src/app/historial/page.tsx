"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import WorkoutCard from "@/components/WorkoutCard";
import { useWorkouts } from "@/lib/db";

export default function HistorialPage() {
  return (
    <AppShell>
      <Historial />
    </AppShell>
  );
}

function Historial() {
  const { data: workouts, loading } = useWorkouts();
  const [filter, setFilter] = useState<"todos" | "gym" | "circuito" | "cardio">("todos");

  const filtered = workouts.filter((w) => filter === "todos" || w.type === filter);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Historial</h1>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["todos", "Todos"],
            ["gym", "🏋️ Gimnasio"],
            ["circuito", "🔥 Estaciones"],
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
