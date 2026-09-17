// ============================================================
// MOTOR DE PLANES — RURAL COACH
// Genera un plan periodizado y personalizado por objetivo/fecha.
//
//   semanas = (fecha_evento - hoy) / 7
//   fases: base → construcción → específico → tapering (última = taper)
//   sesiones/semana según días disponibles y horas
//   objetivos: %FTP (Coggan) + %FC umbral
//   más técnica/gravel si el evento tiene alto %gravel
//   recalcula tras cada salida (ver recalibrarFtp en zones.ts)
// ============================================================

import type {
  Evento,
  EstructuraIntervalos,
  FaseKey,
  Intervalo,
  Nivel,
  PlanFase,
  PlanTipo,
  Superficie,
  TrainingPlan,
  Workout,
  WorkoutTipo,
} from "@/types";

export interface PlanInput {
  nivel: Nivel;
  diasDisponibles: number[]; // 0=Dom..6=Sáb
  horasSemana: number;
  ftpBase: number;
  fcUmbralBase: number;
  fechaInicio: Date;
  fechaEvento: Date | null;
  evento: Evento | null;
  tipo: PlanTipo;
  pctGravel: number; // 0-100 (del evento; 40 por defecto si mensual)
}

// ---- Utilidades ----
const MS_SEMANA = 7 * 24 * 60 * 60 * 1000;

export function semanasHasta(inicio: Date, evento: Date): number {
  return Math.max(1, Math.round((evento.getTime() - inicio.getTime()) / MS_SEMANA));
}

/**
 * Reparte N semanas en fases. La última semana SIEMPRE es tapering.
 * Distribución objetivo: base ~35%, construcción ~30%, específico ~25%, taper ~10%.
 */
export function periodizar(semanas: number): PlanFase[] {
  if (semanas <= 1) return [{ fase: "tapering", sem_inicio: 1, sem_fin: 1 }];
  if (semanas === 2) {
    return [
      { fase: "especifico", sem_inicio: 1, sem_fin: 1 },
      { fase: "tapering", sem_inicio: 2, sem_fin: 2 },
    ];
  }
  const taper = semanas >= 12 ? 2 : 1;
  const restantes = semanas - taper;
  let base = Math.max(1, Math.round(restantes * 0.4));
  let construccion = Math.max(1, Math.round(restantes * 0.33));
  let especifico = restantes - base - construccion;
  if (especifico < 1) {
    especifico = 1;
    if (base > construccion) base -= 1;
    else construccion -= 1;
  }

  const fases: PlanFase[] = [];
  let cursor = 1;
  const push = (fase: FaseKey, n: number) => {
    if (n <= 0) return;
    fases.push({ fase, sem_inicio: cursor, sem_fin: cursor + n - 1 });
    cursor += n;
  };
  push("base", base);
  push("construccion", construccion);
  push("especifico", especifico);
  push("tapering", taper);
  return fases;
}

export function faseDeSemana(fases: PlanFase[], semana: number): FaseKey {
  const f = fases.find((x) => semana >= x.sem_inicio && semana <= x.sem_fin);
  return f ? f.fase : "base";
}

// ---- Configuración por nivel ----
interface NivelCfg {
  spwMin: number; // sesiones/semana mínimas
  spwMax: number;
  duracionFondoBase: number; // min de fondo al inicio
  duracionFondoTope: number;
}
const NIVELES: Record<Nivel, NivelCfg> = {
  principiante: { spwMin: 3, spwMax: 4, duracionFondoBase: 60, duracionFondoTope: 150 },
  intermedio: { spwMin: 4, spwMax: 5, duracionFondoBase: 75, duracionFondoTope: 210 },
  avanzado: { spwMin: 5, spwMax: 6, duracionFondoBase: 90, duracionFondoTope: 270 },
};

/** Cuántas sesiones esta semana: limitado por días disponibles y horas. */
function sesionesEstaSemana(cfg: NivelCfg, dias: number[], horas: number, fase: FaseKey): number {
  let objetivo = cfg.spwMax;
  if (fase === "base") objetivo = cfg.spwMin;
  if (fase === "tapering") objetivo = Math.max(2, cfg.spwMin - 1);
  const porHoras = Math.max(2, Math.round(horas / 1.25));
  return Math.min(objetivo, dias.length, porHoras);
}

