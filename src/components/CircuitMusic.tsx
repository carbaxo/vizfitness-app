"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Música para los circuitos.
 *
 * Suenan **archivos tuyos**: se eligen del móvil o del ordenador y se
 * reproducen con un `<audio>` normal. No se suben a ningún sitio —se usan
 * object URLs, que solo existen en la pestaña— y no hay integración con
 * Spotify ni con ningún servicio: eso necesitaría OAuth, un backend y una
 * licencia, y aun así no dejan reproducir pistas completas desde una web.
 *
 * Los avisos del cronómetro no dependen de esto: son WebAudio, van por su
 * canal y se oyen por encima de la música (también de la que estés
 * escuchando en otra app, que esto no interrumpe).
 */
export interface Track {
  name: string;
  url: string;
}

export function useCircuitMusic() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [idx, setIdx] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Las object URL hay que liberarlas a mano o se quedan en memoria
  useEffect(() => {
    return () => {
      for (const t of tracks) URL.revokeObjectURL(t.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const nuevos = Array.from(files)
      .filter((f) => f.type.startsWith("audio/"))
      .map((f) => ({ name: f.name.replace(/\.[^.]+$/, ""), url: URL.createObjectURL(f) }));
    setTracks((t) => [...t, ...nuevos]);
  }, []);

  const clear = useCallback(() => {
    setTracks((t) => {
      for (const x of t) URL.revokeObjectURL(x.url);
      return [];
    });
    setIdx(0);
  }, []);

  const next = useCallback(() => {
    setTracks((t) => {
      setIdx((i) => (t.length ? (i + 1) % t.length : 0));
      return t;
    });
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, idx]);

  return { tracks, idx, addFiles, clear, next, volume, setVolume, audioRef };
}

type Music = ReturnType<typeof useCircuitMusic>;

/** Selector de pistas, para la pantalla de ajustes. */
export function MusicPicker({ music }: { music: Music }) {
  const { tracks, addFiles, clear } = music;
  return (
    <div>
      <p className="label">Música</p>
      {tracks.length === 0 ? (
        <p className="mb-2 text-xs leading-relaxed text-slate-500">
          Elige canciones de tu dispositivo y sonarán durante el circuito. No
          salen de aquí. Si prefieres tu app de música de siempre, déjalo vacío:
          los avisos del cronómetro se oyen por encima sin cortarla.
        </p>
      ) : (
        <p className="mb-2 text-xs text-slate-400">
          {tracks.length} {tracks.length === 1 ? "canción" : "canciones"} ·{" "}
          <button onClick={clear} className="text-red-400 hover:underline">
            quitar
          </button>
        </p>
      )}
      <label className="btn-secondary inline-flex cursor-pointer !px-3 !py-1.5 !text-xs">
        🎵 {tracks.length ? "Añadir más" : "Elegir canciones"}
        <input
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

/** Barra de reproducción y el `<audio>` de verdad, para el cronómetro. */
export function MusicBar({ music, playing }: { music: Music; playing: boolean }) {
  const { tracks, idx, next, volume, setVolume, audioRef } = music;
  const track = tracks[idx];

  // La música sigue al cronómetro: si pausas el circuito, se para.
  // El volumen se aplica aquí y no solo al moverlo, porque el <audio> se monta
  // después de que se elija la canción y se perdía el valor del deslizador.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    if (!playing) {
      el.pause();
      return;
    }
    // Si la pista ya había terminado hay que rebobinarla: con una sola
    // canción el índice no cambia y play() no la reinicia sola.
    if (el.ended) el.currentTime = 0;
    void el.play().catch(() => {});
  }, [playing, idx, volume, audioRef]);

  if (!track) return null;

  return (
    <div className="card flex items-center gap-3 !py-2.5">
      <audio
        ref={audioRef}
        src={track.url}
        onEnded={(e) => {
          // Con una sola canción el índice no cambia, así que se rebobina a
          // mano para que la lista siga sonando en bucle.
          e.currentTarget.currentTime = 0;
          if (tracks.length === 1) void e.currentTarget.play().catch(() => {});
          else next();
        }}
        preload="auto"
        className="hidden"
      />
      <span className="text-base">🎵</span>
      <span className="min-w-0 flex-1 truncate text-xs text-slate-300">{track.name}</span>
      <button
        onClick={next}
        className="press shrink-0 text-xs text-slate-400 hover:text-slate-200"
        aria-label="Siguiente canción"
      >
        ⏭
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-20 shrink-0 accent-accent"
        aria-label="Volumen de la música"
      />
    </div>
  );
}
