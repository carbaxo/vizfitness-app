"use client";

import { useState } from "react";
import {
  exerciseGif,
  exerciseGifRaw,
  exerciseImage,
  exerciseImageRaw,
} from "@/lib/exerciseLibrary";

// Miniatura de ejercicio. Muestra la imagen estática y reproduce el GIF de la
// técnica al pasar el ratón (escritorio). Con `alwaysAnimate` muestra el GIF
// directamente (útil en la ficha de detalle, donde también sirve en móvil).
// Si el CDN (jsDelivr) falla, cae automáticamente al mismo fichero en GitHub.
export default function ExerciseImage({
  media,
  alt,
  className = "",
  alwaysAnimate = false,
}: {
  media?: string;
  alt: string;
  className?: string;
  alwaysAnimate?: boolean;
}) {
  const [play, setPlay] = useState(false);
  const [useRaw, setUseRaw] = useState(false);

  if (!media) {
    return (
      <div
        className={`grid place-items-center bg-base-800 text-2xl text-slate-500 ${className}`}
        aria-hidden
      >
        🏋️
      </div>
    );
  }

  const showGif = alwaysAnimate || play;
  const src = showGif
    ? (useRaw ? exerciseGifRaw(media) : exerciseGif(media))
    : (useRaw ? exerciseImageRaw(media) : exerciseImage(media));

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`bg-white object-contain ${className}`}
      onMouseEnter={() => setPlay(true)}
      onMouseLeave={() => setPlay(false)}
      onError={() => setUseRaw(true)}
    />
  );
}
