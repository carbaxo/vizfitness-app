/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import WorkoutCard from "@/components/WorkoutCard";
import WeeklyChart from "@/components/WeeklyChart";
import PageHero from "@/components/PageHero";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";
import { useGoals, useWorkouts, useBodyMetrics } from "@/lib/db";
import {
  GOAL_TYPE_LABELS,
  formatDuration,
  goalProgress,
  monthCardioKm,
  streakDays,
  weekWorkouts,
  weeklyVolumeSeries,
} from "@/lib/stats";

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { data: workouts, loading } = useWorkouts();
  const { data: goals } = useGoals();
  const { data: metrics } = useBodyMetrics();

  const thisWeek = weekWorkouts(workouts);
  const weekMinutes = thisWeek.reduce((a, w) => a + w.durationMin, 0);
  const weekVolume = thisWeek.reduce((a, w) => a + (w.volumeKg || 0), 0);
  const series = weeklyVolumeSeries(workouts);
  const streak = streakDays(workouts);
  const latestWeight = metrics[0]?.weightKg;

  const firstName = user?.displayName?.split(" ")[0] ?? "atleta";

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Tu panel de rendimiento"
        title={`Hola, ${firstName}`}
        description={thisWeek.length > 0 ? `Ya llevas ${thisWeek.length} ${thisWeek.length === 1 ? "sesión" : "sesiones"} esta semana. Mantén el ritmo y supera tu mejor versión.` : "Tu próxima mejora empieza hoy. Registra una sesión y convierte cada entrenamiento en progreso medible."}
        image="/images/fitness-hero.webp"
        action={<Link href="/entrenar" className="btn-primary px-5 py-3"><Icon name="dumbbell" className="h-4 w-4" /> Empezar entrenamiento</Link>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Racha"
          value={`${streak} ${streak === 1 ? "día" : "días"}`}
          sub="días seguidos entrenando"
        />
        <StatCard
          label="Esta semana"
          value={`${thisWeek.length} sesiones`}
          sub={formatDuration(weekMinutes)}
          accent="blue"
        />
        <StatCard
          label="Cardio este mes"
          value={`${monthCardioKm(workouts).toFixed(1)} km`}
          accent="orange"
        />
        <StatCard
          label="Volumen semanal"
          value={`${Math.round(weekVolume).toLocaleString("es-ES")} kg`}
          sub={latestWeight ? `peso corporal: ${latestWeight} kg` : undefined}
        />
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div><p className="section-kicker">Acceso rápido</p><h2 className="section-title">¿Qué quieres entrenar hoy?</h2></div>
          <Link href="/planes" className="text-xs font-semibold text-accent hover:underline">Ver mi plan →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/entrenar" className="media-card">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/strength-training.webp`} alt="Entrenamiento de fuerza" />
            <div className="media-card-content"><span className="chip bg-gym/20 text-gym">Fuerza</span><h3 className="mt-2 text-xl font-bold">Gimnasio</h3><p className="text-sm text-slate-300">Series, pesos y descansos en vivo</p></div>
          </Link>
          <Link href="/entrenar" className="media-card">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/cardio-running.webp`} alt="Entrenamiento de cardio" />
            <div className="media-card-content"><span className="chip bg-cardio/20 text-cardio">Cardio</span><h3 className="mt-2 text-xl font-bold">Salir a entrenar</h3><p className="text-sm text-slate-300">Distancia, ritmo, pulso y ruta</p></div>
          </Link>
          <Link href="/planes" className="media-card">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/training-plan.webp`} alt="Planificación de entrenamiento" />
            <div className="media-card-content"><span className="chip bg-accent/20 text-accent">Planificación</span><h3 className="mt-2 text-xl font-bold">Mi semana</h3><p className="text-sm text-slate-300">Organiza sesiones y objetivos</p></div>
          </Link>
        </div>
      </section>

      {workouts.length > 0 && (
        <div className="card">
          <p className="section-kicker">Tendencia</p><h2 className="mb-3 section-title">Actividad de las últimas 8 semanas</h2>
          <WeeklyChart data={series} />
        </div>
      )}

      {goals.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2"><Icon name="target" className="h-5 w-5 text-accent" />Objetivos</h2>
            <Link href="/progreso" className="text-xs text-accent hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {goals.slice(0, 4).map((g) => {
              const current = goalProgress(g, workouts, metrics[0]?.weightKg);
              const pct = Math.min(100, (current / g.target) * 100);
              const unit = GOAL_TYPE_LABELS[g.type].unit;
              return (
                <div key={g.id} className="card">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-slate-400">
                      {Math.round(current * 10) / 10} / {g.target} {unit}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-base-700">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Últimos entrenamientos</h2>
          {workouts.length > 6 && (
            <Link href="/historial" className="text-xs text-accent hover:underline">
              Ver historial completo
            </Link>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Cargando…</p>
        ) : workouts.length === 0 ? (
          <div className="card text-center">
            <p className="text-4xl">🌱</p>
            <p className="mt-2 font-medium">Todavía no hay entrenamientos</p>
            <p className="mt-1 text-sm text-slate-400">
              Registra tu primera sesión de cardio o gimnasio y empieza a ver tu
              progreso.
            </p>
            <Link href="/entrenar" className="btn-primary mt-4">
              Registrar entrenamiento
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.slice(0, 6).map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
