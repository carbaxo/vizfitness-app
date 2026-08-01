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
  // Ejercicio abierto para ver/cambiar dentro de un plan guardado.
  const [editingEx, setEditingEx] = useState<{ planId: string; di: number; ei: number } | null>(
    null
  );

  const openExName = editingEx
    ? plans.find((p) => p.id === editingEx.planId)?.days[editingEx.di]?.exercises[editingEx.ei]
        ?.name
    : undefined;

  const replaceEx = async (newName: string) => {
    if (!user || !editingEx) return;
    const plan = plans.find((p) => p.id === editingEx.planId);
    if (!plan?.id) return;
    const days = plan.days.map((d, di) =>
      di !== editingEx.di
        ? d
        : { ...d, exercises: d.exercises.map((e, ei) => (ei !== editingEx.ei ? e : { ...e, name: newName })) }
    );
    await updatePlan(user.uid, plan.id, { days });
  };

  const removeEx = async () => {
    if (!user || !editingEx) return;
    const plan = plans.find((p) => p.id === editingEx.planId);
    if (!plan?.id) return;
    const days = plan.days.map((d, di) =>
      di !== editingEx.di ? d : { ...d, exercises: d.exercises.filter((_, ei) => ei !== editingEx.ei) }
    );
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Planes de entrenamiento</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowTemplates((t) => !t);
              setEditing(false);
            }}
            className="btn-secondary"
          >
            {showTemplates ? "Ocultar" : "📋 Plantillas"}
          </button>
          <button
            onClick={() => {
              setEditing((e) => !e);
              setShowTemplates(false);
            }}
            className="btn-primary"
          >
            {editing ? "Cancelar" : "+ Nuevo plan"}
          </button>
        </div>
      </div>

      {editing && <PlanEditor onSaved={() => setEditing(false)} />}

      {showTemplates && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Rutinas prediseñadas listas para usar. Añádelas a tus planes y edítalas
            a tu gusto.
          </p>
          <RoutineTemplates onAdded={() => setShowTemplates(false)} />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : plans.length === 0 && !editing && !showTemplates ? (
        <div className="card text-center">
          <p className="text-4xl">🗓️</p>
          <p className="mt-2 font-medium">Aún no tienes ningún plan</p>
          <p className="mt-1 text-sm text-slate-400">
            Empieza con una rutina prediseñada o crea la tuya: días de gimnasio,
            cardio y descanso. Después podrás iniciar cada sesión con un toque.
          </p>
          <button
            onClick={() => setShowTemplates(true)}
            className="btn-primary mx-auto mt-4"
          >
            📋 Ver plantillas de rutinas
          </button>
        </div>
      ) : (
        <>
          <p className="-mb-1 text-xs text-slate-500">
            Toca un ejercicio para ver cómo se hace o cambiarlo · pulsa ▶ Iniciar para empezar ese día.
          </p>
          {plans.map((plan) => (
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
                <div key={di} className="rounded-2xl border border-white/[0.06] bg-base-800/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {day.type === "descanso" ? "😴" : day.type === "cardio" ? "🏃" : "🏋️"}{" "}
                      {day.name}
                    </p>
                    {day.type === "gym" && day.exercises.length > 0 && (
                      <Link
                        href={`/entrenar?plan=${plan.id}&dia=${di}`}
                        className="press shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-base-950"
                      >
                        ▶ Iniciar
                      </Link>
                    )}
                  </div>
                  {day.focus && <p className="text-xs text-slate-400">{day.focus}</p>}
                  {day.type === "gym" && (
                    <ul className="mt-2 space-y-0.5">
                      {day.exercises.map((e, i) => (
                        <li key={i}>
                          <button
                            onClick={() => setEditingEx({ planId: plan.id!, di, ei: i })}
                            className="press flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left text-xs text-slate-400 hover:text-slate-200"
                          >
                            <span className="min-w-0 truncate">
                              {e.name}{" "}
                              <span className="text-slate-500">
                                — {e.sets}×{e.reps}
                              </span>
                            </span>
                            <span className="shrink-0 text-slate-600">›</span>
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
          ))}
        </>
      )}

      {editingEx && openExName && (
        <ExerciseEditSheet
          name={openExName}
          onClose={() => setEditingEx(null)}
          onReplace={replaceEx}
          onRemove={removeEx}
        />
      )}
    </div>
  );
}
