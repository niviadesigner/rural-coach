import { NextRequest, NextResponse } from "next/server";
import { generarPlan, type PlanInput } from "@/lib/plan-engine";
import { EVENTOS } from "@/lib/sample-data";
import type { Nivel, PlanTipo } from "@/types";

export const runtime = "nodejs";

interface Body {
  nivel: Nivel;
  diasDisponibles: number[];
  horasSemana: number;
  ftpBase: number;
  fcUmbralBase: number;
  fechaInicio?: string;
  fechaEvento?: string | null;
  eventoId?: string | null;
  tipo: PlanTipo;
}

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as Body;
    const evento = b.eventoId ? EVENTOS.find((e) => e.id === b.eventoId) ?? null : null;
    const input: PlanInput = {
      nivel: b.nivel,
      diasDisponibles: b.diasDisponibles,
      horasSemana: b.horasSemana,
      ftpBase: b.ftpBase,
      fcUmbralBase: b.fcUmbralBase,
      fechaInicio: b.fechaInicio ? new Date(b.fechaInicio) : new Date(),
      fechaEvento: b.fechaEvento ? new Date(b.fechaEvento) : evento ? new Date(evento.fecha) : null,
      evento,
      tipo: b.tipo,
      pctGravel: evento?.pct_gravel ?? 40,
    };
    const plan = generarPlan(input);
    return NextResponse.json({ plan });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
