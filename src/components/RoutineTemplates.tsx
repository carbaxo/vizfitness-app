"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addPlan } from "@/lib/db";
import {
  ROUTINE_GROUPS,
  ROUTINE_TEMPLATES,
  type RoutineGroup,
  type RoutineTemplate,
} from "@/lib/routineTemplates";
import type { PlanDay } from "@/lib/types";
import ExerciseEditSheet from "./ExerciseEditSheet";
import ExercisePicker from "./ExercisePicker";

const LEVEL_COLOR: Record<RoutineTemplate["level"], string> = {
  Principiante: "bg-emerald-500/15 text-emerald-400",
  Intermedio: "bg-amber-500/15 text-amber-400",
  Avanzado: "bg-red-500/15 text-red-400",
};

const cloneDays = (days: PlanDay[]): PlanDay[] =>
  days.map((d) => ({ ...d, exercises: d.exercises.map((e) => ({ ...e })) }));

export default function RoutineTemplates({ onAdded }: { onAdded?: () => void }) {
  const { user } = useAuth();
  const [preview, setPreview] = useState<RoutineTemplate | null>(null);
  const [draft, setDraft] = useState<PlanDay[]>([]);
  const [editing, setEditing] = useState<{ di: number; ei: number } | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [group, setGroup] = useState<RoutineGroup>("gimnasio");

  const shown = ROUTINE_TEMPLATES.filter((t) => t.group === group);

  const open = (tpl: RoutineTemplate) => {
    setPreview(tpl);
    setDraft(cloneDays(tpl.days));
    setEditing(null);
    setAdding(null);
  };
  const close = () => {
    setPreview(null);
    setEditing(null);
    setAdding(null);
  };

  const replaceEx = (di: number, ei: number, name: string) =>
    setDraft((ds) =>
      ds.map((d, i) =>
        i !== di ? d : { ...d, exercises: d.exercises.map((e, j) => (j !== ei ? e : { ...e, name })) }
      )
    );
  const removeEx = (di: number, ei: number) =>
    setDraft((ds) =>
      ds.map((d, i) => (i !== di ? d : { ...d, exercises: d.exercises.filter((_, j) => j !== ei) }))
    );
  const addEx = (di: number, name: string) =>
    setDraft((ds) =>
      ds.map((d, i) => (i !== di ? d : { ...d, exercises: [...d.exercises, { name, sets: 3, reps: "8-12" }] }))
    );

  const add = async () => {
    if (!user || !preview) return;
    setAddingId(preview.id);
    try {
      await addPlan(user.uid, {
        name: preview.name,
        description: preview.description,
        days: draft,
        active: false,
        createdAt: Date.now(),
      });
      close();
      onAdded?.();
    } catch (e) {
      alert("No se pudo añadir la rutina.");
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {ROUTINE_GROUPS.map((g) => (
          <button
            key={g.value}
            onClick={() => setGroup(g.value)}
            className={`press flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
              group === g.value
                ? "border-accent/40 bg-accent/12 text-accent"
                : "border-white/10 bg-base-800 text-slate-300"
            }`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((tpl) => (
          <div key={tpl.id} className="card space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{tpl.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{tpl.name}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={`chip ${LEVEL_COLOR[tpl.level]}`}>{tpl.level}</span>
                  <span className="chip bg-base-800 text-slate-300">{tpl.daysPerWeek} días/sem</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400">{tpl.description}</p>
            <button onClick={() => open(tpl)} className="btn-primary w-full">
              Ver y personalizar
            </button>
          </div>
        ))}
      </div>

      {preview && (
        <div className="sheet-backdrop" onClick={close}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grabber" />
            <div className="flex items-start justify-between gap-3 border-b border-white/5 p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {preview.emoji} {preview.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{preview.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Toca un ejercicio para ver cómo se hace, cambiarlo o quitarlo antes de añadir la
                  rutina.
                </p>
              </div>
              <button
                onClick={close}
                className="press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-base-800 text-lg"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5 scroll-momentum">
              {draft.map((day, di) => (
                <div key={di} className="rounded-2xl border border-white/[0.06] bg-base-800/50 p-3">
                  <p className="text-sm font-semibold">
                    {day.type === "descanso" ? "😴" : day.type === "cardio" ? "🏃" : "🏋️"} {day.name}
                  </p>
                  {day.focus && <p className="text-xs text-slate-400">{day.focus}</p>}

                  {day.type === "gym" && (
                    <ul className="mt-2 space-y-0.5">
                      {day.exercises.map((e, ei) => (
                        <li key={ei}>
                          <button
                            onClick={() => setEditing({ di, ei })}
                            className="press flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left text-xs text-slate-300 hover:text-white"
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
                      <li>
                        <button
                          onClick={() => setAdding(di)}
                          className="press mt-1 text-xs font-semibold text-accent"
                        >
                          + Añadir ejercicio
                        </button>
                      </li>
                    </ul>
                  )}

                  {day.type === "cardio" && day.cardioNote && (
                    <p className="mt-2 text-xs text-slate-400">{day.cardioNote}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 p-4">
              <button onClick={add} disabled={addingId === preview.id} className="btn-primary w-full py-3">
                {addingId === preview.id ? "Añadiendo…" : "Añadir a mis planes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && editing && (
        <ExerciseEditSheet
          name={draft[editing.di]?.exercises[editing.ei]?.name ?? ""}
          onClose={() => setEditing(null)}
          onReplace={(name) => replaceEx(editing.di, editing.ei, name)}
          onRemove={() => removeEx(editing.di, editing.ei)}
        />
      )}

      {preview && adding !== null && (
        <div className="sheet-backdrop" onClick={() => setAdding(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grabber" />
            <div className="flex items-center gap-3 border-b border-white/5 p-4">
              <button
                onClick={() => setAdding(null)}
                className="press text-sm font-semibold text-accent"
              >
                ← Volver
              </button>
              <p className="font-semibold">Añadir ejercicio</p>
            </div>
            <ExercisePicker
              onPick={(name) => {
                addEx(adding, name);
                setAdding(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
