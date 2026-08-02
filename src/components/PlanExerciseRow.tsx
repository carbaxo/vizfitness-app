"use client";

import ExerciseImage from "./ExerciseImage";

/**
 * Una fila de ejercicio dentro de un plan o una plantilla: miniatura, nombre y
 * series × repeticiones.
 *
 * La imagen es lo que hace que un plan se lea de un vistazo — con solo el
 * nombre hay que leer diez líneas para saber de qué va el día.
 *
 * `media` lo resuelve quien la pinta, con `useExerciseIndex()`, para no
 * montar el índice una vez por fila. Si el ejercicio es personalizado no
 * tiene imagen y ExerciseImage pinta su marcador.
 */
export default function PlanExerciseRow({
  name,
  sets,
  reps,
  media,
  onClick,
}: {
  name: string;
  sets: number;
  reps: string;
  media?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <ExerciseImage
        media={media}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-lg !text-base"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-slate-200">{name}</span>
        <span className="block text-[11px] text-slate-500">
          {sets}×{reps}
        </span>
      </span>
      {onClick && <span className="shrink-0 text-slate-600">›</span>}
    </>
  );

  if (!onClick) {
    return <div className="flex items-center gap-2.5 py-1">{inner}</div>;
  }
  return (
    <button
      onClick={onClick}
      className="press flex w-full items-center gap-2.5 rounded-lg py-1 text-left hover:bg-white/[0.03]"
    >
      {inner}
    </button>
  );
}
