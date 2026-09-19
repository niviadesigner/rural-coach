import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getAthlete } from "@/lib/strava";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Strava redirige aquí tras autorizar. Intercambia el code por tokens,
// trae el perfil (avatar, FTP si es Premium, peso) y vuelve al onboarding
// con esos datos. Si hay sesión Supabase, además persiste tokens y perfil.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/onboarding?strava=error`);
  }

  try {
    const token = await exchangeCode(code);
    const athlete = await getAthlete(token.access_token);

    // Persistir si hay usuario logueado (para webhooks + guardar perfil).
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("strava_accounts").upsert(
          {
            user_id: user.id,
            athlete_id: token.athlete_id || athlete.id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_at: new Date(token.expires_at * 1000).toISOString(),
            scopes: token.scopes,
          },
          { onConflict: "user_id" }
        );
        await supabase
          .from("profiles")
          .update({
            nombre: athlete.nombre || undefined,
            ftp_watts: athlete.ftp ?? undefined,
            peso_kg: athlete.peso_kg ?? undefined,
            tiene_potenciometro: athlete.ftp != null,
          })
          .eq("id", user.id);
      }
    }

    // Volver al onboarding con los datos (para calibrar al instante).
    const p = new URLSearchParams({ strava: "ok", athlete: String(athlete.id) });
    if (athlete.nombre) p.set("nombre", athlete.nombre);
    if (athlete.avatar) p.set("avatar", athlete.avatar);
    if (athlete.ftp != null) p.set("ftp", String(athlete.ftp));
    if (athlete.peso_kg != null) p.set("peso", String(Math.round(athlete.peso_kg)));
    p.set("premium", athlete.premium ? "1" : "0");
    return NextResponse.redirect(`${appUrl}/onboarding?${p.toString()}`);
  } catch (e) {
    console.error("Strava callback error:", e);
    return NextResponse.redirect(`${appUrl}/onboarding?strava=error`);
  }
}
