// ============================================================
// Strava OAuth 2.0 + sincronización.
// - Login: authorize URL → callback → token exchange.
// - Refresh de tokens (cada 6h en backend, o on-demand si expiró).
// - Webhooks: verificación de suscripción + parseo de eventos.
// Modo desarrollo: 1 atleta autorizado (STRAVA_ATHLETE_ID_DEV).
// ============================================================

const STRAVA_OAUTH = "https://www.strava.com/oauth";
const STRAVA_API = "https://www.strava.com/api/v3";

export const SCOPES = "read,activity:read_all,profile:read_all";

export function authorizeUrl(state = ""): string {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ?? "";
  const redirect = process.env.STRAVA_REDIRECT_URI ?? "http://localhost:3000/api/strava/callback";
  const p = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    response_type: "code",
    approval_prompt: "auto",
    scope: SCOPES,
    state,
  });
  return `${STRAVA_OAUTH}/authorize?${p.toString()}`;
}

export interface StravaToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  athlete_id: number;
  scopes: string;
}

interface StravaTokenRaw {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number };
}

export async function exchangeCode(code: string): Promise<StravaToken> {
  const res = await fetch(`${STRAVA_OAUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange falló: ${res.status}`);
  const data = (await res.json()) as StravaTokenRaw;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete_id: data.athlete?.id ?? 0,
    scopes: SCOPES,
  };
}

export async function refreshToken(refresh_token: string): Promise<StravaToken> {
  const res = await fetch(`${STRAVA_OAUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Strava refresh falló: ${res.status}`);
  const data = (await res.json()) as StravaTokenRaw;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete_id: data.athlete?.id ?? 0,
    scopes: SCOPES,
  };
}

/** Refresca si el token expira en <10 min. */
export async function ensureFreshToken(t: StravaToken): Promise<StravaToken> {
  const ahora = Math.floor(Date.now() / 1000);
  if (t.expires_at - ahora > 600) return t;
  const nuevo = await refreshToken(t.refresh_token);
  return { ...nuevo, athlete_id: t.athlete_id };
}

interface StravaActivityRaw {
  id: number;
  start_date: string;
  type: string;
  sport_type?: string;
  distance: number; // metros
  total_elevation_gain: number;
  moving_time: number; // seg
  average_watts?: number;
  weighted_average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
}

export interface ActividadNormalizada {
  strava_id: number;
  fecha: string;
  tipo: string;
  distancia_km: number;
  desnivel_m: number;
  duracion_s: number;
  potencia_media: number | null;
  potencia_normalizada: number | null;
  fc_media: number | null;
  fc_max: number | null;
  superficie: "gravel" | "ruta" | "mixto";
}

export function normalizarActividad(a: StravaActivityRaw): ActividadNormalizada {
  const sport = (a.sport_type ?? a.type ?? "").toLowerCase();
  const superficie: ActividadNormalizada["superficie"] =
    sport.includes("gravel") ? "gravel" : sport.includes("mountain") ? "gravel" : "ruta";
  return {
    strava_id: a.id,
    fecha: a.start_date.slice(0, 10),
    tipo: a.type,
    distancia_km: Math.round((a.distance / 1000) * 10) / 10,
    desnivel_m: Math.round(a.total_elevation_gain),
    duracion_s: a.moving_time,
    potencia_media: a.average_watts ?? null,
    potencia_normalizada: a.weighted_average_watts ?? null,
    fc_media: a.average_heartrate ?? null,
    fc_max: a.max_heartrate ?? null,
    superficie,
  };
}

export async function getActivity(accessToken: string, id: number): Promise<ActividadNormalizada> {
  const res = await fetch(`${STRAVA_API}/activities/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Strava getActivity falló: ${res.status}`);
  return normalizarActividad((await res.json()) as StravaActivityRaw);
}

export async function getRecentActivities(accessToken: string, perPage = 30): Promise<ActividadNormalizada[]> {
  const res = await fetch(`${STRAVA_API}/athlete/activities?per_page=${perPage}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Strava getRecentActivities falló: ${res.status}`);
  const arr = (await res.json()) as StravaActivityRaw[];
  return arr.map(normalizarActividad);
}

// ---- Webhooks ----
export interface StravaWebhookEvent {
  object_type: "activity" | "athlete";
  object_id: number;
  aspect_type: "create" | "update" | "delete";
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

/** El atleta único autorizado en modo desarrollo. */
export const ATLETA_DEV = 7026608;
