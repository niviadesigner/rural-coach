// ============================================================
// Estado local del onboarding y el plan (localStorage).
// Permite el flujo completo sin backend en modo mock, y sirve de
// caché optimista cuando Supabase está conectado.
// ============================================================

import type { Nivel, ObjetivoCarrera, PlanTipo, TrainingPlan } from "@/types";

const KEY = "rural_coach_state_v1";

export interface AppState {
  eventoId: string | null;
  fechaEventoManual: string | null; // para "otra carrera"
  distanciaManual: number | null;
  desnivelManual: number | null;
  conectadoStrava: boolean;
  athleteId: number | null;
  nivel: Nivel;
  diasDisponibles: number[];
  horasSemana: number;
  ftpBase: number | null;
  fcUmbralBase: number | null;
  pesoKg: number | null;
  km_tipicos: number | null;
  tipoPlan: PlanTipo;
  objetivoCarrera: ObjetivoCarrera;
  pagado: boolean;
  plan: TrainingPlan | null;
}

export const ESTADO_INICIAL: AppState = {
  eventoId: null,
  fechaEventoManual: null,
  distanciaManual: null,
  desnivelManual: null,
  conectadoStrava: false,
  athleteId: null,
  nivel: "intermedio",
  diasDisponibles: [2, 4, 6], // Mar, Jue, Sáb
  horasSemana: 6,
  ftpBase: null,
  fcUmbralBase: null,
  pesoKg: null,
  km_tipicos: null,
  tipoPlan: "evento",
  objetivoCarrera: "posicion",
  pagado: false,
  plan: null,
};

export function loadState(): AppState {
  if (typeof window === "undefined") return ESTADO_INICIAL;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...ESTADO_INICIAL, ...JSON.parse(raw) };
  } catch {
    /* noop */
  }
  return ESTADO_INICIAL;
}

export function saveState(s: Partial<AppState>): AppState {
  const actual = loadState();
  const nuevo = { ...actual, ...s };
  try {
    localStorage.setItem(KEY, JSON.stringify(nuevo));
  } catch {
    /* noop */
  }
  return nuevo;
}

export function resetState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
