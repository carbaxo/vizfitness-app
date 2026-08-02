"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addWorkout } from "@/lib/db";
import { isoDate } from "@/lib/stats";
import { CIRCUIT_TEMPLATES } from "@/lib/circuitTemplates";
import { STATION_EQUIPMENT } from "@/lib/types";
import type { Circuit, CircuitStation, StationEquipment, Workout } from "@/lib/types";
import { finishSignal, goSignal, tick } from "@/lib/beep";
import { useExerciseIndex } from "@/lib/exerciseLibrary";
import ExerciseImage from "./ExerciseImage";
import ExerciseEditSheet from "./ExerciseEditSheet";

const PREP_SEC = 10;

const equipmentOf = (e: StationEquipment) =>
  STATION_EQUIPMENT.find((x) => x.value === e) ?? STATION_EQUIPMENT[0];

const mmss = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

// ------------------------------------------------------------------- pasos
// El circuito se aplana a una lista de pasos ANTES de empezar. Así el
// cronómetro solo tiene que avanzar un índice, y la barra de progreso y el
// "siguiente:" salen de mirar la lista en vez de recalcular el estado.
type Step =
  | { kind: "prep"; sec: number }
  | { kind: "work"; sec: number; round: number; station: number }
  | { kind: "transition"; sec: number; round: number; nextStation: number }
  | { kind: "roundRest"; sec: number; round: number };

function buildSteps(circuit: Circuit): Step[] {
  const steps: Step[] = [{ kind: "prep", sec: PREP_SEC }];
  for (let r = 1; r <= circuit.rounds; r++) {
    circuit.stations.forEach((st, i) => {
      steps.push({ kind: "work", sec: st.workSec, round: r, station: i });
      if (i < circuit.stations.length - 1) {
        steps.push({
          kind: "transition",
          sec: circuit.transitionSec,
          round: r,
          nextStation: i + 1,
        });
      }
    });
    if (r < circuit.rounds) {
      steps.push({ kind: "roundRest", sec: circuit.roundRestSec, round: r });
    }
  }
  return steps;
}

const totalSeconds = (circuit: Circuit) =>
  buildSteps(circuit).reduce((a, s) => a + s.sec, 0);

// ==================================================================== vista
export default function CircuitSession() {
  const [circuit, setCircuit] = useState<Circuit | null>(null);

  return circuit ? (
    <Runner circuit={circuit} onExit={() => setCircuit(null)} />
  ) : (
    <Setup onStart={setCircuit} />
  );
}

