import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Registro sin fricción: crea la cuenta YA CONFIRMADA (sin correo de verificación).
// Usa la llave de servicio en el backend. El cliente luego inicia sesión normal.
export async function POST(req: NextRequest) {
  try {
    const { email, password, nombre } = (await req.json()) as {
      email: string;
      password: string;
      nombre?: string;
    };
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Correo y contraseña (mínimo 6) requeridos." }, { status: 400 });
    }

    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Autenticación no disponible." }, { status: 503 });
    }

    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: nombre ? { name: nombre } : undefined,
    });

    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("already") || m.includes("registered") || m.includes("exists")) {
        return NextResponse.json({ error: "Ese correo ya está registrado. Inicia sesión." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
