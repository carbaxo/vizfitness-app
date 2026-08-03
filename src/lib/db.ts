"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { useAuth } from "@/context/AuthContext";
import type { BodyMetric, Exercise, Goal, Plan, TrainingProfile, Workout } from "./types";

// Todos los datos viven bajo users/{uid}/... — cada usuario solo ve lo suyo
// (reforzado por las reglas de seguridad de Firestore en firestore.rules).

function userCol(uid: string, name: string) {
  return collection(getDb(), "users", uid, name);
}

// Suscripción en tiempo real a una subcolección del usuario.
// onSnapshot mantiene los datos sincronizados entre dispositivos al instante.
function useUserCollection<T extends { id?: string }>(
  name: string,
  orderField = "createdAt",
  dir: "asc" | "desc" = "desc"
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(userCol(user.uid, name), orderBy(orderField, dir));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setLoading(false);
      },
      (err) => {
        console.error(`Error cargando ${name}:`, err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user, name, orderField, dir]);

  return { data, loading };
}

export const useWorkouts = () => useUserCollection<Workout>("workouts", "date");
export const useCustomExercises = () => useUserCollection<Exercise>("exercises", "name", "asc");
export const usePlans = () => useUserCollection<Plan>("plans");
export const useGoals = () => useUserCollection<Goal>("goals");
export const useBodyMetrics = () => useUserCollection<BodyMetric>("metrics", "date");
export const useTrainingProfiles = () => useUserCollection<TrainingProfile>("trainingProfiles", "createdAt", "asc");

type WithoutId<T> = Omit<T, "id">;

export async function addWorkout(uid: string, w: WithoutId<Workout>) {
  return addDoc(userCol(uid, "workouts"), w);
}

export async function deleteWorkout(uid: string, id: string) {
  return deleteDoc(doc(getDb(), "users", uid, "workouts", id));
}

export async function addExercise(uid: string, e: WithoutId<Exercise>) {
  return addDoc(userCol(uid, "exercises"), e);
}

export async function deleteExercise(uid: string, id: string) {
  return deleteDoc(doc(getDb(), "users", uid, "exercises", id));
}

export async function addPlan(uid: string, p: WithoutId<Plan>) {
  return addDoc(userCol(uid, "plans"), p);
}

export async function updatePlan(uid: string, id: string, p: Partial<Plan>) {
  return updateDoc(doc(getDb(), "users", uid, "plans", id), p);
}

export async function deletePlan(uid: string, id: string) {
  return deleteDoc(doc(getDb(), "users", uid, "plans", id));
}

export async function addGoal(uid: string, g: WithoutId<Goal>) {
  return addDoc(userCol(uid, "goals"), g);
}

export async function deleteGoal(uid: string, id: string) {
  return deleteDoc(doc(getDb(), "users", uid, "goals", id));
}

export async function addBodyMetric(uid: string, m: WithoutId<BodyMetric>) {
  // Un registro por día: usamos la fecha como ID para sobrescribir si ya existe
  return setDoc(doc(getDb(), "users", uid, "metrics", m.date), m);
}

export async function deleteBodyMetric(uid: string, id: string) {
  return deleteDoc(doc(getDb(), "users", uid, "metrics", id));
}

export async function addTrainingProfile(uid: string, profile: WithoutId<TrainingProfile>) {
  return addDoc(userCol(uid, "trainingProfiles"), profile);
}

export async function updateTrainingProfile(uid: string, id: string, profile: Partial<TrainingProfile>) {
  return updateDoc(doc(getDb(), "users", uid, "trainingProfiles", id), profile);
}

export async function deleteTrainingProfile(uid: string, id: string) {
  return deleteDoc(doc(getDb(), "users", uid, "trainingProfiles", id));
}
