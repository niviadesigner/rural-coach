// ============================================================
// MÓDULO NUTRICIÓN "STICKER RURAL"
// Inspirado en el nutrition sticker de Alpecin/De Kegel.
// Calcula g/h de carbohidrato (rango amateur SEGURO 60–90 g/h,
// NUNCA los 120 de élite) y un timeline de avituallamiento.
// ============================================================

import type { Evento } from "@/types";

export type TipoAlimento = "solido" | "gel" | "gel_cafeina" | "bebida";

export interface PuntoAvituallamiento {
  hora: number; // hora de carrera (h)
  km: number;
  tipo: TipoAlimento;
  detalle: string;
  gramos_carb: number;
}

export interface ClimaAjuste {
  etiqueta: "frío" | "templado" | "calor";
  estrategia: string;
}

export interface PlanNutricion {
  duracion_h: number;
  distancia_km: number;
  gramos_carb_hora: number;
  gramos_carb_total: number;
  ml_liquido_hora: number;
  clima: ClimaAjuste;
  puntos: PuntoAvituallamiento[];
  advertencia: string;
}

/** Estima la duración del evento (h) según distancia, desnivel y %gravel. */
export function estimarDuracion(evento: Evento): number {
  // Velocidad base amateur en gravel; penaliza desnivel y terreno suelto.
  const ratioDesnivel = evento.desnivel_m / Math.max(1, evento.distancia_km); // m/km
  let velocidad = 27 - ratioDesnivel * 0.4 - (evento.pct_gravel / 100) * 4;
  velocidad = Math.max(14, Math.min(32, velocidad));
  return Math.round((evento.distancia_km / velocidad) * 10) / 10;
}

function climaDe(tempC: number): ClimaAjuste {
  if (tempC >= 26)
    return { etiqueta: "calor", estrategia: "Más líquido y electrolitos. Prioriza geles y bebida; menos sólido pesado." };
  if (tempC <= 15)
    return { etiqueta: "frío", estrategia: "Más sólido: el estómago tolera mejor comida real. No olvides beber aunque no sientas sed." };
  return { etiqueta: "templado", estrategia: "Equilibra sólido temprano y geles al final. Bebe de forma constante." };
}

export function calcularNutricion(evento: Evento, pesoKg: number | null): PlanNutricion {
  const duracion = estimarDuracion(evento);
  const tempC = evento.temperatura_zona_c ?? 20;
  const clima = climaDe(tempC);

  // g/h base según duración; ajuste por clima y peso. Clamp 60–90 (amateur seguro).
  let gh = 70;
  if (duracion >= 4) gh = 85;
  else if (duracion >= 2.5) gh = 78;
  else gh = 65;
  if (clima.etiqueta === "calor") gh += 3;
  if (pesoKg && pesoKg >= 80) gh += 3;
  gh = Math.max(60, Math.min(90, Math.round(gh)));

  // Líquido: más en calor.
  const mlHora = clima.etiqueta === "calor" ? 750 : clima.etiqueta === "frío" ? 500 : 600;

  const totalCarb = Math.round(gh * duracion);

  // Timeline: un avituallamiento cada ~40 min. Sólido temprano, geles al final,
  // gel con cafeína en el tramo clave (~70% de la carrera).
  const puntos: PuntoAvituallamiento[] = [];
  const paso = 40 / 60; // 40 min en horas
  const kmPorHora = evento.distancia_km / duracion;
  const carbPorPunto = Math.round(gh * paso);
  const tramoCafeina = duracion * 0.7;

  for (let t = paso; t < duracion; t += paso) {
    const frac = t / duracion;
    let tipo: TipoAlimento;
    let detalle: string;
    if (Math.abs(t - tramoCafeina) < paso / 2) {
      tipo = "gel_cafeina";
      detalle = "Gel con cafeína — el tramo que define la carrera";
    } else if (frac < 0.4) {
      tipo = clima.etiqueta === "calor" ? "bebida" : "solido";
      detalle = clima.etiqueta === "calor" ? "Bebida con carbohidrato + un bocado ligero" : "Sólido: barra, banano o sándwich";
    } else if (frac < 0.7) {
      tipo = "gel";
      detalle = "Gel o masticable + agua";
    } else {
      tipo = "gel";
      detalle = "Gel rápido — ya no cae sólido";
    }
    puntos.push({
      hora: Math.round(t * 10) / 10,
      km: Math.round(frac * evento.distancia_km),
      tipo,
      detalle,
      gramos_carb: carbPorPunto,
    });
  }

  return {
    duracion_h: duracion,
    distancia_km: evento.distancia_km,
    gramos_carb_hora: gh,
    gramos_carb_total: totalCarb,
    ml_liquido_hora: mlHora,
    clima,
    puntos,
    advertencia:
      "Rango amateur seguro (60–90 g/h). Entrena tu estómago progresivamente: empieza bajo y sube semana a semana. No copies los 120 g/h de los pros de golpe.",
  };
}

export const ICONO_ALIMENTO: Record<TipoAlimento, string> = {
  solido: "🍌",
  gel: "⚡",
  gel_cafeina: "☕",
  bebida: "💧",
};

export const NOMBRE_ALIMENTO: Record<TipoAlimento, string> = {
  solido: "Sólido",
  gel: "Gel",
  gel_cafeina: "Gel cafeína",
  bebida: "Bebida",
};
