"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import GymSession from "@/components/GymSession";
import CardioForm from "@/components/CardioForm";
import Icon from "@/components/Icon";
import TrainingWizard from "@/components/TrainingWizard";
import WodRunner from "@/components/WodRunner";
import ExerciseEditSheet from "@/components/ExerciseEditSheet";
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
  const router = useRouter();
  const [generated, setGenerated] = useState<GeneratedSession | null>(null);
  const [started, setStarted] = useState(false);

  if (!generated) {
    return <TrainingWizard onGenerated={(session) => { setGenerated(session); setStarted(false); }} onManual={() => router.push("/entrenar/manual")} />;
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

      {generated.format !== "clasico" ? <WodRunner session={generated} /> : generated.focus === "cardio" && generated.exercises.length === 0 ? <CardioForm initialSession={generated} /> : <GymSession initialSession={generated} />}
      <button onClick={() => { setGenerated(null); setStarted(false); }} className="w-full text-center text-sm font-semibold text-slate-500 hover:text-accent">Generar otra sesión</button>
    </div>
  );
}

function GeneratedPreview({ session, onStart, onAgain }: { session: GeneratedSession; onStart: () => void; onAgain: () => void }) {
  const [detailName, setDetailName] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-[1.75rem] border border-accent/25 bg-gradient-to-br from-accent/20 via-base-900 to-base-900 p-6">
        <p className="section-kicker">Sesión preparada</p><h1 className="mt-1 text-3xl font-extrabold">{session.name}</h1><p className="mt-2 text-sm leading-relaxed text-slate-300">{session.description}</p>
        <div className="mt-4 flex flex-wrap gap-2"><span className="chip bg-accent/15 text-accent">{session.profileName}</span><span className="chip bg-base-800 uppercase text-slate-300">{session.format}</span><span className="chip bg-base-800 text-slate-300">{session.durationMin} min</span>{session.cardioMinutes ? <span className="chip bg-cardio/15 text-cardio">{session.cardioMinutes} min cardio</span> : null}{session.rounds ? <span className="chip bg-base-800 text-slate-300">{session.rounds} vueltas</span> : null}</div>
      </div>
      {session.exercises.length > 0 && <div className="card"><div className="flex items-center justify-between gap-3"><h2 className="section-title">{session.format === "clasico" ? "Plan de trabajo" : "Estaciones del WOD"}</h2><span className="text-xs text-slate-500">Toca para ver la técnica</span></div><ol className="mt-3 space-y-2">{session.exercises.map((exercise, index) => <li key={`${exercise.name}-${index}`}><button onClick={() => setDetailName(exercise.name)} className="press flex w-full items-center gap-3 rounded-xl bg-base-800 p-3 text-left hover:bg-base-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{exercise.name}</span><span className="text-xs text-slate-400">{session.stations?.[index]?.target ?? `${exercise.sets.length} series`}</span><span aria-hidden className="text-slate-600">›</span></button></li>)}</ol></div>}
      {session.focus === "cardio" && <div className="card"><h2 className="section-title">Bloque de cardio</h2><p className="mt-2 text-sm text-slate-400">Calentamiento progresivo, bloque principal a intensidad cómoda/exigente según sensaciones y 5 minutos suaves al final.</p></div>}
      <button onClick={onStart} className="btn-primary w-full py-3 text-base">Empezar entrenamiento</button><button onClick={onAgain} className="btn-secondary w-full">Cambiar respuestas y generar otro</button>
      {detailName && <ExerciseEditSheet name={detailName} onClose={() => setDetailName(null)} />}
    </div>
  );
}
