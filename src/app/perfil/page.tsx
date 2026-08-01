"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import GpxImport from "@/components/GpxImport";
import { useAuth } from "@/context/AuthContext";
import {
  addBodyMetric,
  deleteBodyMetric,
  useBodyMetrics,
  useGoals,
  usePlans,
  useWorkouts,
} from "@/lib/db";
import { formatDateShort, isoDate } from "@/lib/stats";

export default function PerfilPage() {
  return (
    <AppShell>
      <Perfil />
    </AppShell>
  );
}

function Perfil() {
  const { user, signOut } = useAuth();
  const { data: metrics } = useBodyMetrics();
  const { data: workouts } = useWorkouts();
  const { data: plans } = usePlans();
  const { data: goals } = useGoals();

  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(isoDate(new Date()));

  const saveWeight = async () => {
    if (!user || !weight) return;
    await addBodyMetric(user.uid, {
      date,
      weightKg: parseFloat(weight),
      createdAt: Date.now(),
    });
    setWeight("");
  };

  const exportData = () => {
    const payload = {
      exportadoEl: new Date().toISOString(),
      usuario: { nombre: user?.displayName, email: user?.email },
      entrenamientos: workouts,
      planes: plans,
      objetivos: goals,
      pesoCorporal: metrics,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vizfitness-export-${isoDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <div className="card flex items-center gap-4">
        {user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt="Foto de perfil"
            className="h-14 w-14 rounded-full border border-base-600"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-base-700 text-2xl">
            👤
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{user?.displayName ?? "Usuario"}</p>
          <p className="truncate text-sm text-slate-400">{user?.email}</p>
          <p className="mt-0.5 text-xs text-accent">
            ✓ Sincronizado en todos tus dispositivos
          </p>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">⚖️ Peso corporal</h2>
        <div className="flex flex-wrap gap-3">
          <input
            className="input max-w-[150px]"
            type="date"
            value={date}
            max={isoDate(new Date())}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            className="input max-w-[130px]"
            type="number"
            inputMode="decimal"
            step={0.1}
            placeholder="Peso (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <button onClick={saveWeight} disabled={!weight} className="btn-primary">
            Registrar
          </button>
        </div>
        {metrics.length > 0 && (
          <ul className="divide-y divide-base-700/60 text-sm">
            {metrics.slice(0, 8).map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <span className="text-slate-400">{formatDateShort(m.date)}</span>
                <span className="font-semibold">{m.weightKg} kg</span>
                <button
                  onClick={() => user && m.id && deleteBodyMetric(user.uid, m.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <GpxImport />

      <div className="card space-y-3">
        <h2 className="font-semibold">📦 Tus datos</h2>
        <p className="text-sm text-slate-400">
          {workouts.length} entrenamientos · {plans.length} planes · {goals.length}{" "}
          objetivos · {metrics.length} registros de peso
        </p>
        <button onClick={exportData} className="btn-secondary">
          ⬇️ Exportar todos mis datos (JSON)
        </button>
      </div>

      <button onClick={() => signOut()} className="btn-danger w-full">
        Cerrar sesión
      </button>
    </div>
  );
}
