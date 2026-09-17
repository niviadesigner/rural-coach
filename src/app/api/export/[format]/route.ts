import { NextRequest, NextResponse } from "next/server";
import { workoutToZwo } from "@/lib/export/zwo";
import { workoutToErg } from "@/lib/export/erg";
import { pdfSemanal } from "@/lib/export/pdf";
import { FIT_DISPONIBLE } from "@/lib/export/fit";
import type { TrainingPlan, Workout } from "@/types";

export const runtime = "nodejs";

interface Body {
  plan: TrainingPlan;
  workoutId?: string;
  semana?: number;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ format: string }> }) {
  const { format } = await ctx.params;
  try {
    const { plan, workoutId, semana } = (await req.json()) as Body;
    const ftp = plan.ftp_base;
    const workout: Workout | undefined = workoutId
      ? plan.workouts.find((w) => w.id === workoutId)
      : undefined;

    switch (format) {
      case "zwo": {
        if (!workout) return NextResponse.json({ error: "workoutId requerido" }, { status: 400 });
        return fileResponse(workoutToZwo(workout), `rural-coach-s${workout.semana}-${workout.tipo}.zwo`, "application/xml");
      }
      case "erg": {
        if (!workout) return NextResponse.json({ error: "workoutId requerido" }, { status: 400 });
        return fileResponse(workoutToErg(workout, ftp), `rural-coach-s${workout.semana}-${workout.tipo}.erg`, "text/plain");
      }
      case "pdf": {
        const sem = semana ?? workout?.semana ?? 1;
        const bytes = pdfSemanal(plan, sem);
        return new NextResponse(Buffer.from(bytes), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="rural-coach-semana-${sem}.pdf"`,
          },
        });
      }
      case "fit": {
        return NextResponse.json(
          { error: "Exportación .FIT disponible en Fase 1.5. Usa .ZWO, .ERG o PDF.", fitDisponible: FIT_DISPONIBLE },
          { status: 501 }
        );
      }
      default:
        return NextResponse.json({ error: `Formato desconocido: ${format}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

function fileResponse(text: string, filename: string, contentType: string) {
  return new NextResponse(text, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
