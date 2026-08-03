"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import ProgressChart from "@/components/ProgressChart";
import { useAuth } from "@/context/AuthContext";
import { addGoal, deleteGoal, useBodyMetrics, useGoals, useWorkouts } from "@/lib/db";
import {
  GOAL_TYPE_LABELS,
  epley1RM,
  exerciseProgress,
  formatDateShort,
  goalProgress,
  personalRecords,
} from "@/lib/stats";
import type { GoalType } from "@/lib/types";
import Icon from "@/components/Icon";

export default function ProgresoPage() {
  return (
    <AppShell>
      <Progreso />
    </AppShell>
  );
}

function Progreso() {
  const { user } = useAuth();
  const { data: workouts } = useWorkouts();
  const { data: goals } = useGoals();
  const { data: metrics } = useBodyMetrics();

  const prs = useMemo(() => personalRecords(workouts), [workouts]);
  const exerciseNames = prs.map((p) => p.exerciseName);
  const [selected, setSelected] = useState("");
  const chartExercise = selected || exerciseNames[0] || "";
  const progress = useMemo(
    () => (chartExercise ? exerciseProgress(workouts, chartExercise) : []),
    [workouts, chartExercise]
  );

  // Calculadora 1RM
  const [rmWeight, setRmWeight] = useState("");
  const [rmReps, setRmReps] = useState("");
  const rm = epley1RM(parseFloat(rmWeight) || 0, parseInt(rmReps) || 0);

  // Formulario de objetivos
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalType, setGoalType] = useState<GoalType>("distancia_mes");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalExercise, setGoalExercise] = useState("");

  const createGoal = async () => {
    if (!user || !goalTarget) return;
    const target = parseFloat(goalTarget);
    const info = GOAL_TYPE_LABELS[goalType];
    const title =
      goalType === "peso_ejercicio"
        ? `${goalExercise}: ${target} kg`
        : `${info.label}: ${target} ${info.unit}`;
    await addGoal(user.uid, {
      title,
      type: goalType,
      target,
      exerciseName: goalType === "peso_ejercicio" ? goalExercise : undefined,
      createdAt: Date.now(),
    } as never);
    setShowGoalForm(false);
    setGoalTarget("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-base-700/60 bg-gradient-to-br from-accent/15 via-base-900 to-base-900 p-6 md:p-8"><p className="section-kicker">Datos que te hacen mejor</p><div className="mt-1 flex items-end justify-between gap-4"><div><h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Tu progreso</h1><p className="mt-2 max-w-xl text-sm text-slate-400">Analiza tu evolución, celebra nuevos récords y mantén tus objetivos siempre a la vista.</p></div><Icon name="chart" className="hidden h-16 w-16 text-accent/60 sm:block" /></div></div>

      {/* Evolución por ejercicio */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="section-title flex items-center gap-2"><Icon name="chart" className="h-5 w-5 text-accent" />Evolución por ejercicio</h2>
          {exerciseNames.length > 0 && (
            <select
              className="input max-w-[220px] !py-1.5"
              value={chartExercise}
              onChange={(e) => setSelected(e.target.value)}
            >
              {exerciseNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </div>
        {progress.length > 1 ? (
          <ProgressChart data={progress} />
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            Registra al menos dos sesiones con el mismo ejercicio para ver tu
            evolución de peso y 1RM estimado.
          </p>
        )}
      </div>

      {/* Récords personales */}
      <div>
        <h2 className="mb-3 section-title">Récords personales</h2>
        {prs.length === 0 ? (
          <p className="text-sm text-slate-400">
            Tus mejores marcas por ejercicio aparecerán aquí automáticamente.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prs.slice(0, 12).map((pr) => (
              <div key={pr.exerciseName} className="card">
                <p className="text-sm font-semibold">{pr.exerciseName}</p>
                <p className="mt-1 text-xl font-bold text-accent">
                  {pr.maxWeight} kg × {pr.reps}
                </p>
                <p className="text-xs text-slate-500">
                  1RM est.: {Math.round(pr.est1RM * 10) / 10} kg ·{" "}
                  {formatDateShort(pr.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Objetivos */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2"><Icon name="target" className="h-5 w-5 text-accent" />Objetivos</h2>
          <button onClick={() => setShowGoalForm((s) => !s)} className="btn-primary !py-1.5 !text-xs">
            {showGoalForm ? "Cancelar" : "+ Nuevo objetivo"}
          </button>
        </div>

        {showGoalForm && (
          <div className="card mb-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                className="input"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
              >
                {Object.entries(GOAL_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              {goalType === "peso_ejercicio" && (
                <input
                  className="input"
                  placeholder="Ejercicio (ej. Press banca)"
                  value={goalExercise}
                  onChange={(e) => setGoalExercise(e.target.value)}
                />
              )}
              <input
                className="input"
                type="number"
                inputMode="decimal"
                placeholder={`Meta (${GOAL_TYPE_LABELS[goalType].unit})`}
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
              />
            </div>
            <button
              onClick={createGoal}
              disabled={!goalTarget || (goalType === "peso_ejercicio" && !goalExercise)}
              className="btn-primary"
            >
              Crear objetivo
            </button>
          </div>
        )}

        {goals.length === 0 && !showGoalForm ? (
          <p className="text-sm text-slate-400">
            Define metas como “correr 100 km al mes” o “press banca 100 kg” y
            sigue tu avance automáticamente.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {goals.map((g) => {
              const current = goalProgress(g, workouts, metrics[0]?.weightKg);
              const pct = Math.min(100, (current / g.target) * 100);
              const done = pct >= 100;
              return (
                <div key={g.id} className="card">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">
                      {done && "✅ "}
                      {g.title}
                    </span>
                    <button
                      onClick={() => user && g.id && deleteGoal(user.uid, g.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {Math.round(current * 10) / 10} / {g.target}{" "}
                    {GOAL_TYPE_LABELS[g.type].unit}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-base-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        done ? "bg-accent" : "bg-gym"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calculadora 1RM */}
      <div className="card">
        <h2 className="font-semibold">🧮 Calculadora de 1RM</h2>
        <p className="mt-1 text-xs text-slate-400">
          Estima tu repetición máxima con la fórmula de Epley.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            className="input max-w-[130px]"
            type="number"
            inputMode="decimal"
            placeholder="Peso (kg)"
            value={rmWeight}
            onChange={(e) => setRmWeight(e.target.value)}
          />
          <span className="text-slate-400">×</span>
          <input
            className="input max-w-[110px]"
            type="number"
            inputMode="numeric"
            placeholder="Reps"
            value={rmReps}
            onChange={(e) => setRmReps(e.target.value)}
          />
          <span className="text-slate-400">=</span>
          <span className="text-2xl font-bold text-accent">
            {rm > 0 ? `${Math.round(rm * 10) / 10} kg` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