// ---- Plantillas de intervalos por tipo de sesión ----
function estructuraPara(
  tipo: WorkoutTipo,
  fase: FaseKey,
  semanaEnFase: number,
  duracionMin: number
): EstructuraIntervalos {
  const cal = tipo === "descanso" ? 0 : 10;
  const enf = tipo === "descanso" ? 0 : 8;
  const cuerpo = Math.max(0, duracionMin - cal - enf);

  const bloques: Intervalo[] = [];
  switch (tipo) {
    case "fondo":
      bloques.push({ repeticiones: 1, on_min: cuerpo, off_min: 0, pct_ftp: 65, pct_fc: 75, nota: "Zona 2, conversación posible" });
      break;
    case "tempo":
      bloques.push({ repeticiones: 3, on_min: 12, off_min: 5, pct_ftp: 85, pct_fc: 88, cadencia: 85, nota: "Tempo sostenido Z3" });
      break;
    case "umbral": {
      const reps = 3 + Math.min(2, semanaEnFase);
      bloques.push({ repeticiones: reps, on_min: 8, off_min: 4, pct_ftp: 98, pct_fc: 96, cadencia: 90, nota: "Al filo del FTP (Z4)" });
      break;
    }
    case "vo2":
      bloques.push({ repeticiones: 5, on_min: 4, off_min: 4, pct_ftp: 115, pct_fc: 100, cadencia: 95, nota: "VO2 máx (Z5), muy duro" });
      break;
    case "tecnica_gravel":
      bloques.push({ repeticiones: 6, on_min: 5, off_min: 3, pct_ftp: 88, pct_fc: 90, cadencia: 70, nota: "Sostener potencia en gravilla suelta, cadencia baja, buena línea" });
      break;
    case "fuerza":
      bloques.push({ repeticiones: 6, on_min: 5, off_min: 3, pct_ftp: 78, pct_fc: 82, cadencia: 55, nota: "Fuerza-resistencia: cadencia baja en pendiente o gym" });
      break;
    case "descanso":
      break;
  }
  return { calentamiento_min: cal, bloques, enfriamiento_min: enf };
}

/**
 * TSS ≈ (duración_seg × IF²) / 3600 × 100
 * Aproximamos IF (intensity factor) por el promedio ponderado de %FTP.
 */
function calcularTss(est: EstructuraIntervalos, duracionMin: number): number {
  if (est.bloques.length === 0) return 0;
  let ifPonderado = 0;
  let minTotal = 0;
  for (const b of est.bloques) {
    const minEsfuerzo = b.repeticiones * b.on_min;
    ifPonderado += (b.pct_ftp / 100) * minEsfuerzo;
    minTotal += minEsfuerzo;
  }
  // El calentamiento/enfriamiento y recuperaciones cuentan como ~0.55 IF.
  const minSuave = duracionMin - minTotal;
  ifPonderado += 0.55 * Math.max(0, minSuave);
  const IF = ifPonderado / Math.max(1, duracionMin);
  const segundos = duracionMin * 60;
  return Math.round(((segundos * IF * IF) / 3600) * 100);
}

/** Superficie recomendada según tipo y %gravel del evento. */
function superficiePara(tipo: WorkoutTipo, pctGravel: number): Superficie {
  if (tipo === "tecnica_gravel") return "gravel";
  if (tipo === "descanso" || tipo === "fuerza") return "mixto";
  return pctGravel >= 50 ? "gravel" : "mixto";
}

// ---- Selección de tipos de sesión por fase ----
function tiposPorFase(fase: FaseKey, nSesiones: number, pctGravel: number): WorkoutTipo[] {
  const gravelAlto = pctGravel >= 45;
  const pool: WorkoutTipo[] = [];

  if (fase === "base") {
    pool.push("fondo", "fuerza", "fondo", gravelAlto ? "tecnica_gravel" : "tempo", "fondo", "tempo");
  } else if (fase === "construccion") {
    pool.push("fondo", "umbral", gravelAlto ? "tecnica_gravel" : "tempo", "fuerza", "umbral", "vo2");
  } else if (fase === "especifico") {
    pool.push(gravelAlto ? "tecnica_gravel" : "umbral", "umbral", "fondo", "vo2", gravelAlto ? "tecnica_gravel" : "tempo", "fuerza");
  } else {
    // tapering
    pool.push("fondo", "umbral", "descanso", "fondo", "descanso", "descanso");
  }

  const out = pool.slice(0, nSesiones);
  // Garantiza al menos un fondo salvo taper muy corto.
  if (!out.includes("fondo") && fase !== "tapering") out[0] = "fondo";
  return out;
}

function duracionSesion(
  tipo: WorkoutTipo,
  cfg: NivelCfg,
  fase: FaseKey,
  semanaEnFase: number,
  horasSemana: number
): number {
  if (tipo === "descanso") return 0;
  const media = (horasSemana * 60) / Math.max(1, cfg.spwMax);
  if (tipo === "fondo") {
    const crecimiento = Math.min(cfg.duracionFondoTope, cfg.duracionFondoBase + semanaEnFase * 12);
    const factorFase = fase === "tapering" ? 0.55 : 1;
    return Math.round(Math.min(crecimiento, media * 1.8) * factorFase);
  }
  if (tipo === "fuerza" || tipo === "tecnica_gravel") return Math.round(Math.min(90, media));
  if (tipo === "vo2") return Math.round(Math.min(70, media * 0.9));
  return Math.round(Math.min(90, media)); // tempo/umbral
}

