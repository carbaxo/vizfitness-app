"use client";

import { useEffect, useState } from "react";
import type { Exercise, MuscleGroup } from "./types";

// Base de datos de ejercicios ilustrada (1.324 ejercicios con imágenes y GIFs).
// Fuente: https://github.com/hasaneyldrm/exercises-dataset (© Gym Visual).
// Los metadatos viven en /public/data/exercises.json (se sirven estáticos), y
// las imágenes/GIFs se cargan bajo demanda desde el CDN de jsDelivr para no
// engordar el repositorio ni el despliegue de GitHub Pages.
const CDN = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main";
// Fallback si el CDN no responde: los mismos ficheros servidos por GitHub.
const RAW = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main";

export const exerciseImage = (media?: string) =>
  media ? `${CDN}/images/${media}.jpg` : undefined;

export const exerciseGif = (media?: string) =>
  media ? `${CDN}/videos/${media}.gif` : undefined;

export const exerciseImageRaw = (media?: string) =>
  media ? `${RAW}/images/${media}.jpg` : undefined;

export const exerciseGifRaw = (media?: string) =>
  media ? `${RAW}/videos/${media}.gif` : undefined;

interface RawExercise {
  id: string;
  name: string;
  group: MuscleGroup;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  secondary?: string[];
  media: string;
  steps?: string[];
}

function datasetUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/data/exercises.json`;
}

// Caché a nivel de módulo: el dataset se descarga una sola vez por sesión y se
// comparte entre todas las pantallas que lo usan (biblioteca, planes, sesión).
let cache: Exercise[] | null = null;
let inflight: Promise<Exercise[]> | null = null;

function loadDataset(): Promise<Exercise[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch(datasetUrl())
    .then((r) => (r.ok ? r.json() : []))
    .then((rows: RawExercise[]) =>
      rows.map<Exercise>((r) => ({
        id: `ds-${r.id}`,
        name: r.name,
        muscleGroup: r.group,
        equipment: r.equipment || undefined,
        instructions: r.steps?.length ? r.steps.join(" ") : undefined,
        steps: r.steps,
        bodyPart: r.bodyPart,
        target: r.target,
        secondary: r.secondary,
        media: r.media,
      }))
    )
    .then((list) => {
      cache = list;
      return list;
    })
    .catch((e) => {
      console.error("No se pudo cargar la base de datos de ejercicios:", e);
      inflight = null; // permite reintentar en la próxima montada
      return [];
    });
  return inflight;
}

// Biblioteca = base de datos ilustrada (hasaneyldrm/exercises-dataset). Las
// pantallas la combinan con los ejercicios personalizados del usuario (que
// vienen de Firestore por separado).
export function useExerciseLibrary() {
  const [dataset, setDataset] = useState<Exercise[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setDataset(cache);
      setLoading(false);
      return;
    }
    let alive = true;
    loadDataset().then((d) => {
      if (!alive) return;
      setDataset(d);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { library: dataset, dataset, loading };
}
