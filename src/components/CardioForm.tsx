"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addWorkout } from "@/lib/db";
import { isoDate, pace } from "@/lib/stats";
import { CARDIO_SPORTS, type CardioSport, type GeneratedSession, type Workout } from "@/lib/types";

export default function CardioForm({ initialSession }: { initialSession?: GeneratedSession }) {
  const { user } = useAuth();
  const router = useRouter();
  const [sport, setSport] = useState<CardioSport>("correr");
  const [date, setDate] = useState(isoDate(new Date()));
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState(initialSession ? String(initialSession.durationMin) : "");
  const [avgHr, setAvgHr] = useState("");
  const [calories, setCalories] = useState("");
  const [elevation, setElevation] = useState("");
  const [notes, setNotes] = useState(initialSession?.description ?? "");
  const [saving, setSaving] = useState(false);

  const distanceKm = parseFloat(distance) || 0;
  const durationMin = parseFloat(duration) || 0;
  const sportInfo = CARDIO_SPORTS.find((s) => s.value === sport)!;

  const save = async () => {
    if (!user || !distanceKm || !durationMin) return;
    setSaving(true);
    try {
      const workout: Omit<Workout, "id"> = {
        type: "cardio",
        name: `${sportInfo.label}`,
        date,
        durationMin,
        cardio: {
          sport,
          distanceKm,
          avgHr: parseFloat(avgHr) || null,
          calories: parseFloat(calories) || null,
          elevationM: parseFloat(elevation) || null,
        },
        createdAt: Date.now(),
      };
      if (initialSession?.profileId) workout.profileId = initialSession.profileId;
      if (initialSession?.profileName) workout.profileName = initialSession.profileName;
      if (notes.trim()) workout.notes = notes.trim();
      await addWorkout(user.uid, workout);
      router.push("/");
    } catch (e) {
      alert("No se pudo guardar la actividad. Inténtalo de nuevo.");
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="label">Deporte</p>
        <div className="flex flex-wrap gap-2">
          {CARDIO_SPORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSport(s.value)}
              className={`btn !px-3 !py-2 !text-sm ${
                sport === s.value
                  ? "bg-cardio/20 text-cardio ring-1 ring-cardio/50"
                  : "border border-base-600 bg-base-800 text-slate-300"
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="cardio-date">Fecha</label>
          <input
            id="cardio-date"
            type="date"
            className="input"
            value={date}
            max={isoDate(new Date())}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="cardio-duration">Duración (min) *</label>
          <input
            id="cardio-duration"
            type="number"
            inputMode="decimal"
            min={1}
            className="input"
            placeholder="45"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="cardio-distance">Distancia (km) *</label>
          <input
            id="cardio-distance"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            className="input"
            placeholder="8.5"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="cardio-hr">FC media (ppm)</label>
          <input
            id="cardio-hr"
            type="number"
            inputMode="numeric"
            className="input"
            placeholder="150"
            value={avgHr}
            onChange={(e) => setAvgHr(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="cardio-cal">Calorías</label>
          <input
            id="cardio-cal"
            type="number"
            inputMode="numeric"
            className="input"
            placeholder="420"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="cardio-elev">Desnivel (m)</label>
          <input
            id="cardio-elev"
            type="number"
            inputMode="numeric"
            className="input"
            placeholder="120"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
          />
        </div>
      </div>

      {distanceKm > 0 && durationMin > 0 && (
        <div className="card flex items-center justify-around text-center">
          <div>
            <p className="text-xs text-slate-400">Ritmo medio</p>
            <p className="text-xl font-bold text-cardio">{pace(durationMin, distanceKm)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Velocidad</p>
            <p className="text-xl font-bold text-cardio">
              {((distanceKm / durationMin) * 60).toFixed(1)} km/h
            </p>
          </div>
        </div>
      )}

      <textarea
        className="input"
        rows={2}
        placeholder="Notas (ruta, sensaciones, clima…)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={save}
        disabled={saving || !distanceKm || !durationMin}
        className="btn-primary w-full py-3 text-base"
      >
        {saving ? "Guardando…" : "Guardar actividad"}
      </button>
    </div>
  );
}
