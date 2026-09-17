// ============================================================
// Datos de ejemplo — se usan en NEXT_PUBLIC_MOCK_MODE y como
// seed de referencia. En producción vienen de Supabase (tabla events).
// ============================================================

import type { Evento } from "@/types";

export const EVENTOS: Evento[] = [
  {
    id: "evt-pantano-martus",
    nombre: "Pantano Martus",
    es_rural_cycle: true,
    fecha: "2026-11-21",
    ciudad: "Sopó, Cundinamarca",
    distancia_km: 90,
    desnivel_m: 2300,
    pct_gravel: 60,
    dificultad: 4,
    descripcion:
      "El reto insignia de Rural Cycle en La Sabana: 90 km con 2.300 m de desnivel y 60% de gravel. Terreno suelto, cambios de superficie y subidas largas donde se define todo.",
    imagen_url: "https://ruralcycle.cc/imagenes/tarjeta-pantano.webp",
  },
  {
    id: "evt-suesca-gravel",
    nombre: "Rural Gravel Tour · Suesca",
    es_rural_cycle: true,
    fecha: "2026-12-06",
    ciudad: "Suesca, Cundinamarca",
    distancia_km: 75,
    desnivel_m: 1600,
    pct_gravel: 55,
    dificultad: 3,
    descripcion:
      "Paisajes de roca y páramo entre caminos poco transitados. 75 km rápidos y técnicos, ideales para estrenar forma de fin de temporada.",
    imagen_url: "https://ruralcycle.cc/imagenes/tarjeta-suesca.webp",
  },
  {
    id: "evt-basso-gravel",
    nombre: "Reto Basso Gravel",
    es_rural_cycle: true,
    fecha: "2027-02-14",
    ciudad: "La Calera, Cundinamarca",
    distancia_km: 110,
    desnivel_m: 3100,
    pct_gravel: 70,
    dificultad: 5,
    descripcion:
      "El más duro del calendario: 110 km, 3.100 m de desnivel y 70% de gravel de alta montaña. Solo para quienes buscan el podio.",
    imagen_url: "https://ruralcycle.cc/imagenes/basso.png",
  },
];

export const EVENTO_DEFAULT = EVENTOS[0];

/** Actividad Strava simulada para calibrar en modo mock. */
export const ACTIVIDAD_MOCK = {
  strava_id: 999000111,
  fecha: "2026-09-14",
  tipo: "Ride",
  distancia_km: 52.3,
  desnivel_m: 780,
  duracion_s: 8100,
  potencia_media: 198,
  potencia_normalizada: 221,
  mejor_20min_w: 245, // → FTP estimado ≈ 233 W
  fc_media: 148,
  fc_max: 176,
  tss: 118,
  superficie: "gravel" as const,
};
