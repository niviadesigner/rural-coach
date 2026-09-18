// ============================================================
// Zonas de potencia de Coggan (7 zonas, basadas en % FTP)
// y estimación de FTP / FC umbral.
// ============================================================

import type { ZonaCoggan } from "@/types";

const ZONAS_BASE: Omit<ZonaCoggan, "watts_min" | "watts_max">[] = [
  { n: 1, nombre: "Recuperación", pct_min: 0, pct_max: 55, descripcion: "Muy suave, regenerativo", color: "#657a4f" },
  { n: 2, nombre: "Resistencia", pct_min: 56, pct_max: 75, descripcion: "Fondo aeróbico, todo el día", color: "#4a5a3a" },
  { n: 3, nombre: "Tempo", pct_min: 76, pct_max: 90, descripcion: "Ritmo sostenido, algo exigente", color: "#d4a62e" },
  { n: 4, nombre: "Umbral", pct_min: 91, pct_max: 105, descripcion: "Al filo de tu FTP", color: "#c97e4a" },
  { n: 5, nombre: "VO2 máx", pct_min: 106, pct_max: 120, descripcion: "Intervalos duros y cortos", color: "#b5652d" },
  { n: 6, nombre: "Anaeróbico", pct_min: 121, pct_max: 150, descripcion: "Muy explosivo", color: "#a03e1f" },
  { n: 7, nombre: "Neuromuscular", pct_min: 151, pct_max: 999, descripcion: "Sprints máximos", color: "#7a2d16" },
];

export function calcularZonas(ftp: number): ZonaCoggan[] {
  return ZONAS_BASE.map((z) => ({
    ...z,
    watts_min: Math.round((z.pct_min / 100) * ftp),
    watts_max: z.pct_max === 999 ? 9999 : Math.round((z.pct_max / 100) * ftp),
  }));
}

/**
 * Estima FTP a partir del mejor esfuerzo de 20 minutos.
 * FTP ≈ mejor 20 min × 0.95 (protocolo estándar).
 */
export function estimarFtpDesde20min(mejor20minW: number): number {
  return Math.round(mejor20minW * 0.95);
}

/**
 * Ruta B (sin Strava): el usuario dice qué vatios sostiene ~20 min.
 * Si dice que ya conoce su FTP, se usa tal cual (se marca con esConocido).
 */
export function estimarFtpRutaB(watts20min: number, esFtpConocido: boolean): number {
  return esFtpConocido ? Math.round(watts20min) : estimarFtpDesde20min(watts20min);
}

/**
 * Recalibración suave tras una salida real.
 * Si el atleta superó su mejor 20 min, sube el FTP; nunca baja bruscamente
 * (máx +8% / -3% por recálculo para evitar saltos por un mal día).
 */
export function recalibrarFtp(ftpActual: number, nuevoMejor20minW: number): number {
  const estimado = estimarFtpDesde20min(nuevoMejor20minW);
  const techo = Math.round(ftpActual * 1.08);
  const piso = Math.round(ftpActual * 0.97);
  return Math.max(piso, Math.min(techo, estimado));
}

/** FC umbral aproximada si no la tenemos: ~92% de FC máx. */
export function estimarFcUmbral(fcMax: number): number {
  return Math.round(fcMax * 0.92);
}

/** FC máx estimada por edad (Tanaka) si no hay dato. */
export function estimarFcMaxPorEdad(edad: number): number {
  return Math.round(208 - 0.7 * edad);
}

// ============================================================
// Categorías de FTP por W/kg (referencia real de ciclistas).
// Pro ~5.5–6.5 W/kg · Amateur avanzado ~4.0–5.0 W/kg, etc.
// ============================================================

export interface CategoriaFtp {
  label: string;
  rango: string;
  color: string;
}

export function categoriaPorWkg(wkg: number): CategoriaFtp {
  if (wkg >= 5.5) return { label: "Nivel profesional", rango: "5,5–6,5 W/kg", color: "#7a2d16" };
  if (wkg >= 5.0) return { label: "Élite / competitivo", rango: "5,0–5,5 W/kg", color: "#b5652d" };
  if (wkg >= 4.0) return { label: "Amateur avanzado", rango: "4,0–5,0 W/kg", color: "#d4a62e" };
  if (wkg >= 3.5) return { label: "Intermedio", rango: "3,5–4,0 W/kg", color: "#657a4f" };
  if (wkg >= 2.5) return { label: "Recreativo", rango: "2,5–3,5 W/kg", color: "#4a5a3a" };
  return { label: "Principiante", rango: "< 2,5 W/kg", color: "#6b6152" };
}

/** Tabla de referencia para mostrar al usuario dónde encaja. */
export const REFERENCIA_WKG: { label: string; rango: string }[] = [
  { label: "Profesional", rango: "5,5–6,5 W/kg · 380–450+ W" },
  { label: "Amateur avanzado", rango: "4,0–5,0 W/kg · 270–350 W" },
  { label: "Intermedio", rango: "3,5–4,0 W/kg" },
  { label: "Recreativo", rango: "2,5–3,5 W/kg" },
];

/** Rangos válidos para inputs (evitan números irreales). */
export const LIMITES = {
  ftpWatts: { min: 80, max: 550 },
  pesoKg: { min: 35, max: 150 },
  kmSalida: { min: 5, max: 400 },
  distanciaEvento: { min: 20, max: 400 },
  desnivelEvento: { min: 0, max: 12000 },
  horasSemana: { min: 3, max: 20 },
};

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
