import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/strava";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Strava redirige aquí tras autorizar. Intercambia el code por tokens,
// los guarda en strava_accounts y trae actividades recientes para calibrar.
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
    const supabase = await createClient();

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("strava_accounts").upsert(
          {
            user_id: user.id,
            athlete_id: token.athlete_id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_at: new Date(token.expires_at * 1000).toISOString(),
            scopes: token.scopes,
          },
          { onConflict: "user_id" }
        );
      }
    }

    // Sin Supabase (modo dev): pasamos el athlete_id por query para continuar el flujo.
    return NextResponse.redirect(`${appUrl}/onboarding?strava=ok&athlete=${token.athlete_id}`);
  } catch (e) {
    console.error("Strava callback error:", e);
    return NextResponse.redirect(`${appUrl}/onboarding?strava=error`);
  }
}
