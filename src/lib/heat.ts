// ============================================================
// MÓDULO DE ADAPTACIÓN AL CALOR (para eventos en tierra caliente).
// Protocolo AMATEUR y SEGURO — nunca el protocolo élite (capucha/traje).
// La seguridad manda: reglas obligatorias y señales para detenerse.
// ============================================================

import type { Evento } from "@/types";

/** Un evento "necesita" adaptación al calor si su zona es cálida. */
export function necesitaCalor(evento: Evento | null): boolean {
  return Boolean(evento && (evento.temperatura_zona_c ?? 20) >= 24);
}

export interface SesionCalor {
  dia: number; // días antes del evento
  titulo: string;
  duracion_min: number;
  descripcion: string;
}

export interface ProtocoloCalor {
  tempC: number;
  sesiones: SesionCalor[];
  reglas: string[];
  senalesParar: string[];
  disclaimer: string;
}

export function generarProtocoloCalor(evento: Evento): ProtocoloCalor {
  const tempC = evento.temperatura_zona_c ?? 26;

  // 5 sesiones cortas y progresivas en los ~10 días previos.
  const sesiones: SesionCalor[] = [
    { dia: 10, titulo: "Toma de contacto", duracion_min: 20, descripcion: "Rodaje suave en la hora más cálida del día (o cuarto templado). Solo acostumbrar el cuerpo." },
    { dia: 8, titulo: "Sube un poco", duracion_min: 25, descripcion: "Igual, un poco más largo. Bebe antes, durante y después. Nada de forzar." },
    { dia: 6, titulo: "Ritmo cómodo en calor", duracion_min: 30, descripcion: "Rodaje Z2 en calor. Debes poder hablar. Si no, baja el ritmo." },
    { dia: 4, titulo: "Consolidar", duracion_min: 35, descripcion: "Zona 2 sostenida en calor. Pesa antes y después para calcular cuánto líquido perdiste." },
    { dia: 2, titulo: "Último toque", duracion_min: 25, descripcion: "Corto y suave. Ya estás adaptado; solo mantener. Descansa bien para la carrera." },
  ];

  const reglas = [
    "💧 Hidratación: 500–750 ml por hora con electrolitos (sodio). Empieza hidratado.",
    "⏱️ Duración limitada: arranca en 20 min y sube de a poco. Máximo 40–45 min por sesión.",
    "🌡️ Calor real, no extremo: usa la hora cálida del día o un cuarto templado. Nunca al sol de mediodía sin sombra si es agresivo.",
    "🧊 Ten a mano agua fría y un lugar a la sombra para cortar de inmediato.",
    "🚫 NUNCA uses capucha, traje de sauna ni ropa que no transpire. Ese es protocolo de élite supervisado — no es para ti.",
    "🩺 Si tienes condición cardíaca, hipertensión, estás embarazada o tomas ciertos medicamentos: consulta a tu médico antes.",
  ];

  const senalesParar = [
    "Mareo, dolor de cabeza o confusión",
    "Náuseas o vómito",
    "Dejas de sudar o se te pone la piel de gallina con calor",
    "Calambres fuertes",
    "Palpitaciones o falta de aire",
  ];

  return {
    tempC,
    sesiones,
    reglas,
    senalesParar,
    disclaimer:
      "Este es un protocolo de aclimatación AMATEUR con foco en seguridad. No sustituye consejo médico. Ante cualquier señal de alarma, detente, hidrátate y busca sombra; si no mejora, busca atención médica.",
  };
}
