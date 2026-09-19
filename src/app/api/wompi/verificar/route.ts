import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Verifica una transacción de Wompi por su id (la app la consulta al volver
// del checkout). Si está APROBADA, marca la suscripción como activa.
// Modelo elegido: NO dependemos del webhook global de eventos de Wompi
// (ese lo usan tus inscripciones a carreras); confirmamos por API en el retorno.
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id de transacción" }, { status: 400 });

  const base = (process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "").startsWith("pub_prod")
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";

  try {
    const res = await fetch(`${base}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY ?? ""}` },
      cache: "no-store",
    });
    const data = await res.json();
    const tx = data?.data;
    if (!tx) return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });

    const aprobado = tx.status === "APPROVED";

    if (aprobado) {
      const supabase = createServiceClient();
      if (supabase && tx.reference) {
        await supabase
          .from("subscriptions")
          .update({ estado: "activo", es_prueba: false })
          .eq("id", tx.reference);
      }
    }

    return NextResponse.json({
      aprobado,
      estado: tx.status,
      referencia: tx.reference ?? null,
      monto_cop: tx.amount_in_cents ? Math.round(tx.amount_in_cents / 100) : null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
