"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addPlan, useCustomExercises } from "@/lib/db";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import type { PlanDay, PlanExercise } from "@/lib/types";

const EMPTY_DAY = (): PlanDay => ({
  name: "",
  type: "gym",
  exercises: [],
});

export default function PlanEditor({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const { data: custom } = useCustomExercises();
  const { library } = useExerciseLibrary();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<PlanDay[]>([{ ...EMPTY_DAY(), name: "Día 1" }]);
  const [saving, setSaving] = useState(false);

  const exerciseNames = useMemo(
    () => [...custom.map((e) => e.name), ...library.map((e) => e.name)],
    [custom, library]
  );

  const updateDay = (i: number, patch: Partial<PlanDay>) => {
    setDays((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  };

  const addDay = () => {
    setDays((ds) => [...ds, { ...EMPTY_DAY(), name: `Día ${ds.length + 1}` }]);
  };

  const removeDay = (i: number) => {
    setDays((ds) => ds.filter((_, j) => j !== i));
  };

  const addExercise = (di: number) => {
    updateDay(di, {
      exercises: [...days[di].exercises, { name: "", sets: 3, reps: "8-12" }],
    });
  };

  const updateExercise = (di: number, ei: number, patch: Partial<PlanExercise>) => {
    updateDay(di, {
      exercises: days[di].exercises.map((e, j) => (j === ei ? { ...e, ...patch } : e)),
    });
  };

  const removeExercise = (di: number, ei: number) => {
    updateDay(di, { exercises: days[di].exercises.filter((_, j) => j !== ei) });
  };

  const save = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const cleaned = days
        .map((d) => ({
          ...d,
          name: d.name.trim() || "Día",
          exercises:
            d.type === "gym" ? d.exercises.filter((e) => e.name.trim()) : [],
        }))
        .filter((d) => d.type !== "gym" || d.exercises.length > 0 || d.name);
      await addPlan(user.uid, {
        name: name.trim(),
        description: description.trim() || undefined,
        days: cleaned,
        active: false,
        createdAt: Date.now(),
      } as never);
      onSaved();
    } catch (e) {
      alert("No se pudo guardar el plan.");
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="card space-y-4">
      <p className="text-lg font-semibold">Nuevo plan de entrenamiento</p>
      <input
        className="input"
        placeholder="Nombre del plan (ej. Push Pull Legs)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="input"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <datalist id="plan-exercise-names">
        {exerciseNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {days.map((day, di) => (
        <div key={di} className="rounded-xl border border-base-700/60 bg-base-800/50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input max-w-[180px] !py-1.5"
              placeholder={`Día ${di + 1}`}
              value={day.name}
              onChange={(e) => updateDay(di, { name: e.target.value })}
            />
            <select
              className="input max-w-[140px] !py-1.5"
              value={day.type}
              onChange={(e) => updateDay(di, { type: e.target.value as PlanDay["type"] })}
            >
              <option value="gym">🏋️ Gimnasio</option>
              <option value="cardio">🏃 Cardio</option>
              <option value="descanso">😴 Descanso</option>
            </select>
            <input
              className="input flex-1 !py-1.5"
              placeholder="Enfoque (ej. empuje, pierna…)"
              value={day.focus ?? ""}
              onChange={(e) => updateDay(di, { focus: e.target.value })}
            />
            <button
              onClick={() => removeDay(di)}
              className="text-sm text-red-400 hover:underline"
            >
              Quitar día
            </button>
          </div>

          {day.type === "gym" && (
            <div className="mt-3 space-y-2">
              {day.exercises.map((ex, ei) => (
                <div key={ei} className="grid grid-cols-[1fr_4.5rem_5rem_2rem] items-center gap-2">
                  <input
                    className="input !py-1.5"
                    list="plan-exercise-names"
                    placeholder="Ejercicio"
                    value={ex.name}
                    onChange={(e) => updateExercise(di, ei, { name: e.target.value })}
                  />
                  <input
                    className="input !py-1.5"
                    type="number"
                    min={1}
                    aria-label="Series"
                    value={ex.sets}
                    onChange={(e) => updateExercise(di, ei, { sets: Number(e.target.value) || 1 })}
                  />
                  <input
                    className="input !py-1.5"
                    placeholder="8-12"
                    aria-label="Repeticiones"
                    value={ex.reps}
                    onChange={(e) => updateExercise(di, ei, { reps: e.target.value })}
                  />
                  <button
                    onClick={() => removeExercise(di, ei)}
                    className="text-center text-slate-500 hover:text-red-400"
                    aria-label="Eliminar ejercicio"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_4.5rem_5rem_2rem] gap-2 text-[10px] uppercase text-slate-500">
                <span />
                <span>series</span>
                <span>reps</span>
                <span />
              </div>
              <button
                onClick={() => addExercise(di)}
                className="btn-secondary !px-3 !py-1.5 !text-xs"
              >
                + Ejercicio
              </button>
            </div>
          )}

          {day.type === "cardio" && (
            <input
              className="input mt-3 !py-1.5"
              placeholder="Descripción (ej. 8 km ritmo suave, series 6×400m…)"
              value={day.cardioNote ?? ""}
              onChange={(e) => updateDay(di, { cardioNote: e.target.value })}
            />
          )}
        </div>
      ))}

      <div className="flex gap-3">
        <button onClick={addDay} className="btn-secondary">
          + Añadir día
        </button>
        <button
          onClick={save}
          disabled={saving || !name.trim()}
          className="btn-primary flex-1"
        >
          {saving ? "Guardando…" : "Guardar plan"}
        </button>
      </div>
    </div>
  );
}
