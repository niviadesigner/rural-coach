"use client";

// Exportación en el cliente: reutiliza las funciones puras de /lib/export
// para descargar sin depender del servidor (funciona en modo mock).

import { workoutToZwo } from "@/lib/export/zwo";
import { workoutToErg } from "@/lib/export/erg";
import { pdfSemanal } from "@/lib/export/pdf";
import type { TrainingPlan, Workout } from "@/types";

function descargar(nombre: string, contenido: BlobPart, tipo: string) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function descargarZwo(w: Workout) {
  descargar(`rural-coach-s${w.semana}-${w.tipo}.zwo`, workoutToZwo(w), "application/octet-stream");
}

export function descargarErg(w: Workout, ftp: number) {
  descargar(`rural-coach-s${w.semana}-${w.tipo}.erg`, workoutToErg(w, ftp), "application/octet-stream");
}

export function descargarPdfSemana(plan: TrainingPlan, semana: number) {
  const bytes = pdfSemanal(plan, semana);
  descargar(`rural-coach-semana-${semana}.pdf`, bytes as unknown as BlobPart, "application/pdf");
}
