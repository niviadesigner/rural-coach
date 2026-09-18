// ============================================================
// RURAL COACH — Tipos de dominio
// ============================================================

export type Nivel = "principiante" | "intermedio" | "avanzado";

export type FaseKey = "base" | "construccion" | "especifico" | "tapering";

export type WorkoutTipo =
  | "fondo"
  | "tempo"
  | "umbral"
  | "vo2"
  | "tecnica_gravel"
  | "fuerza"
  | "descanso";

export type Superficie = "gravel" | "ruta" | "mixto";

export type PlanTipo = "evento" | "mensual" | "3m" | "6m";

/** Objetivo del atleta en la carrera: pelear el podio o terminar en buena posición. */
export type ObjetivoCarrera = "ganar" | "posicion";

export type PlanEstado = "prueba" | "activo" | "finalizado";

export interface Evento {
  id: string;
  nombre: string;
  es_rural_cycle: boolean;
  fecha: string; // ISO date
  ciudad: string;
  distancia_km: number;
  desnivel_m: number;
  pct_gravel: number; // 0-100
  dificultad: 1 | 2 | 3 | 4 | 5;
  descripcion: string;
  imagen_url: string;
}

export interface Perfil {
  nombre: string;
  peso_kg?: number;
  nivel: Nivel;
  dias_disponibles: number[]; // 0=Dom ... 6=Sáb
  horas_semana: number;
  tiene_potenciometro: boolean;
  tiene_pulsometro: boolean;
  ftp_watts?: number;
  fc_umbral?: number;
  fc_max?: number;
  km_tipicos_salida?: number;
  lesiones?: string;
}

/** Un intervalo estructurado dentro de un entreno. */
export interface Intervalo {
  repeticiones: number;
  on_min: number; // minutos en esfuerzo
  off_min: number; // minutos de recuperación
  pct_ftp: number; // objetivo de potencia como % del FTP
  pct_fc?: number; // objetivo de FC como % del FC umbral
  cadencia?: number; // rpm objetivo (opcional)
  nota?: string;
}

/** Estructura completa de intervalos (jsonb en DB). */
export interface EstructuraIntervalos {
  calentamiento_min: number;
  bloques: Intervalo[];
  enfriamiento_min: number;
}

export interface Workout {
  id: string;
  semana: number;
  dia: number; // 0=Dom ... 6=Sáb
  nombre: string;
  tipo: WorkoutTipo;
  duracion_min: number;
  estructura_intervalos: EstructuraIntervalos;
  tss_objetivo: number;
  descripcion: string;
  es_semana_prueba: boolean;
  superficie: Superficie;
}

export interface PlanFase {
  fase: FaseKey;
  sem_inicio: number;
  sem_fin: number;
}

export interface TrainingPlan {
  id: string;
  event_id: string | null;
  tipo: PlanTipo;
  fecha_inicio: string;
  fecha_evento: string | null;
  semanas_totales: number;
  estado: PlanEstado;
  ftp_base: number;
  fc_umbral_base: number;
  fases: PlanFase[];
  workouts: Workout[];
}

export interface ZonaCoggan {
  n: number;
  nombre: string;
  pct_min: number;
  pct_max: number; // 999 = sin tope
  watts_min: number;
  watts_max: number;
  descripcion: string;
  color: string;
}
