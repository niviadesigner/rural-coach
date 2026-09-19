// ============================================================
// Datos de ejemplo — se usan en NEXT_PUBLIC_MOCK_MODE y como
// seed de referencia. En producción vienen de Supabase (tabla events).
// ============================================================

import type { Evento } from "@/types";

export const EVENTOS: Evento[] = [
  {
    id: "evt-brutal-gravel",
    nombre: "Brutal Gravel Race",
    es_rural_cycle: false,
    fecha: "2026-10-11",
    ciudad: "Sáchica, Boyacá",
    distancia_km: 130,
    desnivel_m: 2400,
    pct_gravel: 80,
    dificultad: 5,
    descripcion:
      "Carrera de gravel con dos distancias (60 km y 130 km) en Sáchica, Boyacá. 80% de terreno suelto y exigente.",
    imagen_url: "/eventos/brutal-gravel.png",
    temperatura_zona_c: 22,
  },
  {
    id: "evt-giro-rigo",
    nombre: "Giro de Rigo",
    es_rural_cycle: false,
    fecha: "2026-11-01",
    ciudad: "Cali, Valle del Cauca",
    distancia_km: 180,
    desnivel_m: 3200,
    pct_gravel: 0,
    dificultad: 5,
    descripcion:
      "La carrera de ruta más importante de Colombia para ciclistas aficionados. Edición La Sucursal — Cali.",
    imagen_url: "/eventos/giro-de-rigo.png",
    temperatura_zona_c: 27,
  },
  {
    id: "evt-campeonato-gravel",
    nombre: "Campeonato Nacional de Gravel",
    es_rural_cycle: false,
    fecha: "2026-11-15",
    ciudad: "Santa Rosa de Cabal, Risaralda",
    distancia_km: 120,
    desnivel_m: 2800,
    pct_gravel: 70,
    dificultad: 4,
    descripcion:
      "Carrera de gravel donde se premia al campeón nacional de Colombia de la modalidad. Competencia por categorías de edad.",
    imagen_url: "/eventos/campeonato-nacional-gravel.png",
    temperatura_zona_c: 20,
  },
  {
    id: "evt-transcordilleras",
    nombre: "Transcordilleras · 3 etapas",
    es_rural_cycle: false,
    fecha: "2026-12-05",
    ciudad: "Jardín, Antioquia",
    distancia_km: 258,
    desnivel_m: 6900,
    pct_gravel: 70,
    dificultad: 5,
    descripcion:
      "Carrera de gravel por etapas: bikepacking autoabastecido. 258 km y 6.900 m de desnivel entre cordilleras.",
    imagen_url: "/eventos/transcordilleras.png",
    temperatura_zona_c: 19,
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
