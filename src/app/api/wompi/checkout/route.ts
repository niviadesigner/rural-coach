import { NextRequest, NextResponse } from "next/server";
import { construirCheckout, referenciaPago } from "@/lib/wompi";
import { PLANES, aplicarDescuento, CODIGOS_MOCK } from "@/lib/pricing";

export const runtime = "nodejs";

interface Body {
  planTipo: string;
  userId?: string;
  codigo?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const { planTipo, userId = "anon", codigo = null } = (await req.json()) as Body;
    const plan = PLANES.find((p) => p.tipo === planTipo);
    if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 400 });

    // Validación de código (mock; en prod: tabla discount_codes con event_id/vigencia/usos).
    const codigoValido = codigo ? Boolean(CODIGOS_MOCK[codigo.toUpperCase()]) : true;
    const desc = aplicarDescuento(plan, codigo, codigoValido);
    if (!desc.valido) return NextResponse.json({ error: desc.motivo }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const referencia = referenciaPago(userId, planTipo);
    const checkout = await construirCheckout(referencia, desc.precioFinal, `${appUrl}/plan?pago=ok`);

    const mock =
      !process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ||
      (process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "").includes("pub_test_...");

    return NextResponse.json({ checkout, precioFinal: desc.precioFinal, descuentoPct: desc.descuentoPct, mock });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
