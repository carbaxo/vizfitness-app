import type { TrainingProfile } from "./types";

export function healthyWeightRange(heightCm: number) {
  const heightM = heightCm / 100;
  return {
    min: Math.round(18.5 * heightM * heightM * 10) / 10,
    max: Math.round(24.9 * heightM * heightM * 10) / 10,
  };
}

export function bodyMassIndex(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "por debajo del rango orientativo";
  if (bmi < 25) return "dentro del rango orientativo";
  if (bmi < 30) return "por encima del rango orientativo";
  return "claramente por encima del rango orientativo";
}

export function profileAge(profile: TrainingProfile) {
  return profile.birthYear ? new Date().getFullYear() - profile.birthYear : undefined;
}
