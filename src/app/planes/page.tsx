"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PlanEditor from "@/components/PlanEditor";
import RoutineTemplates from "@/components/RoutineTemplates";
import ExerciseEditSheet from "@/components/ExerciseEditSheet";
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingEx, setEditingEx] = useState<{ planId: string; di: number; ei: number } | null>(null);

  const openExName = editingEx
    ? plans.find((plan) => plan.id === editingEx.planId)?.days[editingEx.di]?.exercises[editingEx.ei]?.name
    : undefined;

  const replaceEx = async (newName: string) => {
    if (!user || !editingEx) return;
    const plan = plans.find((item) => item.id === editingEx.planId);
    if (!plan?.id) return;
    const days = plan.days.map((day, di) => di !== editingEx.di ? day : {
      ...day,
      exercises: day.exercises.map((exercise, ei) => ei !== editingEx.ei ? exercise : { ...exercise, name: newName }),
    });
    await updatePlan(user.uid, plan.id, { days });
  };

  const removeEx = async () => {
    if (!user || !editingEx) return;
    const plan = plans.find((item) => item.id === editingEx.planId);
    if (!plan?.id) return;
    const days = plan.days.map((day, di) => di !== editingEx.di ? day : {
      ...day,
      exercises: day.exercises.filter((_, ei) => ei !== editingEx.ei),
    });
    await updatePlan(user.uid, plan.id, { days });
  };

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
      <PageHero eyebrow="Organiza tu progreso" title="Planes de entrenamiento" description="Construye una semana equilibrada, llega al gimnasio con todo preparado y entrena sin improvisar." image="/images/training-plan.webp" action={<div className="flex flex-wrap gap-2"><button onClick={() => { setShowTemplates((value) => !value); setEditing(false); }} className="btn-secondary">{showTemplates ? "Ocultar" : "Ver plantillas"}</button><button onClick={() => { setEditing((value) => !value); setShowTemplates(false); }} className="btn-primary"><Icon name="calendar" className="h-4 w-4" />{editing ? "Cancelar" : "Crear plan"}</button></div>} />

      {editing && <PlanEditor onSaved={() => setEditing(false)} />}

      {showTemplates && (
        <section className="space-y-3">
          <div><p className="section-kicker">Rutinas listas para usar</p><h2 className="section-title">Elige, personaliza y empieza</h2></div>
          <RoutineTemplates onAdded={() => setShowTemplates(false)} />
        </section>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : plans.length === 0 && !editing && !showTemplates ? (
        <div className="card text-center">
          <Icon name="calendar" className="mx-auto h-10 w-10 text-accent" />
          <p className="mt-2 font-medium">Aún no tienes ningún plan</p>
          <p className="mt-1 text-sm text-slate-400">
            Empieza con una rutina prediseñada o crea la tuya con días de gimnasio,
            cardio y descanso.
          </p>
          <button onClick={() => setShowTemplates(true)} className="btn-primary mx-auto mt-4">Ver plantillas</button>
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
                          <button onClick={() => setEditingEx({ planId: plan.id!, di, ei: i })} className="press flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left hover:text-slate-200">
                            <span className="min-w-0 truncate">{e.name} — {e.sets}×{e.reps}</span><span aria-hidden>›</span>
                          </button>
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

      {editingEx && openExName && (
        <ExerciseEditSheet name={openExName} onClose={() => setEditingEx(null)} onReplace={replaceEx} onRemove={removeEx} />
      )}
    </div>
  );
}
