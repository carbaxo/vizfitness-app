/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import GymSession from "@/components/GymSession";
import CardioForm from "@/components/CardioForm";
import Icon from "@/components/Icon";

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className="section-kicker">Sesión en vivo</p><h1 className="text-3xl font-extrabold tracking-tight">Entrenar</h1></div>
        <Link href="/ejercicios" className="btn-secondary !px-3">
          <Icon name="book" className="h-4 w-4" /> <span className="hidden sm:inline">Biblioteca</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
      </div>

      {mode === "gym" ? <GymSession /> : <CardioForm />}
    </div>
  );
}