// ---------------------------------------------------------------- ajustes
function Setup({ onStart }: { onStart: (c: Circuit) => void }) {
  const [pick, setPick] = useState(0);
  const template = CIRCUIT_TEMPLATES[pick];
  const [rounds, setRounds] = useState(template.rounds);
  const [transitionSec, setTransitionSec] = useState(template.transitionSec);
  const [roundRestSec, setRoundRestSec] = useState(template.roundRestSec);
  const [off, setOff] = useState<Set<number>>(new Set());
  const [detail, setDetail] = useState<CircuitStation | null>(null);
  const { find } = useExerciseIndex();

  const choose = (i: number) => {
    const t = CIRCUIT_TEMPLATES[i];
    setPick(i);
    setRounds(t.rounds);
    setTransitionSec(t.transitionSec);
    setRoundRestSec(t.roundRestSec);
    setOff(new Set());
  };

  const stations = template.stations.filter((_, i) => !off.has(i));
  const circuit: Circuit = { ...template, stations, rounds, transitionSec, roundRestSec };
  const mins = Math.round(totalSeconds(circuit) / 60);

  // Material que hace falta, para saber de un vistazo qué sacar del cajón
  const kit = Array.from(new Set(stations.map((s) => s.equipment)));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {CIRCUIT_TEMPLATES.map((t, i) => (
          <button
            key={t.name}
            onClick={() => choose(i)}
            className={`card press text-left transition ${
              i === pick ? "!border-accent ring-1 ring-accent/50" : "hover:bg-base-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{t.emoji}</span>
              <p className="font-semibold">{t.name}</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{t.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              {t.stations.length} estaciones · {t.rounds}{" "}
              {t.rounds === 1 ? "ronda" : "rondas"}
            </p>
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold">Ajustes</p>
          <p className="text-sm text-slate-400">
            ≈ <span className="font-bold text-accent">{mins} min</span> en total
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Rondas" value={rounds} min={1} max={12} onChange={setRounds} />
          <Field
            label="Entre estaciones"
            value={transitionSec}
            min={5}
            max={120}
            step={5}
            suffix="s"
            onChange={setTransitionSec}
          />
          <Field
            label="Entre rondas"
            value={roundRestSec}
            min={0}
            max={300}
            step={15}
            suffix="s"
            onChange={setRoundRestSec}
          />
        </div>

        <div>
          <p className="label">Material</p>
          <div className="flex flex-wrap gap-1.5">
            {kit.map((e) => {
              const eq = equipmentOf(e);
              return (
                <span key={e} className="chip bg-base-800 text-slate-300">
                  {eq.emoji} {eq.label}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <p className="label">
            Estaciones · toca para quitar la que no puedas hacer
          </p>
          <div className="space-y-1.5">
            {template.stations.map((st, i) => {
              const disabled = off.has(i);
              const eq = equipmentOf(st.equipment);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition ${
                    disabled
                      ? "border-base-700 opacity-45"
                      : "border-base-600 bg-base-800/60"
                  }`}
                >
                  {/* La miniatura abre la ficha con el GIF: por el nombre no
                      siempre se sabe cuál es el ejercicio. */}
                  <button
                    onClick={() => setDetail(st)}
                    className="press shrink-0"
                    aria-label={`Ver ${st.name}`}
                  >
                    <ExerciseImage
                      media={find(st.libraryName ?? "")?.media}
                      alt={st.name}
                      className="h-10 w-10 rounded-lg !text-base"
                    />
                  </button>
                  <button
                    onClick={() =>
                      setOff((s) => {
                        const n = new Set(s);
                        if (n.has(i)) n.delete(i);
                        else if (s.size < template.stations.length - 1) n.add(i);
                        return n;
                      })
                    }
                    className={`min-w-0 flex-1 text-left text-sm ${
                      disabled ? "text-slate-600 line-through" : "text-slate-200"
                    }`}
                  >
                    <span className="block truncate">
                      {eq.emoji} {st.name}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {st.reps ?? `${st.workSec}s`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => onStart(circuit)}
        disabled={stations.length === 0}
        className="btn-primary w-full py-3 text-base"
      >
        Empezar circuito
      </button>

      {detail && (
        <ExerciseEditSheet
          name={detail.name}
          libraryName={detail.libraryName}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(clamp(value - step))}
          className="btn-secondary !px-2.5 !py-1.5"
          aria-label={`Bajar ${label}`}
        >
          −
        </button>
        <span className="flex-1 text-center text-sm font-bold tabular-nums">
          {value}
          {suffix}
        </span>
        <button
          onClick={() => onChange(clamp(value + step))}
          className="btn-secondary !px-2.5 !py-1.5"
          aria-label={`Subir ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ cronómetro
function Runner({ circuit, onExit }: { circuit: Circuit; onExit: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const steps = useMemo(() => buildSteps(circuit), [circuit]);

  const [idx, setIdx] = useState(0);
  const [endsAt, setEndsAt] = useState<number | null>(() => Date.now() + PREP_SEC * 1000);
  const [leftPaused, setLeftPaused] = useState(PREP_SEC * 1000);
  const [remaining, setRemaining] = useState(PREP_SEC);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [detail, setDetail] = useState<CircuitStation | null>(null);
  const { find } = useExerciseIndex();
  const lastTick = useRef<number>(-1);

  const step = steps[Math.min(idx, steps.length - 1)];
  const paused = endsAt === null;

  const advance = useCallback(
    (to: number) => {
      if (to >= steps.length) {
        setIdx(steps.length);
        setDone(true);
        setEndsAt(null);
        finishSignal();
        return;
      }
      setIdx(to);
      setRemaining(steps[to].sec);
      setEndsAt(Date.now() + steps[to].sec * 1000);
      lastTick.current = -1;
      goSignal();
    },
    [steps]
  );

  // Un único intervalo. El tiempo restante se calcula contra un instante
  // absoluto, no restando de un contador: así no se desfasa aunque el
  // navegador ralentice el temporizador con la pantalla apagada.
  useEffect(() => {
    if (endsAt === null || done) return;
    const id = setInterval(() => {
      const ms = endsAt - Date.now();
      const sec = Math.max(0, Math.ceil(ms / 1000));
      setRemaining(sec);
      if (sec <= 3 && sec > 0 && lastTick.current !== sec) {
        lastTick.current = sec;
        tick();
      }
      if (ms <= 0) advance(idx + 1);
    }, 100);
    return () => clearInterval(id);
  }, [endsAt, idx, done, advance]);

  // Mantener la pantalla encendida mientras dura el circuito
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> };
    };
    nav.wakeLock
      ?.request("screen")
      .then((l) => {
        lock = l;
      })
      .catch(() => {
        // el navegador no lo soporta o lo deniega en segundo plano
      });
    return () => {
      void lock?.release().catch(() => {});
    };
  }, []);

  const toggle = () => {
    if (paused) {
      setEndsAt(Date.now() + leftPaused);
    } else {
      setLeftPaused(Math.max(0, (endsAt ?? 0) - Date.now()));
      setEndsAt(null);
    }
  };

  // Lo hecho es siempre lo que queda por detrás del índice: al terminar de
  // forma natural el índice se lleva al final, y si se corta a media sesión
  // se queda donde estaba. Así "Terminar" no regala rondas sin hacer.
  const workDone = useMemo(
    () => steps.slice(0, idx).filter((s) => s.kind === "work"),
    [steps, idx]
  );
  const roundsDone = Math.floor(workDone.length / circuit.stations.length);
  const workSecDone = workDone.reduce((a, s) => a + s.sec, 0);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const workout: Omit<Workout, "id"> = {
        type: "circuito",
        name: circuit.name,
        date: isoDate(new Date()),
        durationMin: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
        circuit: {
          stations: circuit.stations.map((s) => ({
            name: s.name,
            equipment: s.equipment,
          })),
          rounds: roundsDone,
          plannedRounds: circuit.rounds,
          transitionSec: circuit.transitionSec,
          workSec: workSecDone,
        },
        createdAt: Date.now(),
      };
      await addWorkout(user.uid, workout);
      router.push("/");
    } catch (e) {
      alert("No se pudo guardar el circuito. Inténtalo de nuevo.");
      console.error(e);
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="card space-y-4 text-center">
        <p className="text-5xl">🏁</p>
        <div>
          <p className="text-xl font-bold">Circuito terminado</p>
          <p className="mt-1 text-sm text-slate-400">{circuit.name}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Rondas" value={`${roundsDone}/${circuit.rounds}`} />
          <Stat label="Trabajo" value={mmss(workSecDone)} />
          <Stat
            label="Total"
            value={mmss(Math.round((Date.now() - startedAt) / 1000))}
          />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full py-3">
          {saving ? "Guardando…" : "Guardar en el historial"}
        </button>
        <button onClick={onExit} className="btn-secondary w-full">
          Descartar y elegir otro
        </button>
      </div>
    );
  }

  const station =
    step.kind === "work"
      ? circuit.stations[step.station]
      : step.kind === "transition"
        ? circuit.stations[step.nextStation]
        : circuit.stations[0];
  const nextWork = steps.slice(idx + 1).find((s) => s.kind === "work") as
    | Extract<Step, { kind: "work" }>
    | undefined;

  const tone =
    step.kind === "work"
      ? { text: "text-accent", bar: "bg-accent", ring: "ring-accent/40" }
      : step.kind === "transition"
        ? { text: "text-gym", bar: "bg-gym", ring: "ring-gym/40" }
        : { text: "text-slate-300", bar: "bg-slate-500", ring: "ring-white/10" };

  const title =
    step.kind === "prep"
      ? "Preparado…"
      : step.kind === "work"
        ? "Trabajo"
        : step.kind === "transition"
          ? "Cambio de estación"
          : "Descanso de ronda";

  const round = step.kind === "prep" ? 1 : step.round;
  const pct = step.sec > 0 ? ((step.sec - remaining) / step.sec) * 100 : 100;

  return (
    <div className="space-y-4">
      <div className={`card ring-1 ${tone.ring}`}>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>{title}</span>
          <span>
            Ronda {round}/{circuit.rounds}
            {step.kind === "work" && ` · Estación ${step.station + 1}/${circuit.stations.length}`}
          </span>
        </div>

        <p
          className={`mt-1 text-center text-[64px] font-bold leading-none tabular-nums tracking-tightest ${tone.text}`}
        >
          {mmss(remaining)}
        </p>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-base-800">
          <div
            className={`h-full rounded-full transition-[width] duration-200 ease-linear ${tone.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 text-center">
          {step.kind === "roundRest" ? (
            <p className="text-lg font-semibold">Respira. Vuelve a empezar.</p>
          ) : (
            <>
              <p className="text-xs text-slate-500">
                {step.kind === "work" ? "Ahora" : "A continuación"}
              </p>
              {/* La imagen del ejercicio, y al tocarla la ficha con el GIF:
                  en transición enseña ya la estación que viene, que es
                  justo cuando te hace falta saber qué toca. */}
              <button
                onClick={() => setDetail(station)}
                className="press mx-auto mt-2 block"
                aria-label={`Ver ${station.name}`}
              >
                <ExerciseImage
                  media={find(station.libraryName ?? "")?.media}
                  alt={station.name}
                  className="h-28 w-28 rounded-2xl"
                />
              </button>
              <p className="mt-2 text-xl font-bold">{station.name}</p>
              <p className="mt-1 text-sm text-slate-400">
                {equipmentOf(station.equipment).emoji}{" "}
                {equipmentOf(station.equipment).label}
                {station.reps ? ` · ${station.reps}` : ""}
              </p>
              {station.note && (
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                  {station.note}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {step.kind === "work" && nextWork && (
        <p className="text-center text-xs text-slate-500">
          Siguiente: {circuit.stations[nextWork.station].name}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button onClick={toggle} className="btn-secondary py-3">
          {paused ? "▶ Seguir" : "⏸ Pausa"}
        </button>
        <button onClick={() => advance(idx + 1)} className="btn-secondary py-3">
          ⏭ Saltar
        </button>
        <button
          onClick={() => {
            if (confirm("¿Terminar el circuito aquí?")) {
              setEndsAt(null);
              setDone(true);
            }
          }}
          className="btn-danger py-3"
        >
          Terminar
        </button>
      </div>

      {detail && (
        <ExerciseEditSheet
          name={detail.name}
          libraryName={detail.libraryName}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-base-800/60 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 font-bold tabular-nums">{value}</p>
    </div>
  );
}
