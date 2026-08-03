"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PlanEditor from "@/components/PlanEditor";
import { useAuth } from "@/context/AuthContext";
import { deletePlan, updatePlan, usePlans } from "@/lib/db";
import type { Plan } from "@/lib/types";
import PageHero from "@/components/PageHero";
import Icon from "@/components/Icon";

export default function PlanesPage() {
  return (
    <AppShell>
      <Planes />
    </AppShell>
  );
}

function Planes() {
  const { user } = useAuth();
  const { data: plans, loading } = usePlans();
  const [editing, setEditing] = useState(false);

  const setActive = async (plan: Plan) => {
    if (!user || !plan.id) return;
    // Solo un plan activo a la vez
    await Promise.all(
      plans
        .filter((p) => p.id !== plan.id && p.active)
        .map((p) => updatePlan(user.uid, p.id!, { active: false }))
    );
    await updatePlan(user.uid, plan.id, { active: !plan.active });
  };

  const remove = async (plan: Plan) => {
    if (!user || !plan.id) return;
    if (!confirm(`¿Eliminar el plan "${plan.name}"?`)) return;
    await deletePlan(user.uid, plan.id);
  };

  return (
    <div className="space-y-5">
      <PageHero eyebrow="Organiza tu progreso" title="Planes de entrenamiento" description="Construye una semana equilibrada, llega al gimnasio con todo preparado y entrena sin improvisar." image="/images/training-plan.webp" action={<button onClick={() => setEditing((e) => !e)} className="btn-primary"><Icon name="calendar" className="h-4 w-4" />{editing ? "Cancelar" : "Crear nuevo plan"}</button>} />

      {editing && <PlanEditor onSaved={() => setEditing(false)} />}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : plans.length === 0 && !editing ? (
        <div className="card text-center">
          <Icon name="calendar" className="mx-auto h-10 w-10 text-accent" />
          <p className="mt-2 font-medium">Aún no tienes ningún plan</p>
          <p className="mt-1 text-sm text-slate-400">
            Crea tu rutina semanal: días de gimnasio, cardio y descanso. Después
            podrás iniciar cada sesión con un toque.
          </p>
        </div>
      ) : (
        plans.map((plan) => (
          <div key={plan.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">
                  {plan.name}
                  {plan.active && (
                    <span className="ml-2 chip bg-accent/15 text-accent">activo</span>
                  )}
                </p>
                {plan.description && (
                  <p className="text-sm text-slate-400">{plan.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setActive(plan)}
                  className="btn-secondary !px-3 !py-1.5 !text-xs"
                >
                  {plan.active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => remove(plan)}
                  className="btn-danger !px-3 !py-1.5 !text-xs"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {plan.days.map((day, di) => (
                <div key={di} className="rounded-xl border border-base-700/60 bg-base-800/50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      <span className="mr-1 inline-flex align-middle text-accent">{day.type === "cardio" ? <Icon name="run" className="h-4 w-4" /> : day.type === "gym" ? <Icon name="dumbbell" className="h-4 w-4" /> : <Icon name="clock" className="h-4 w-4" />}</span>{" "}
                      {day.name}
                    </p>
                    {day.type === "gym" && day.exercises.length > 0 && (
                      <Link
                        href={`/entrenar?plan=${plan.id}&dia=${di}`}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Iniciar →
                      </Link>
                    )}
                  </div>
                  {day.focus && <p className="text-xs text-slate-400">{day.focus}</p>}
                  {day.type === "gym" && (
                    <ul className="mt-2 space-y-0.5 text-xs text-slate-400">
                      {day.exercises.map((e, i) => (
                        <li key={i}>
                          {e.name} — {e.sets}×{e.reps}
                        </li>
                      ))}
                    </ul>
                  )}
                  {day.type === "cardio" && day.cardioNote && (
                    <p className="mt-2 text-xs text-slate-400">{day.cardioNote}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
