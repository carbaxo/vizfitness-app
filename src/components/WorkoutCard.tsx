"use client";

import { useState } from "react";
import type { Workout } from "@/lib/types";
import { CARDIO_SPORTS } from "@/lib/types";
import { formatDateShort, formatDuration, pace } from "@/lib/stats";
import { useAuth } from "@/context/AuthContext";
import { deleteWorkout } from "@/lib/db";
import RouteMap from "./RouteMap";

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isCardio = workout.type === "cardio";
  const sport = CARDIO_SPORTS.find((s) => s.value === workout.cardio?.sport);

  const remove = async () => {
    if (!user || !workout.id) return;
    if (!confirm("¿Eliminar este entrenamiento? Esta acción no se puede deshacer.")) return;
    await deleteWorkout(user.uid, workout.id);
  };

  return (
    <div className="card transition-shadow">
      <button
        className="flex w-full items-start justify-between gap-3 text-left transition active:scale-[0.99]"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-start gap-3">
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl ${
              isCardio ? "bg-cardio/12" : "bg-gym/12"
            }`}
          >
            {isCardio ? sport?.emoji ?? "🏃" : "🏋️"}
          </span>
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
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`chip ${
              isCardio ? "bg-cardio/15 text-cardio" : "bg-gym/15 text-gym"
            }`}
          >
            {isCardio ? "Cardio" : "Gimnasio"}
          </span>
          <span
            className={`text-slate-500 transition-transform duration-300 ease-silk ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ⌄
          </span>
        </div>
      </button>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
        {isCardio && workout.cardio ? (
          <>
            <span>📏 {workout.cardio.distanceKm} km</span>
            <span>⚡ {pace(workout.durationMin, workout.cardio.distanceKm)}</span>
            {workout.cardio.avgHr ? <span>❤️ {workout.cardio.avgHr} ppm</span> : null}
            {workout.cardio.calories ? <span>🔥 {workout.cardio.calories} kcal</span> : null}
          </>
        ) : (
          <>
            <span>💪 {workout.exercises?.length ?? 0} ejercicios</span>
            <span>
              📊 {workout.exercises?.reduce((a, e) => a + e.sets.length, 0) ?? 0} series
            </span>
            {workout.volumeKg ? (
              <span>🏆 {Math.round(workout.volumeKg).toLocaleString("es-ES")} kg totales</span>
            ) : null}
          </>
        )}
      </div>

      {open && (
        <div className="mt-3 animate-rise border-t border-white/5 pt-3">
          {isCardio && (workout.cardio?.route?.length ?? 0) > 1 && (
            <div className="mb-2">
              <RouteMap route={workout.cardio!.route!} />
            </div>
          )}
          {!isCardio && workout.exercises && (
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
