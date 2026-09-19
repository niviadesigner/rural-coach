import { NextRequest, NextResponse } from "next/server";
import { construirCheckout, referenciaPago } from "@/lib/wompi";
import { PLANES, aplicarDescuento, CODIGOS_MOCK } from "@/lib/pricing";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface Body {
  planTipo: string;
  codigo?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const { planTipo, codigo = null } = (await req.json()) as Body;
    const plan = PLANES.find((p) => p.tipo === planTipo);
    if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 400 });

    // Validación de código (mock; en prod: tabla discount_codes con event_id/vigencia/usos).
    const codigoValido = codigo ? Boolean(CODIGOS_MOCK[codigo.toUpperCase()]) : true;
    const desc = aplicarDescuento(plan, codigo, codigoValido);
    if (!desc.valido) return NextResponse.json({ error: desc.motivo }, { status: 400 });

    // Usuario logueado (para ligar el pago a su cuenta).
    let userId = "anon";
    const supabaseAuth = await createClient();
    if (supabaseAuth) {
      const {
        data: { user },
      } = await supabaseAuth.auth.getUser();
      if (user) userId = user.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const referencia = referenciaPago(userId, planTipo);
    // Wompi agrega ?id=<txId> al volver; dejamos la URL limpia.
    const checkout = await construirCheckout(referencia, desc.precioFinal, `${appUrl}/plan`);

    // Suscripción pendiente (se activa al confirmar el pago en /api/wompi/verificar).
    if (userId !== "anon") {
      const service = createServiceClient();
      if (service) {
        await service.from("subscriptions").upsert({
          id: referencia,
          user_id: userId,
          tipo: planTipo,
          monto_cop: desc.precioFinal,
          gateway: "wompi",
          estado: "pendiente",
          es_prueba: false,
          codigo_descuento: codigo,
        });
      }
    }

    const pub = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "";
    const mock = !pub || pub.includes("pub_test_...") || pub.trim() === "";

    return NextResponse.json({ checkout, precioFinal: desc.precioFinal, descuentoPct: desc.descuentoPct, mock });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
