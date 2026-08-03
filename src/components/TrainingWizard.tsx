"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTrainingProfiles } from "@/lib/db";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import { generateSession } from "@/lib/sessionGenerator";
import type { FitnessGoal, GeneratedSession, SessionFormat, SessionPreferences, TrainingFocus, TrainingLevel, TrainingPlace } from "@/lib/types";

const EQUIPMENT = [
  { value: "peso corporal", label: "Peso corporal" },
  { value: "mancuernas", label: "Mancuernas" },
  { value: "bandas", label: "Bandas" },
  { value: "barra", label: "Barra y discos" },
  { value: "maquinas", label: "Máquinas y poleas" },
];
const WIZARD_STEPS = ["Persona", "Lugar", "Tipo", "Formato", "Objetivo", "Nivel", "Grupo", "Material", "Tiempo"];

export default function TrainingWizard({ onGenerated, onManual }: { onGenerated: (session: GeneratedSession) => void; onManual: () => void }) {
  const { user } = useAuth();
  const { data: profiles } = useTrainingProfiles();
  const { library, loading } = useExerciseLibrary();
  const [step, setStep] = useState(0);
  const [profileId, setProfileId] = useState("");
  const [place, setPlace] = useState<TrainingPlace>("gimnasio");
  const [focus, setFocus] = useState<TrainingFocus>("mixto");
  const [format, setFormat] = useState<SessionFormat>("clasico");
  const [level, setLevel] = useState<TrainingLevel>("principiante");
  const [goal, setGoal] = useState<FitnessGoal>("salud");
  const [participants, setParticipants] = useState(1);
  const [durationMin, setDurationMin] = useState(45);
  const [equipment, setEquipment] = useState<string[]>(["peso corporal"]);
  const [energy, setEnergy] = useState<SessionPreferences["energy"]>("normal");

  const selectedProfile = profiles.find((profile) => profile.id === profileId);
  const profileName = selectedProfile?.name ?? user?.displayName?.split(" ")[0] ?? "Atleta";

  const chooseProfile = (id: string) => {
    setProfileId(id);
    const profile = profiles.find((item) => item.id === id);
    if (profile) { setLevel(profile.level); setGoal(profile.goal); }
    setStep(1);
  };

  const toggleEquipment = (value: string) => {
    setEquipment((items) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  };

  const finish = () => {
    const preferences: SessionPreferences = { profileId: selectedProfile?.id, profileName, place, focus, format, level, goal, participants, durationMin, equipment, energy };
    onGenerated(generateSession(preferences, library));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="card overflow-hidden !p-0">
        <div className="border-b border-white/5 p-5">
          <p className="section-kicker">Asistente de sesión</p>
          <div className="mt-2 flex items-center justify-between gap-3"><h2 className="text-2xl font-extrabold">¿Cómo vamos a entrenar?</h2><span className="text-xs font-bold text-slate-500">{step + 1}/{WIZARD_STEPS.length}</span></div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-base-700"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }} /></div>
          <p className="mt-2 text-xs text-slate-500">{WIZARD_STEPS[step]}</p>
        </div>

        <div className="space-y-4 p-5">
          {step === 0 && <Question title="¿Quién va a entrenar?" description="El plan tendrá en cuenta su nivel y objetivo."><Choice label={user?.displayName ?? "Cuenta principal"} active={!profileId} onClick={() => chooseProfile("")} />{profiles.map((profile) => <Choice key={profile.id} label={`${profile.name} · ${profile.level}`} active={profileId === profile.id} onClick={() => chooseProfile(profile.id ?? "")} />)}{profiles.length === 0 && <p className="text-xs text-slate-500">Puedes crear perfiles completos desde Perfil. Mientras tanto usaremos tu cuenta principal.</p>}</Question>}
          {step === 1 && <Question title="¿Dónde entrenamos?"><ChoiceGrid><Choice label="Gimnasio" active={place === "gimnasio"} onClick={() => { setPlace("gimnasio"); setEquipment(["maquinas", "mancuernas", "barra"]); setStep(2); }} /><Choice label="En casa" active={place === "casa"} onClick={() => { setPlace("casa"); setEquipment(["peso corporal", "mancuernas"]); setStep(2); }} /><Choice label="Exterior" active={place === "exterior"} onClick={() => { setPlace("exterior"); setEquipment(["peso corporal"]); setStep(2); }} /></ChoiceGrid></Question>}
          {step === 2 && <Question title="¿Qué tipo de sesión quieres?"><ChoiceGrid><Choice label="Musculación" active={focus === "musculacion"} onClick={() => { setFocus("musculacion"); setStep(3); }} /><Choice label="Cardio" active={focus === "cardio"} onClick={() => { setFocus("cardio"); setStep(3); }} /><Choice label="Mezclado" active={focus === "mixto"} onClick={() => { setFocus("mixto"); setStep(3); }} /></ChoiceGrid></Question>}
          {step === 3 && <Question title="¿Cómo medimos el entrenamiento?" description="Puedes entrenar por series o elegir un WOD guiado por tiempo."><Choice label="Clásico · series y repeticiones" active={format === "clasico"} onClick={() => { setFormat("clasico"); setStep(4); }} /><ChoiceGrid>{([{"value":"for-time","label":"For Time"},{"value":"amrap","label":"AMRAP"},{"value":"emom","label":"EMOM"},{"value":"tabata","label":"Tabata 20/10"},{"value":"hyrox","label":"Estilo HYROX"}] as { value: SessionFormat; label: string }[]).map((item) => <Choice key={item.value} label={item.label} active={format === item.value} onClick={() => { setFormat(item.value); if (item.value === "hyrox") setFocus("mixto"); setStep(4); }} />)}</ChoiceGrid><div className="rounded-xl bg-base-800 p-3 text-xs leading-relaxed text-slate-400"><b className="text-slate-200">For Time:</b> termina las rondas lo antes posible · <b className="text-slate-200">AMRAP:</b> máximas rondas en un tiempo · <b className="text-slate-200">EMOM:</b> una estación por minuto.</div></Question>}
          {step === 4 && <Question title="¿Cuál es el objetivo de hoy?"><ChoiceGrid>{(["salud", "perder grasa", "ganar musculo", "fuerza", "resistencia", "movilidad"] as FitnessGoal[]).map((item) => <Choice key={item} label={item} active={goal === item} onClick={() => { setGoal(item); setStep(5); }} />)}</ChoiceGrid></Question>}
          {step === 5 && <Question title="¿Qué nivel quieres hoy?" description="Ajusta volumen, repeticiones e intensidad."><ChoiceGrid>{(["principiante", "intermedio", "avanzado"] as TrainingLevel[]).map((item) => <Choice key={item} label={item} active={level === item} onClick={() => { setLevel(item); setStep(6); }} />)}</ChoiceGrid></Question>}
          {step === 6 && <Question title="¿Entrenas solo o con más gente?" description="Con varias personas crearé un circuito por estaciones."><Choice label="Yo solo" active={participants === 1} onClick={() => { setParticipants(1); setStep(7); }} /><ChoiceGrid>{[2, 3, 4, 5, 6].map((count) => <Choice key={count} label={`${count} personas`} active={participants === count} onClick={() => { setParticipants(count); setStep(7); }} />)}</ChoiceGrid></Question>}
          {step === 7 && <Question title="¿Qué material quieres utilizar?" description="Puedes seleccionar varias opciones."><ChoiceGrid>{EQUIPMENT.map((item) => <Choice key={item.value} label={item.label} active={equipment.includes(item.value)} onClick={() => toggleEquipment(item.value)} />)}</ChoiceGrid><button onClick={() => setStep(8)} disabled={equipment.length === 0 && focus !== "cardio"} className="btn-primary mt-3 w-full">Continuar</button></Question>}
          {step === 8 && <Question title="Últimos ajustes"><p className="label">Tiempo disponible</p><ChoiceGrid>{[12, 20, 30, 45, 60].map((minutes) => <Choice key={minutes} label={`${minutes} min`} active={durationMin === minutes} onClick={() => setDurationMin(minutes)} />)}</ChoiceGrid><p className="label mt-4">¿Cómo te encuentras?</p><ChoiceGrid>{(["baja", "normal", "alta"] as const).map((item) => <Choice key={item} label={`Energía ${item}`} active={energy === item} onClick={() => setEnergy(item)} />)}</ChoiceGrid>{selectedProfile?.limitations && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">Tendré en cuenta esta precaución: {selectedProfile.limitations}</div>}<button onClick={finish} disabled={loading || library.length === 0} className="btn-primary mt-4 w-full py-3">{loading ? "Cargando ejercicios…" : format === "clasico" ? "Generar mi sesión" : "Generar mi WOD"}</button></Question>}
        </div>

        <div className="flex items-center justify-between border-t border-white/5 px-5 py-4"><button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} className="text-sm font-semibold text-slate-400 disabled:opacity-30">← Atrás</button><button onClick={onManual} className="text-xs text-slate-500 hover:text-accent">Entrenar manualmente</button></div>
      </div>
    </div>
  );
}

function Question({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <div className="space-y-3"><div><h3 className="text-lg font-bold">{title}</h3>{description && <p className="mt-1 text-sm text-slate-400">{description}</p>}</div>{children}</div>;
}

function ChoiceGrid({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{children}</div>; }

function Choice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`press w-full rounded-xl border px-3 py-3 text-left text-sm font-semibold capitalize transition ${active ? "border-accent/60 bg-accent/15 text-accent" : "border-base-600 bg-base-800 text-slate-300 hover:border-base-500"}`}>{label}</button>;
}
