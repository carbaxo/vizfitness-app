"use client";

import type { Exercise } from "@/lib/types";
import ExerciseImage from "./ExerciseImage";

// Contenido de la ficha de un ejercicio (imagen/GIF + grupo/equipo + pasos).
// Sin "chrome" de modal: se usa dentro de sheets (biblioteca, planes, plantillas).
export default function ExerciseDetailView({
  name,
  exercise,
}: {
  name: string;
  exercise?: Exercise;
}) {
  const steps = exercise?.steps?.length
    ? exercise.steps
    : exercise?.instructions
      ? [exercise.instructions]
      : [];

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden sm:aspect-video">
        <ExerciseImage media={exercise?.media} alt={name} alwaysAnimate className="h-full w-full" />
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-bold">{name}</h2>
          {exercise && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip capitalize bg-accent/15 text-accent">
                {exercise.muscleGroup}
              </span>
              {exercise.equipment && (
                <span className="chip bg-base-800 text-slate-300">{exercise.equipment}</span>
              )}
              {exercise.target && (
                <span className="chip bg-base-800 text-slate-300">🎯 {exercise.target}</span>
              )}
            </div>
          )}
        </div>

        {steps.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-300">Cómo se hace</p>
            <ol className="space-y-2">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Este ejercicio no está en la biblioteca ilustrada, así que no tiene imagen ni
            pasos. Puedes cambiarlo por uno que sí los tenga.
          </p>
        )}

        {exercise?.secondary && exercise.secondary.length > 0 && (
          <p className="text-xs text-slate-500">
            Músculos secundarios: {exercise.secondary.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
