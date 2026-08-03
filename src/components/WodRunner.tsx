"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addWorkout } from "@/lib/db";
import { isoDate } from "@/lib/stats";
import type { GeneratedSession, SessionFormat, Workout } from "@/lib/types";

const formatClock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const isIntervalFormat = (format: SessionFormat) => format === "emom" || format === "tabata";
const vibrate = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([100, 60, 100]);
};

export default function WodRunner({ session }: { session: GeneratedSession }) {
  const { user } = useAuth();
  const router = useRouter();
  const stations = useMemo(() => session.stations ?? [], [session.stations]);
  const [stationIndex, setStationIndex] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(session.durationMin * 60);
  const [phase, setPhase] = useState<"work" | "rest">("work");
  const [intervalRemaining, setIntervalRemaining] = useState(stations[0]?.workSec ?? 0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const current = stations[stationIndex];
  const plannedRounds = session.rounds ?? 0;

  const advance = useCallback(() => {
    if (stations.length === 0) return;
    const lastStation = stationIndex >= stations.length - 1;
    if (lastStation) {
      const nextRound = roundsCompleted + 1;
      setRoundsCompleted(nextRound);
      if (session.format !== "amrap" && plannedRounds > 0 && nextRound >= plannedRounds) {
        setFinished(true);
        setRunning(false);
        vibrate();
        return;
      }
      setStationIndex(0);
      setPhase("work");
      setIntervalRemaining(stations[0]?.workSec ?? 0);
    } else {
      const next = stationIndex + 1;
      setStationIndex(next);
      setPhase("work");
      setIntervalRemaining(stations[next]?.workSec ?? 0);
    }
    vibrate();
  }, [plannedRounds, roundsCompleted, session.format, stationIndex, stations]);

  useEffect(() => {
    if (!running || finished) return;
    const timer = window.setInterval(() => {
      setElapsedSec((value) => value + 1);
      if (session.format === "amrap") {
        setTotalRemaining((value) => Math.max(0, value - 1));
      } else if (isIntervalFormat(session.format)) {
        setIntervalRemaining((value) => Math.max(0, value - 1));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finished, running, session.format]);

  useEffect(() => {
    if (!running || session.format !== "amrap" || totalRemaining > 0) return;
    setRunning(false);
    setFinished(true);
    vibrate();
  }, [running, session.format, totalRemaining]);

  useEffect(() => {
    if (!running || !isIntervalFormat(session.format) || intervalRemaining > 0 || !current) return;
    if (phase === "work" && current.restSec > 0) {
      setPhase("rest");
      setIntervalRemaining(current.restSec);
      vibrate();
    } else {
      advance();
    }
  }, [advance, current, intervalRemaining, phase, running, session.format]);

  const save = async () => {
    if (!user || session.format === "clasico") return;
    setSaving(true);
    const workout: Omit<Workout, "id"> = {
      type: "gym",
      name: session.name,
      date: isoDate(new Date()),
      durationMin: Math.max(1, Math.round(elapsedSec / 60)),
      notes: session.description,
      exercises: stations.map((station) => ({ name: station.name, muscleGroup: station.muscleGroup, sets: [{ weight: 0, reps: Math.max(1, roundsCompleted), done: true }] })),
      wod: {
        format: session.format,
        roundsPlanned: plannedRounds,
        roundsCompleted,
        elapsedSec,
        stations,
      },
      createdAt: Date.now(),
    };
    if (session.profileId) workout.profileId = session.profileId;
    if (session.profileName) workout.profileName = session.profileName;
    try {
      await addWorkout(user.uid, workout);
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el WOD.");
      setSaving(false);
    }
  };

  if (!current) return <div className="card text-sm text-slate-400">No se han podido preparar estaciones para este WOD.</div>;

  const mainClock = session.format === "amrap" ? totalRemaining : isIntervalFormat(session.format) ? intervalRemaining : elapsedSec;
  const next = stations[(stationIndex + 1) % stations.length];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className={`rounded-[2rem] border p-6 text-center ${phase === "rest" ? "border-cardio/40 bg-cardio/10" : "border-accent/40 bg-accent/10"}`}>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400"><span>{session.format}</span><span>Ronda {Math.min(roundsCompleted + 1, plannedRounds || roundsCompleted + 1)}{plannedRounds ? `/${plannedRounds}` : ""}</span></div>
        <p className={`mt-6 text-xs font-extrabold uppercase tracking-[0.2em] ${phase === "rest" ? "text-cardio" : "text-accent"}`}>{phase === "rest" ? "Descanso" : "Trabajo"}</p>
        <p className="mt-1 text-7xl font-black tabular-nums tracking-[-0.06em] sm:text-8xl">{formatClock(mainClock)}</p>
        <h1 className="mt-5 text-2xl font-extrabold">{current.name}</h1>
        <p className="mt-1 text-sm text-slate-300">{phase === "rest" ? `Después: ${next?.name}` : current.target}</p>
      </div>

      {!finished ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setRunning((value) => !value)} className="btn-primary py-4 text-base">{running ? "Pausar" : elapsedSec > 0 ? "Continuar" : "Comenzar"}</button>
          {!isIntervalFormat(session.format) ? <button onClick={advance} disabled={!running} className="btn-secondary py-4 text-base">Estación completada →</button> : <button onClick={advance} className="btn-secondary py-4 text-base">Saltar estación</button>}
        </div>
      ) : (
        <div className="card text-center"><p className="section-kicker">WOD terminado</p><h2 className="mt-1 text-2xl font-extrabold">{roundsCompleted} {roundsCompleted === 1 ? "ronda" : "rondas"}</h2><p className="mt-1 text-sm text-slate-400">Tiempo total: {formatClock(elapsedSec)}</p><button onClick={save} disabled={saving} className="btn-primary mt-4 w-full">{saving ? "Guardando…" : "Guardar resultado"}</button></div>
      )}

      {!finished && <button onClick={() => { setRunning(false); setFinished(true); }} className="w-full text-center text-sm font-semibold text-slate-500">Finalizar WOD ahora</button>}

      <div className="card"><div className="flex items-center justify-between"><h2 className="section-title">Estaciones</h2><span className="text-xs text-slate-500">{stationIndex + 1}/{stations.length}</span></div><ol className="mt-3 space-y-2">{stations.map((station, index) => <li key={`${station.name}-${index}`} className={`flex items-center gap-3 rounded-xl p-3 ${index === stationIndex ? "bg-accent/15 text-white" : "bg-base-800 text-slate-400"}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/20 text-xs font-bold">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{station.name}</span><span className="text-xs">{station.target}</span></li>)}</ol></div>
    </div>
  );
}
