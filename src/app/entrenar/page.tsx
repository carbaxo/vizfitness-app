"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import GymSession from "@/components/GymSession";
import CardioForm from "@/components/CardioForm";
import CircuitSession from "@/components/CircuitSession";

export default function EntrenarPage() {
  return (
    <AppShell>
      <Suspense>
        <Entrenar />
      </Suspense>
    </AppShell>
  );
}

type Mode = "gym" | "cardio" | "circuito";

const MODES: {
  value: Mode;
  emoji: string;
  label: string;
  hint: string;
  border: string;
}[] = [
  {
    value: "gym",
    emoji: "🏋️",
    label: "Gimnasio",
    hint: "Series, peso y descansos",
    border: "!border-gym ring-1 ring-gym/50",
  },
  {
    value: "circuito",
    emoji: "🔥",
    label: "Estaciones",
    hint: "Circuito por tiempo, tipo WOD o Hyrox",
    border: "!border-accent ring-1 ring-accent/50",
  },
  {
    value: "cardio",
    emoji: "🏃",
    label: "Cardio",
    hint: "Carrera, bici, natación…",
    border: "!border-cardio ring-1 ring-cardio/50",
  },
];

function Entrenar() {
  const [mode, setMode] = useState<Mode>("gym");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entrenar</h1>
        <Link href="/ejercicios" className="text-sm text-accent hover:underline">
          Biblioteca de ejercicios →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`card press text-left transition ${
              mode === m.value ? m.border : "hover:bg-base-800"
            }`}
          >
            <span className="text-2xl sm:text-3xl">{m.emoji}</span>
            <p className="mt-2 text-sm font-semibold sm:text-base">{m.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-400 sm:text-xs">
              {m.hint}
            </p>
          </button>
        ))}
      </div>

      {mode === "gym" && <GymSession />}
      {mode === "circuito" && <CircuitSession />}
      {mode === "cardio" && <CardioForm />}
    </div>
  );
}
