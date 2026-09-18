"use client";

// ============================================================
// Persistencia del plan en Supabase (por usuario, con RLS).
// Guarda/lee training_plans + plan_phases + workouts.
// ============================================================

import { createClient } from "@/lib/supabase/client";
import type { TrainingPlan } from "@/types";

type Client = NonNullable<ReturnType<typeof createClient>>;

/** Guarda el plan del usuario. Reemplaza el plan activo previo (uno por usuario en el MVP). */
export async function guardarPlan(userId: string, plan: TrainingPlan): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  // Un plan "vivo" por usuario en el MVP: borramos los anteriores.
  await supabase.from("training_plans").delete().eq("user_id", userId);

  const { data: planRow, error } = await supabase
    .from("training_plans")
    .insert({
      user_id: userId,
      event_id: null, // los eventos demo no tienen uuid; se guarda por fecha
      tipo: plan.tipo,
      fecha_inicio: plan.fecha_inicio,
      fecha_evento: plan.fecha_evento,
      semanas_totales: plan.semanas_totales,
      estado: plan.estado,
      ftp_base: plan.ftp_base,
      fc_umbral_base: plan.fc_umbral_base,
    })
    .select("id")
    .single();

  if (error || !planRow) return null;
  const planId = planRow.id as string;

  if (plan.fases.length) {
    await supabase.from("plan_phases").insert(
      plan.fases.map((f) => ({ plan_id: planId, fase: f.fase, sem_inicio: f.sem_inicio, sem_fin: f.sem_fin }))
    );
  }
  if (plan.workouts.length) {
    await supabase.from("workouts").insert(
      plan.workouts.map((w) => ({
        plan_id: planId,
        semana: w.semana,
        dia: w.dia,
        nombre: w.nombre,
        tipo: w.tipo,
        duracion_min: w.duracion_min,
        estructura_intervalos: w.estructura_intervalos,
        tss_objetivo: w.tss_objetivo,
        descripcion: w.descripcion,
        es_semana_prueba: w.es_semana_prueba,
        superficie: w.superficie,
      }))
    );
  }
  return planId;
}

/** ¿El usuario tiene una suscripción activa (plan pagado)? */
export async function tienePlanPagado(userId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("estado", "activo")
    .limit(1);
  return Boolean(data && data.length);
}
