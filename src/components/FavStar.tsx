"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { addFavorite, favKey, removeFavorite, useFavoriteExercises } from "@/lib/db";
import type { Exercise } from "@/lib/types";

/**
 * Estrella de favoritos.
 *
 * El componente es solo pintura: recibe si está marcado y qué hacer al
 * pulsarlo. La suscripción a Firestore va en `useFavorites()`, que se llama
 * UNA vez por pantalla — si cada estrella se suscribiera por su cuenta, la
 * biblioteca abriría 1.324 escuchas en tiempo real.
 */
export default function FavStar({
  active,
  onToggle,
  className = "",
  size = "md",
}: {
  active: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        // La estrella suele ir encima de una tarjeta que también es pulsable
        e.stopPropagation();
        e.preventDefault();
        onToggle();
      }}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Añadir a favoritos"}
      title={active ? "Quitar de favoritos" : "Añadir a favoritos"}
      className={`press grid shrink-0 place-items-center rounded-full transition ${
        size === "sm" ? "h-8 w-8 text-base" : "h-9 w-9 text-lg"
      } ${
        active
          ? "text-accent"
          : "text-slate-500 hover:text-slate-300"
      } ${className}`}
    >
      <span className={active ? "animate-pop" : ""}>{active ? "★" : "☆"}</span>
    </button>
  );
}

/**
 * Estado de favoritos de una pantalla: la lista, un test rápido por nombre y
 * el interruptor. Llamar una vez por pantalla y pasar el resultado a las
 * estrellas.
 */
export function useFavorites() {
  const { user } = useAuth();
  const { data: favorites, loading } = useFavoriteExercises();

  const keys = useMemo(
    () => new Set(favorites.map((f) => favKey(f.name))),
    [favorites]
  );

  const isFavorite = (name: string) => keys.has(favKey(name));

  const toggle = (exercise: Exercise) => {
    if (!user) return;
    if (isFavorite(exercise.name)) void removeFavorite(user.uid, exercise.name);
    else void addFavorite(user.uid, exercise);
  };

  return { favorites, loading, isFavorite, toggle };
}
