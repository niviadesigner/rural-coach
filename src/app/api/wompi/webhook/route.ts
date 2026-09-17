import { NextRequest, NextResponse } from "next/server";
import { verificarEvento } from "@/lib/wompi";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Webhook de Wompi: confirma la transacción y activa la suscripción.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firma = body?.signature?.checksum as string | undefined;
    const properties = (body?.signature?.properties as string[]) ?? [];
    const timestamp = body?.timestamp as number;

    if (firma && properties.length) {
      const ok = await verificarEvento(properties, body.data, timestamp, firma);
      if (!ok) return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const tx = body?.data?.transaction;
    if (tx?.status === "APPROVED") {
      const supabase = createServiceClient();
      if (supabase) {
        await supabase
          .from("subscriptions")
          .update({ estado: "activo", es_prueba: false })
          .eq("id", tx.reference);
        // TODO Fase 1.5: marcar el training_plan como 'activo' y habilitar todas las semanas.
      } else {
        console.warn("Wompi APPROVED en modo dev (sin Supabase):", tx.reference);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error webhook Wompi:", e);
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
