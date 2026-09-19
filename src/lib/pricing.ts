// ============================================================
// Monetización (COP) y códigos de descuento.
// ============================================================


export type PlanComercialTipo = "corto" | "evento_3m" | "evento_6m" | "mensual";

export interface PlanComercial {
  tipo: PlanComercialTipo;
  nombre: string;
  precio_cop: number;
  descripcion: string;
  destacado?: boolean;
}

export const PLANES: PlanComercial[] = [
  {
    tipo: "corto",
    nombre: "Por Objetivo · Corto",
    precio_cop: 99000,
    descripcion: "Tu carrera está cerca (hasta 4 semanas). Plan completo hasta el día del evento.",
  },
  {
    tipo: "evento_3m",
    nombre: "Por Objetivo · hasta 3 meses",
    precio_cop: 270000,
    descripcion: "Plan completo hacia tu evento (5–12 semanas de preparación).",
    destacado: true,
  },
  {
    tipo: "evento_6m",
    nombre: "Por Objetivo · hasta 6 meses",
    precio_cop: 460000,
    descripcion: "Preparación profunda (13–24 semanas) para tu gran reto.",
  },
  {
    tipo: "mensual",
    nombre: "Mensual (sin evento)",
    precio_cop: 99000,
    descripcion: "¿Aún sin carrera? Entrena mes a mes. Cancela cuando quieras.",
  },
];

/** Elige el plan (y precio) automáticamente según las semanas que faltan al evento. */
export function planTipoPorDuracion(semanas: number): PlanComercial["tipo"] {
  if (semanas <= 4) return "corto";
  if (semanas <= 12) return "evento_3m";
  return "evento_6m";
}

export const PRUEBA_DIAS = 7;

export function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export interface DescuentoResultado {
  valido: boolean;
  motivo?: string;
  precioFinal: number;
  descuentoPct: number;
}

/**
 * Aplica un código de descuento de evento Rural Cycle.
 * Regla del negocio: -15% en cualquier plan, o el 6m queda en $400.000.
 * En producción se valida contra la tabla discount_codes (event_id, vigencia, usos).
 */
export function aplicarDescuento(
  plan: PlanComercial,
  codigo: string | null,
  codigoValido: boolean
): DescuentoResultado {
  if (!codigo) {
    return { valido: true, precioFinal: plan.precio_cop, descuentoPct: 0 };
  }
  if (!codigoValido) {
    return {
      valido: false,
      motivo: "Código no válido o vencido.",
      precioFinal: plan.precio_cop,
      descuentoPct: 0,
    };
  }
  // Caso especial 6 meses → precio plano de evento.
  if (plan.tipo === "evento_6m") {
    return { valido: true, precioFinal: 400000, descuentoPct: Math.round((1 - 400000 / plan.precio_cop) * 100) };
  }
  const precioFinal = Math.round(plan.precio_cop * 0.85);
  return { valido: true, precioFinal, descuentoPct: 15 };
}

/** Códigos demo para modo mock (en prod: tabla discount_codes). */
export const CODIGOS_MOCK: Record<string, { descuentoPct: number; evento: string }> = {
  RURAL15: { descuentoPct: 15, evento: "*" },
  BRUTAL15: { descuentoPct: 15, evento: "evt-brutal-gravel" },
};
