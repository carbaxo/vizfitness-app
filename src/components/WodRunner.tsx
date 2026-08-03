"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addWorkout } from "@/lib/db";
import { isoDate } from "@/lib/stats";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import { WodAudioEngine } from "@/lib/wodAudio";
import type { GeneratedSession, SessionFormat, Workout } from "@/lib/types";
import ExerciseImage from "./ExerciseImage";
import ExerciseEditSheet from "./ExerciseEditSheet";

const formatClock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const isIntervalFormat = (format: SessionFormat) => format === "emom" || format === "tabata";
const vibrate = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([100, 60, 100]);
};

export default function WodRunner({ session }: { session: GeneratedSession }) {
  const { user } = useAuth();
  const router = useRouter();
  const { library } = useExerciseLibrary();
  const audioRef = useRef<WodAudioEngine | null>(null);
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
  const [musicOn, setMusicOn] = useState(true);
  const [detailName, setDetailName] = useState<string | null>(null);

  const current = stations[stationIndex];
  const currentExercise = useMemo(() => library.find((exercise) => exercise.name === current?.name), [current?.name, library]);
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
        audioRef.current?.stopMusic();
        void audioRef.current?.cue("finish");
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
    void audioRef.current?.cue("work");
    vibrate();
  }, [plannedRounds, roundsCompleted, session.format, stationIndex, stations]);

  useEffect(() => {
    return () => { void audioRef.current?.dispose(); };
  }, []);

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
    audioRef.current?.stopMusic();
    void audioRef.current?.cue("finish");
    vibrate();
  }, [running, session.format, totalRemaining]);

  useEffect(() => {
    if (!running || !isIntervalFormat(session.format) || intervalRemaining > 0 || !current) return;
    if (phase === "work" && current.restSec > 0) {
      setPhase("rest");
      setIntervalRemaining(current.restSec);
      void audioRef.current?.cue("rest");
      vibrate();
    } else {
      advance();
    }
  }, [advance, current, intervalRemaining, phase, running, session.format]);

  useEffect(() => {
    if (!running) return;
    const remaining = session.format === "amrap" ? totalRemaining : intervalRemaining;
    const shouldSignal = isIntervalFormat(session.format)
      ? remaining > 0 && remaining <= 3
      : session.format === "amrap" && [10, 5, 3, 2, 1].includes(remaining);
    if (shouldSignal) void audioRef.current?.cue("countdown");
  }, [intervalRemaining, running, session.format, totalRemaining]);

  const toggleRunning = async () => {
    const engine = audioRef.current ?? new WodAudioEngine();
    audioRef.current = engine;
    if (running) {
      engine.stopMusic();
      setRunning(false);
      return;
    }
    await engine.unlock();
    if (musicOn) await engine.startMusic();
    if (elapsedSec === 0) await engine.cue("work");
    setRunning(true);
  };

  const toggleMusic = async () => {
    const next = !musicOn;
    setMusicOn(next);
    const engine = audioRef.current ?? new WodAudioEngine();
    audioRef.current = engine;
    if (!next) engine.stopMusic();
    else if (running) await engine.startMusic();
  };

  const finishNow = () => {
    setRunning(false);
    setFinished(true);
    audioRef.current?.stopMusic();
    void audioRef.current?.cue("finish");
  };

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
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400"><span>{session.format}</span><button onClick={toggleMusic} className="rounded-full bg-black/20 px-3 py-1.5 normal-case text-slate-200">{musicOn ? "♫ Techno" : "🔇 Música"}</button><span>Ronda {Math.min(roundsCompleted + 1, plannedRounds || roundsCompleted + 1)}{plannedRounds ? `/${plannedRounds}` : ""}</span></div>
        <p className={`mt-6 text-xs font-extrabold uppercase tracking-[0.2em] ${phase === "rest" ? "text-cardio" : "text-accent"}`}>{phase === "rest" ? "Descanso" : "Trabajo"}</p>
        <p className="mt-1 text-7xl font-black tabular-nums tracking-[-0.06em] sm:text-8xl">{formatClock(mainClock)}</p>
        <h1 className="mt-5 text-2xl font-extrabold">{current.name}</h1>
        <p className="mt-1 text-sm text-slate-300">{phase === "rest" ? `Después: ${next?.name}` : current.target}</p>
      </div>

      <button onClick={() => setDetailName(current.name)} className="card press group w-full overflow-hidden !p-0 text-left">
        <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
          <div className="aspect-video overflow-hidden bg-white sm:aspect-square"><ExerciseImage media={currentExercise?.media} alt={current.name} alwaysAnimate className="h-full w-full" /></div>
          <div className="flex flex-col justify-center p-4"><p className="section-kicker">Técnica en movimiento</p><h2 className="mt-1 text-lg font-bold">{current.name}</h2><p className="mt-2 text-sm text-slate-400">Toca el GIF para ver la descripción, músculos y todos los pasos.</p></div>
        </div>
      </button>

      {!finished ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={toggleRunning} className="btn-primary py-4 text-base">{running ? "Pausar" : elapsedSec > 0 ? "Continuar" : "Comenzar"}</button>
          {!isIntervalFormat(session.format) ? <button onClick={advance} disabled={!running} className="btn-secondary py-4 text-base">Estación completada →</button> : <button onClick={advance} className="btn-secondary py-4 text-base">Saltar estación</button>}
        </div>
      ) : (
        <div className="card text-center"><p className="section-kicker">WOD terminado</p><h2 className="mt-1 text-2xl font-extrabold">{roundsCompleted} {roundsCompleted === 1 ? "ronda" : "rondas"}</h2><p className="mt-1 text-sm text-slate-400">Tiempo total: {formatClock(elapsedSec)}</p><button onClick={save} disabled={saving} className="btn-primary mt-4 w-full">{saving ? "Guardando…" : "Guardar resultado"}</button></div>
      )}

      {!finished && <button onClick={finishNow} className="w-full text-center text-sm font-semibold text-slate-500">Finalizar WOD ahora</button>}

      <div className="card"><div className="flex items-center justify-between"><h2 className="section-title">Estaciones</h2><span className="text-xs text-slate-500">{stationIndex + 1}/{stations.length}</span></div><ol className="mt-3 space-y-2">{stations.map((station, index) => <li key={`${station.name}-${index}`}><button onClick={() => setDetailName(station.name)} className={`press flex w-full items-center gap-3 rounded-xl p-3 text-left ${index === stationIndex ? "bg-accent/15 text-white" : "bg-base-800 text-slate-400"}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/20 text-xs font-bold">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{station.name}</span><span className="text-xs">{station.target}</span><span aria-hidden>›</span></button></li>)}</ol></div>
      {detailName && <ExerciseEditSheet name={detailName} onClose={() => setDetailName(null)} />}
    </div>
  );
}
