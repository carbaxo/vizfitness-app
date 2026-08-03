"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addTrainingProfile, deleteTrainingProfile, updateTrainingProfile, useTrainingProfiles } from "@/lib/db";
import { bmiLabel, bodyMassIndex, healthyWeightRange, profileAge } from "@/lib/profileHealth";
import type { FitnessGoal, ProfileSex, TrainingLevel, TrainingProfile } from "@/lib/types";

const EMPTY: Omit<TrainingProfile, "id" | "createdAt"> = {
  name: "",
  sex: "hombre",
  birthYear: 1990,
  heightCm: 175,
  weightKg: 75,
  level: "principiante",
  goal: "salud",
  activity: "moderada",
  daysPerWeek: 3,
  limitations: "",
};

export default function TrainingProfiles() {
  const { user } = useAuth();
  const { data: profiles, loading } = useTrainingProfiles();
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const edit = (profile: TrainingProfile) => {
    setForm({
      name: profile.name,
      sex: profile.sex,
      birthYear: profile.birthYear,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      level: profile.level,
      goal: profile.goal,
      activity: profile.activity,
      daysPerWeek: profile.daysPerWeek,
      limitations: profile.limitations ?? "",
    });
    setEditingId(profile.id ?? null);
    setOpen(true);
  };

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
    setOpen(false);
  };

  const save = async () => {
    if (!user || !form.name.trim() || !form.heightCm || !form.weightKg) return;
    setSaving(true);
    const payload = { ...form, birthYear: form.birthYear || new Date().getFullYear(), name: form.name.trim(), limitations: form.limitations?.trim() || "" };
    try {
      if (editingId) await updateTrainingProfile(user.uid, editingId, payload);
      else await addTrainingProfile(user.uid, { ...payload, createdAt: Date.now() });
      reset();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (profile: TrainingProfile) => {
    if (!user || !profile.id || !confirm(`¿Eliminar el perfil de ${profile.name}?`)) return;
    await deleteTrainingProfile(user.uid, profile.id);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div><p className="section-kicker">Una cuenta, varios deportistas</p><h2 className="section-title">Perfiles de entrenamiento</h2></div>
        <button onClick={() => { setOpen((value) => !value); setEditingId(null); setForm(EMPTY); }} className="btn-primary !px-3">{open ? "Cancelar" : "+ Perfil"}</button>
      </div>

      {open && (
        <div className="card space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre"><input className="input" value={form.name} placeholder="Rubén, Ana…" onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Sexo"><select className="input" value={form.sex} onChange={(event) => setForm({ ...form, sex: event.target.value as ProfileSex })}><option value="hombre">Hombre</option><option value="mujer">Mujer</option><option value="otro">Otro / prefiero no indicarlo</option></select></Field>
            <Field label="Año de nacimiento"><input className="input" type="number" min={1920} max={new Date().getFullYear()} value={form.birthYear ?? ""} onChange={(event) => setForm({ ...form, birthYear: Number(event.target.value) || undefined })} /></Field>
            <Field label="Altura (cm)"><input className="input" type="number" min={100} max={230} value={form.heightCm} onChange={(event) => setForm({ ...form, heightCm: Number(event.target.value) })} /></Field>
            <Field label="Peso actual (kg)"><input className="input" type="number" inputMode="decimal" min={25} max={300} step={0.1} value={form.weightKg} onChange={(event) => setForm({ ...form, weightKg: Number(event.target.value) })} /></Field>
            <Field label="Nivel"><select className="input" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value as TrainingLevel })}><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></Field>
            <Field label="Objetivo"><select className="input" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value as FitnessGoal })}><option value="salud">Salud general</option><option value="perder grasa">Perder grasa</option><option value="ganar musculo">Ganar músculo</option><option value="fuerza">Ganar fuerza</option><option value="resistencia">Mejorar resistencia</option><option value="movilidad">Movilidad</option></select></Field>
            <Field label="Actividad habitual"><select className="input" value={form.activity} onChange={(event) => setForm({ ...form, activity: event.target.value as TrainingProfile["activity"] })}><option value="baja">Baja</option><option value="moderada">Moderada</option><option value="alta">Alta</option></select></Field>
            <Field label="Días disponibles por semana"><input className="input" type="number" min={1} max={7} value={form.daysPerWeek} onChange={(event) => setForm({ ...form, daysPerWeek: Number(event.target.value) })} /></Field>
          </div>
          <Field label="Lesiones, molestias o limitaciones"><textarea className="input" rows={2} placeholder="Ej.: molestia de rodilla, evitar saltos…" value={form.limitations} onChange={(event) => setForm({ ...form, limitations: event.target.value })} /></Field>
          <p className="text-xs leading-relaxed text-slate-500">El rango de peso se calcula con IMC saludable para adultos. Es orientativo: composición corporal, embarazo, edad, musculatura y condiciones médicas pueden cambiar su interpretación.</p>
          <button onClick={save} disabled={saving || !form.name.trim()} className="btn-primary w-full">{saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear perfil"}</button>
        </div>
      )}

      {loading ? <p className="text-sm text-slate-400">Cargando perfiles…</p> : profiles.length === 0 && !open ? (
        <button onClick={() => setOpen(true)} className="card w-full border-dashed text-left"><p className="font-semibold">Crea tu primer perfil deportivo</p><p className="mt-1 text-sm text-slate-400">Después podrás generar sesiones diferentes para ti, tu pareja, tus hijos o un grupo.</p></button>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} onEdit={() => edit(profile)} onRemove={() => remove(profile)} />)}
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span className="label">{label}</span>{children}</label>;
}

function ProfileCard({ profile, onEdit, onRemove }: { profile: TrainingProfile; onEdit: () => void; onRemove: () => void }) {
  const range = healthyWeightRange(profile.heightCm);
  const bmi = bodyMassIndex(profile.weightKg, profile.heightCm);
  const age = profileAge(profile);
  return (
    <article className="card space-y-3">
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{profile.name}</h3><p className="text-xs capitalize text-slate-400">{age ? `${age} años · ` : ""}{profile.sex} · {profile.level}</p></div><span className="chip bg-accent/15 capitalize text-accent">{profile.goal}</span></div>
      <div className="grid grid-cols-3 gap-2 text-center"><Metric label="Altura" value={`${profile.heightCm} cm`} /><Metric label="Peso" value={`${profile.weightKg} kg`} /><Metric label="IMC" value={String(bmi)} /></div>
      <div className="rounded-xl border border-accent/20 bg-accent/10 p-3"><p className="text-xs font-semibold text-accent">Rango saludable orientativo</p><p className="mt-0.5 text-xl font-extrabold">{range.min}–{range.max} kg</p><p className="mt-1 text-xs text-slate-400">Tu IMC está {bmiLabel(bmi)}.</p></div>
      {profile.limitations && <p className="text-xs text-amber-300">Precauciones: {profile.limitations}</p>}
      <div className="flex gap-2"><button onClick={onEdit} className="btn-secondary flex-1 !py-2">Editar</button><button onClick={onRemove} className="btn-danger !py-2">Eliminar</button></div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-base-800 p-2"><p className="text-[10px] uppercase text-slate-500">{label}</p><p className="text-sm font-bold">{value}</p></div>;
}
