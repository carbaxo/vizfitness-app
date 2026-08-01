"use client";

import { useEffect, useRef, useState } from "react";

const PRESETS = [60, 90, 120, 180];

// Temporizador de descanso entre series con aviso sonoro y vibración
export default function RestTimer() {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          try {
            navigator.vibrate?.([200, 100, 200]);
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            osc.frequency.value = 880;
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch {
            // sin sonido disponible
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = (sec: number) => {
    setRemaining(sec);
    setRunning(true);
  };

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="card flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-slate-300">⏱️ Descanso</span>
      <span
        className={`min-w-[76px] text-[26px] font-bold tracking-tightest tabular-nums transition-colors ${
          running ? "text-accent drop-shadow-[0_0_10px_rgba(255,111,0,0.5)]" : "text-slate-500"
        }`}
      >
        {mm}:{ss}
      </span>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => start(p)}
            className="btn-secondary !px-3 !py-1.5 !text-xs"
          >
            {p >= 60 ? `${p / 60}min` : `${p}s`}
          </button>
        ))}
        {running && (
          <button
            onClick={() => {
              setRunning(false);
              setRemaining(0);
            }}
            className="btn-danger !px-3 !py-1.5 !text-xs"
          >
            Parar
          </button>
        )}
      </div>
    </div>
  );
}
