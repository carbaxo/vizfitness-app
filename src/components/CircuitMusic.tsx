"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GROOVE_STYLES, Groove, type GrooveStyle } from "@/lib/groove";

/**
 * Música para los circuitos. Dos fuentes:
 *
 * - **Ritmo integrado**: se sintetiza en el navegador (ver lib/groove.ts). No
 *   hay archivos que descargar, funciona sin conexión y sigue al cronómetro.
 * - **Tus canciones**: archivos del móvil o del ordenador, con un `<audio>`
 *   normal. No se suben a ningún sitio —object URLs, que solo existen en la
 *   pestaña.
 *
 * No hay integración con Spotify ni similares: necesitaría OAuth, un backend
 * y una licencia, y aun así no dejan reproducir pistas completas desde una web.
 *
 * Los avisos del cronómetro no dependen de esto: son WebAudio, van por su
 * canal y se oyen por encima de la música (también de la que estés
 * escuchando en otra app, que esto no interrumpe).
 */
export interface Track {
  name: string;
  url: string;
}

export type MusicSource = "ninguna" | "ritmo" | "mias";

export function useCircuitMusic() {
  const [source, setSource] = useState<MusicSource>("ritmo");
  const [style, setStyle] = useState<GrooveStyle>("pulso");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [idx, setIdx] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const grooveRef = useRef<Groove | null>(null);
  if (!grooveRef.current && typeof window !== "undefined") grooveRef.current = new Groove();

  useEffect(() => {
    grooveRef.current?.setStyle(style);
  }, [style]);

  useEffect(() => {
    grooveRef.current?.setVolume(volume);
  }, [volume]);

  // Parar el secuenciador al salir, o se queda sonando
  useEffect(() => () => grooveRef.current?.stop(), []);

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

  return {
    source,
    setSource,
    style,
    setStyle,
    tracks,
    idx,
    addFiles,
    clear,
    next,
    volume,
    setVolume,
    audioRef,
    groove: grooveRef,
  };
}

type Music = ReturnType<typeof useCircuitMusic>;

/** Selector de pistas, para la pantalla de ajustes. */
export function MusicPicker({ music }: { music: Music }) {
  const { tracks, addFiles, clear, source, setSource, style, setStyle } = music;
  return (
    <div>
      <p className="label">Música</p>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {(
          [
            ["ritmo", "🥁 Ritmo"],
            ["mias", "🎵 Mis canciones"],
            ["ninguna", "🔇 Ninguna"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setSource(v)}
            className={`chip ${
              source === v ? "bg-accent/20 text-accent" : "bg-base-800 text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {source === "ritmo" && (
        <div>
          <div className="flex flex-wrap gap-1.5">
            {GROOVE_STYLES.map((g) => (
              <button
                key={g.value}
                onClick={() => setStyle(g.value)}
                className={`chip ${
                  style === g.value ? "bg-gym/20 text-gym" : "bg-base-800 text-slate-400"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            {GROOVE_STYLES.find((g) => g.value === style)?.hint}. Se genera en el
            momento: no hay nada que descargar y acelera o se calma según estés
            trabajando o descansando.
          </p>
        </div>
      )}

      {source === "ninguna" && (
        <p className="text-xs leading-relaxed text-slate-500">
          Sin música propia. Puedes poner tu app de siempre: los avisos del
          cronómetro se oyen por encima sin cortarla.
        </p>
      )}

      {source === "mias" && (
      <>
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
      </>
      )}
    </div>
  );
}

/** Barra de reproducción y el `<audio>` de verdad, para el cronómetro. */
export function MusicBar({
  music,
  playing,
  intense = true,
}: {
  music: Music;
  playing: boolean;
  /** true durante el trabajo; en descanso el ritmo baja de revoluciones. */
  intense?: boolean;
}) {
  const { tracks, idx, next, volume, setVolume, audioRef, source, style, groove } = music;
  const track = tracks[idx];

  // Ritmo integrado: arranca y para con el cronómetro
  useEffect(() => {
    const g = groove.current;
    if (!g) return;
    if (source === "ritmo" && playing) g.start();
    else g.stop();
  }, [source, playing, groove]);

  // En el descanso el ritmo se calma; en el trabajo va a su tempo
  useEffect(() => {
    groove.current?.setTempoScale(intense ? 1 : 0.82);
  }, [intense, groove]);

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

  if (source === "ninguna") return null;

  if (source === "ritmo") {
    const label = GROOVE_STYLES.find((g) => g.value === style)?.label ?? "";
    return (
      <div className="card flex items-center gap-3 !py-2.5 [@media(max-height:560px)]:!py-1">
        <span className="text-base">🥁</span>
        <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
          Ritmo · {label}
          {!intense && <span className="text-slate-500"> · en calma</span>}
        </span>
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

  if (!track) return null;

  return (
    <div className="card flex items-center gap-3 !py-2.5 [@media(max-height:560px)]:!py-1">
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
