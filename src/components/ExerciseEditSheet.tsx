"use client";

import { useMemo, useState } from "react";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import ExerciseDetailView from "./ExerciseDetailView";
import ExercisePicker from "./ExercisePicker";

// Sheet para ver un ejercicio de un plan/rutina (imagen, GIF y pasos) y, si se
// pasan los callbacks, cambiarlo por otro de forma visual o quitarlo.
export default function ExerciseEditSheet({
  name,
  onClose,
  onReplace,
  onRemove,
}: {
  name: string;
  onClose: () => void;
  onReplace?: (newName: string) => void;
  onRemove?: () => void;
}) {
  const { library } = useExerciseLibrary();
  const exercise = useMemo(() => library.find((e) => e.name === name), [library, name]);
  const [picking, setPicking] = useState(false);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />

        {picking ? (
          <>
            <div className="flex items-center gap-3 border-b border-white/5 p-4">
              <button
                onClick={() => setPicking(false)}
                className="press text-sm font-semibold text-accent"
              >
                ← Volver
              </button>
              <p className="font-semibold">Cambiar ejercicio</p>
            </div>
            <ExercisePicker
              preferredGroup={exercise?.muscleGroup}
              onPick={(newName) => {
                onReplace?.(newName);
                onClose();
              }}
            />
          </>
        ) : (
          <>
            <div className="relative min-h-0 flex-1 overflow-y-auto scroll-momentum">
              <button
                onClick={onClose}
                className="press absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/50 text-lg text-white backdrop-blur"
                aria-label="Cerrar"
              >
                ✕
              </button>
              <ExerciseDetailView name={name} exercise={exercise} />
            </div>
            {(onReplace || onRemove) && (
              <div className="flex gap-2 border-t border-white/5 p-4">
                {onReplace && (
                  <button onClick={() => setPicking(true)} className="btn-secondary flex-1">
                    🔄 Cambiar
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => {
                      onRemove();
                      onClose();
                    }}
                    className="btn-danger flex-1"
                  >
                    ✕ Quitar
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
