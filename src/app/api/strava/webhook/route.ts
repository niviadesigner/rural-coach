import { NextRequest, NextResponse } from "next/server";
import { getActivity, ensureFreshToken, type StravaToken, type StravaWebhookEvent } from "@/lib/strava";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// 1) Validación de la suscripción (Strava hace GET con hub.challenge).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verify = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? "rural-coach-verify-2026";

  if (mode === "subscribe" && token === verify) {
    return NextResponse.json({ "hub.challenge": challenge });
  }
  return NextResponse.json({ error: "verify token inválido" }, { status: 403 });
}

// 2) Eventos: nueva actividad → traer detalle → guardar → disparar recálculo.
export async function POST(req: NextRequest) {
  const event = (await req.json()) as StravaWebhookEvent;

  // Respondemos 200 rápido (Strava exige <2s); el trabajo pesado va después.
  if (event.object_type !== "activity" || event.aspect_type !== "create") {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.warn("Webhook Strava recibido pero Supabase no está configurado (modo dev).", event);
    return NextResponse.json({ ok: true, mock: true });
  }

  try {
    const { data: cuenta } = await supabase
      .from("strava_accounts")
      .select("*")
      .eq("athlete_id", event.owner_id)
      .single();

    if (cuenta) {
      const token: StravaToken = {
        access_token: cuenta.access_token,
        refresh_token: cuenta.refresh_token,
        expires_at: Math.floor(new Date(cuenta.expires_at).getTime() / 1000),
        athlete_id: cuenta.athlete_id,
        scopes: cuenta.scopes,
      };
      const fresco = await ensureFreshToken(token);
      if (fresco.access_token !== token.access_token) {
        await supabase
          .from("strava_accounts")
          .update({
            access_token: fresco.access_token,
            refresh_token: fresco.refresh_token,
            expires_at: new Date(fresco.expires_at * 1000).toISOString(),
          })
          .eq("user_id", cuenta.user_id);
      }

      const act = await getActivity(fresco.access_token, event.object_id);
      await supabase.from("activities").upsert(
        {
          user_id: cuenta.user_id,
          strava_id: act.strava_id,
          fecha: act.fecha,
          tipo: act.tipo,
          distancia_km: act.distancia_km,
          desnivel_m: act.desnivel_m,
          duracion_s: act.duracion_s,
          potencia_media: act.potencia_media,
          potencia_normalizada: act.potencia_normalizada,
          fc_media: act.fc_media,
          fc_max: act.fc_max,
          superficie: act.superficie,
          sincronizado_at: new Date().toISOString(),
        },
        { onConflict: "strava_id" }
      );
      // TODO Fase 1.5: recalcular FTP (recalibrarFtp) y reajustar próximos workouts.
    }
  } catch (e) {
    console.error("Error procesando webhook Strava:", e);
  }

  return NextResponse.json({ ok: true });
}
