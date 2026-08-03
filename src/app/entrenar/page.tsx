/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import GymSession from "@/components/GymSession";
import CardioForm from "@/components/CardioForm";
import Icon from "@/components/Icon";
import TrainingWizard from "@/components/TrainingWizard";
import type { GeneratedSession } from "@/lib/types";

export default function EntrenarPage() {
  return (
    <AppShell>
      <Suspense>
        <Entrenar />
      </Suspense>
    </AppShell>
  );
}

function Entrenar() {
  const [mode, setMode] = useState<"gym" | "cardio">("gym");
  const [manual, setManual] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSession | null>(null);
  const [started, setStarted] = useState(false);

  if (!manual && !generated) {
    return <TrainingWizard onGenerated={(session) => { setGenerated(session); setStarted(false); }} onManual={() => setManual(true)} />;
  }

  if (generated && !started) {
    return <GeneratedPreview session={generated} onStart={() => setStarted(true)} onAgain={() => setGenerated(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className="section-kicker">Sesión en vivo</p><h1 className="text-3xl font-extrabold tracking-tight">{generated?.name ?? "Entrenar"}</h1>{generated?.profileName && <p className="mt-1 text-sm text-slate-400">Plan para {generated.profileName} · {generated.durationMin} min</p>}</div>
        <Link href="/ejercicios" className="btn-secondary !px-3">
          <Icon name="book" className="h-4 w-4" /> <span className="hidden sm:inline">Biblioteca</span>
        </Link>
      </div>

      {!generated && <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode("gym")}
          aria-pressed={mode === "gym"}
          className={`media-card min-h-[220px] ${
            mode === "gym" ? "!border-gym ring-2 ring-gym/40" : ""
          }`}
        >
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/strength-training.webp`} alt="Entrenamiento de gimnasio" />
          <div className="media-card-content"><span className="chip bg-gym/20 text-gym"><Icon name="dumbbell" className="mr-1 h-3.5 w-3.5" /> Fuerza</span><p className="mt-2 text-xl font-bold">Gimnasio</p><p className="text-xs text-slate-300">Series, peso y descansos</p></div>
        </button>
        <button
          onClick={() => setMode("cardio")}
          aria-pressed={mode === "cardio"}
          className={`media-card min-h-[220px] ${
            mode === "cardio"
              ? "!border-cardio ring-2 ring-cardio/40"
              : ""
          }`}
        >
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/cardio-running.webp`} alt="Entrenamiento de cardio" />
          <div className="media-card-content"><span className="chip bg-cardio/20 text-cardio"><Icon name="run" className="mr-1 h-3.5 w-3.5" /> Cardio</span><p className="mt-2 text-xl font-bold">Cardio</p><p className="text-xs text-slate-300">Distancia, ritmo y pulsaciones</p></div>
        </button>
      </div>}

      {((generated?.focus === "cardio" && generated.exercises.length === 0) || (!generated && mode === "cardio")) ? <CardioForm initialSession={generated ?? undefined} /> : <GymSession initialSession={generated ?? undefined} />}
      <button onClick={() => { setGenerated(null); setStarted(false); setManual(false); }} className="w-full text-center text-sm font-semibold text-slate-500 hover:text-accent">Generar otra sesión</button>
    </div>
  );
}

function GeneratedPreview({ session, onStart, onAgain }: { session: GeneratedSession; onStart: () => void; onAgain: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-[1.75rem] border border-accent/25 bg-gradient-to-br from-accent/20 via-base-900 to-base-900 p-6">
        <p className="section-kicker">Sesión preparada</p><h1 className="mt-1 text-3xl font-extrabold">{session.name}</h1><p className="mt-2 text-sm leading-relaxed text-slate-300">{session.description}</p>
        <div className="mt-4 flex flex-wrap gap-2"><span className="chip bg-accent/15 text-accent">{session.profileName}</span><span className="chip bg-base-800 text-slate-300">{session.durationMin} min</span>{session.cardioMinutes ? <span className="chip bg-cardio/15 text-cardio">{session.cardioMinutes} min cardio</span> : null}{session.rounds ? <span className="chip bg-base-800 text-slate-300">{session.rounds} vueltas</span> : null}</div>
      </div>
      {session.exercises.length > 0 && <div className="card"><h2 className="section-title">Plan de trabajo</h2><ol className="mt-3 space-y-2">{session.exercises.map((exercise, index) => <li key={`${exercise.name}-${index}`} className="flex items-center gap-3 rounded-xl bg-base-800 p-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{exercise.name}</span><span className="text-xs text-slate-400">{exercise.sets.length} series</span></li>)}</ol></div>}
      {session.focus === "cardio" && <div className="card"><h2 className="section-title">Bloque de cardio</h2><p className="mt-2 text-sm text-slate-400">Calentamiento progresivo, bloque principal a intensidad cómoda/exigente según sensaciones y 5 minutos suaves al final.</p></div>}
      <button onClick={onStart} className="btn-primary w-full py-3 text-base">Empezar entrenamiento</button><button onClick={onAgain} className="btn-secondary w-full">Cambiar respuestas y generar otro</button>
    </div>
  );
}
