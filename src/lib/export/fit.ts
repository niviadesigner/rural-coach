// ============================================================
// Exportador .FIT — Garmin/Wahoo (formato BINARIO).
// STUB (Fase 1.5): el .FIT requiere codificar cabecera + mensajes
// definidos por el FIT SDK (Workout, WorkoutStep) con CRC.
// Se deja la interfaz lista para enchufar '@garmin/fitsdk' o
// 'fit-file-writer' sin tocar las rutas ni la UI.
// ============================================================

import type { Workout } from "@/types";

export const FIT_DISPONIBLE = false;

export function workoutToFit(_w: Workout, _ftp: number): Uint8Array {
  throw new Error(
    "Exportación .FIT pendiente (Fase 1.5). Usa .ZWO, .ERG o PDF por ahora. " +
      "Para habilitarlo: instala @garmin/fitsdk y codifica los mensajes Workout/WorkoutStep aquí."
  );
}