const NOMBRES: Record<WorkoutTipo, string> = {
  fondo: "Fondo aeróbico",
  tempo: "Tempo sostenido",
  umbral: "Series de umbral",
  vo2: "Intervalos VO2 máx",
  tecnica_gravel: "Técnica gravel + potencia en suelto",
  fuerza: "Fuerza-resistencia",
  descanso: "Descanso / movilidad",
};

const DESCRIPCIONES: Record<WorkoutTipo, string> = {
  fondo: "Rodaje continuo en zona 2. Construye la base que sostiene los kilómetros de gravel.",
  tempo: "Bloques de tempo (Z3) para elevar tu ritmo sostenible sin fatiga excesiva.",
  umbral: "Intervalos al filo de tu FTP. El motor de tu rendimiento en subidas largas.",
  vo2: "Repeticiones cortas y muy intensas para subir tu techo aeróbico.",
  tecnica_gravel: "Sostener potencia en gravilla suelta: frenado, líneas, cambios de superficie.",
  fuerza: "Repeticiones de fuerza-resistencia a cadencia baja, en pendiente o gimnasio.",
  descanso: "Recuperación activa o descanso total. Tan importante como entrenar.",
};

/** Asigna días de la semana a las sesiones, respetando los días disponibles. */
function asignarDias(diasDisponibles: number[], n: number): number[] {
  const orden = [...diasDisponibles].sort((a, b) => a - b);
  if (orden.length >= n) return orden.slice(0, n);
  const out = [...orden];
  let i = 0;
  while (out.length < n) {
    out.push(orden[i % orden.length]);
    i++;
  }
  return out.slice(0, n);
}

// ---- Generación principal ----
export function generarPlan(input: PlanInput): TrainingPlan {
  const cfg = NIVELES[input.nivel];
  const semanas =
    input.fechaEvento != null
      ? semanasHasta(input.fechaInicio, input.fechaEvento)
      : input.tipo === "mensual"
      ? 4
      : input.tipo === "3m"
      ? 12
      : 24;

  const fases = periodizar(semanas);
  const workouts: Workout[] = [];

  for (let semana = 1; semana <= semanas; semana++) {
    const fase = faseDeSemana(fases, semana);
    const faseInfo = fases.find((f) => semana >= f.sem_inicio && semana <= f.sem_fin)!;
    const semanaEnFase = semana - faseInfo.sem_inicio;
    const nSesiones = sesionesEstaSemana(cfg, input.diasDisponibles, input.horasSemana, fase);
    const tipos = tiposPorFase(fase, nSesiones, input.pctGravel);
    const dias = asignarDias(input.diasDisponibles, nSesiones);
    // La semana 1 es "test suave": la primera salida real recalibra el FTP.
    const esSemanaPrueba = semana === 1;

    tipos.forEach((tipo, idx) => {
      const duracion = duracionSesion(tipo, cfg, fase, semanaEnFase, input.horasSemana);
      const estructura = estructuraPara(tipo, fase, semanaEnFase, duracion);
      const tss = calcularTss(estructura, duracion);
      workouts.push({
        id: `w-${semana}-${idx}`,
        semana,
        dia: dias[idx],
        nombre: esSemanaPrueba && idx === 0 ? "Salida de calibración (test suave)" : NOMBRES[tipo],
        tipo,
        duracion_min: duracion,
        estructura_intervalos: estructura,
        tss_objetivo: tss,
        descripcion:
          esSemanaPrueba && idx === 0
            ? "Tu primera salida con la app. Rueda a tu ritmo natural: la usamos para calibrar tu FTP y afinar todo el plan. Sin presión."
            : DESCRIPCIONES[tipo],
        es_semana_prueba: esSemanaPrueba,
        superficie: superficiePara(tipo, input.pctGravel),
      });
    });
  }

  return {
    id: "plan-preview",
    event_id: input.evento?.id ?? null,
    tipo: input.tipo,
    fecha_inicio: input.fechaInicio.toISOString().slice(0, 10),
    fecha_evento: input.fechaEvento ? input.fechaEvento.toISOString().slice(0, 10) : null,
    semanas_totales: semanas,
    estado: "prueba",
    ftp_base: input.ftpBase,
    fc_umbral_base: input.fcUmbralBase,
    fases,
    workouts,
  };
}

export const NOMBRE_FASE: Record<FaseKey, string> = {
  base: "Base",
  construccion: "Construcción",
  especifico: "Específico",
  tapering: "Puesta a punto",
};
