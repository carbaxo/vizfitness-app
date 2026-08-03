"use client";

import { useState } from "react";
import type { Workout } from "@/lib/types";
import { formatDateShort, formatDuration, pace } from "@/lib/stats";
import { useAuth } from "@/context/AuthContext";
import { deleteWorkout } from "@/lib/db";
import RouteMap from "./RouteMap";
import Icon from "./Icon";

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isCardio = workout.type === "cardio";

  const remove = async () => {
    if (!user || !workout.id) return;
    if (!confirm("¿Eliminar este entrenamiento? Esta acción no se puede deshacer.")) return;
    await deleteWorkout(user.uid, workout.id);
  };

  return (
    <div className="card transition hover:border-base-600/80">
      <button
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isCardio ? "bg-cardio/15 text-cardio" : "bg-gym/15 text-gym"}`}><Icon name={isCardio ? "run" : "dumbbell"} className="h-5 w-5" /></span>
          <div>
            <p className="font-semibold">{workout.name}</p>
            <p className="text-xs text-slate-400">
              {formatDateShort(workout.date)} · {formatDuration(workout.durationMin)}
              {workout.stravaId
                ? " · 🔗 Strava"
                : workout.healthConnectId
                  ? " · ⌚ Reloj"
                  : workout.gpxId
                    ? " · 📁 GPX"
                    : ""}
            </p>
            {workout.profileName && <span className="mt-1 inline-flex chip bg-accent/10 text-accent">{workout.profileName}</span>}
          </div>
        </div>
        <span
          className={`chip ${
            isCardio ? "bg-cardio/15 text-cardio" : "bg-gym/15 text-gym"
          }`}
        >
          {workout.wod ? workout.wod.format.toUpperCase() : isCardio ? "Cardio" : "Gimnasio"}
        </span>
      </button>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
        {isCardio && workout.cardio ? (
          <>
            <span>{workout.cardio.distanceKm} km</span>
            <span>{pace(workout.durationMin, workout.cardio.distanceKm)}</span>
            {workout.cardio.avgHr ? <span>{workout.cardio.avgHr} ppm</span> : null}
            {workout.cardio.calories ? <span className="inline-flex items-center gap-1"><Icon name="fire" className="h-3.5 w-3.5 text-cardio" />{workout.cardio.calories} kcal</span> : null}
          </>
        ) : workout.wod ? (
          <>
            <span className="font-semibold text-accent">{workout.wod.roundsCompleted} rondas</span>
            <span>{Math.floor(workout.wod.elapsedSec / 60)}:{String(workout.wod.elapsedSec % 60).padStart(2, "0")}</span>
            <span>{workout.wod.stations.length} estaciones</span>
          </>
        ) : (
          <>
            <span>{workout.exercises?.length ?? 0} ejercicios</span>
            <span>
              {workout.exercises?.reduce((a, e) => a + e.sets.length, 0) ?? 0} series
            </span>
            {workout.volumeKg ? (
              <span className="font-semibold text-accent">{Math.round(workout.volumeKg).toLocaleString("es-ES")} kg totales</span>
            ) : null}
          </>
        )}
      </div>

      {open && (
        <div className="mt-3 border-t border-base-700/60 pt-3">
          {isCardio && (workout.cardio?.route?.length ?? 0) > 1 && (
            <div className="mb-2">
              <RouteMap route={workout.cardio!.route!} />
            </div>
          )}
          {workout.wod ? (
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Resultado del WOD</p><ul className="space-y-1 text-sm text-slate-300">{workout.wod.stations.map((station, index) => <li key={`${station.name}-${index}`}>{index + 1}. {station.name} · <span className="text-slate-500">{station.target}</span></li>)}</ul></div>
          ) : !isCardio && workout.exercises && (
            <ul className="space-y-2 text-sm">
              {workout.exercises.map((ex, i) => (
                <li key={i}>
                  <p className="font-medium text-slate-200">{ex.name}</p>
                  <p className="text-xs text-slate-400">
                    {ex.sets
                      .map((s) => `${s.weight > 0 ? `${s.weight}kg × ` : ""}${s.reps}`)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {workout.notes && (
            <p className="mt-2 text-sm italic text-slate-400">“{workout.notes}”</p>
          )}
          <button onClick={remove} className="btn-danger mt-3 !px-3 !py-1.5 !text-xs">
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
