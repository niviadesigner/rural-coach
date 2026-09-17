// ============================================================
// Generador de PDF semanal — sin dependencias.
// Escribe un PDF válido (A4) con las fuentes estándar Helvetica.
// Suficiente para el "PDF semanal" del MVP; para PDFs ricos con
// gráficos se puede migrar a pdf-lib/puppeteer en Fase 1.5.
// ============================================================

import type { TrainingPlan, Workout } from "@/types";
import { NOMBRE_FASE, faseDeSemana } from "@/lib/plan-engine";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface Linea {
  text: string;
  size: number;
  bold: boolean;
  color: [number, number, number];
  gapAfter: number;
}

function esc(s: string): string {
  // PDF text: escapar paréntesis y backslash; degradar acentos a latin1 seguro.
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      if (line) out.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) out.push(line.trim());
  return out;
}

/** Construye las líneas de una semana concreta del plan. */
export function lineasSemana(plan: TrainingPlan, semana: number): Linea[] {
  const mustard: [number, number, number] = [0.831, 0.651, 0.18];
  const olive: [number, number, number] = [0.29, 0.353, 0.227];
  const ink: [number, number, number] = [0.17, 0.141, 0.11];
  const muted: [number, number, number] = [0.42, 0.38, 0.32];

  const fase = faseDeSemana(plan.fases, semana);
  const workouts = plan.workouts
    .filter((w) => w.semana === semana)
    .sort((a, b) => a.dia - b.dia);

  const L: Linea[] = [];
  L.push({ text: "RURAL COACH", size: 22, bold: true, color: mustard, gapAfter: 4 });
  L.push({ text: "Plan de entrenamiento gravel · Rural Cycle", size: 10, bold: false, color: muted, gapAfter: 18 });
  L.push({ text: `SEMANA ${semana} — FASE ${NOMBRE_FASE[fase].toUpperCase()}`, size: 15, bold: true, color: olive, gapAfter: 4 });
  L.push({
    text: `FTP base ${plan.ftp_base} W · FC umbral ${plan.fc_umbral_base} ppm · ${workouts.length} sesiones`,
    size: 10,
    bold: false,
    color: muted,
    gapAfter: 16,
  });

  for (const w of workouts) {
    L.push({ text: `${DIAS[w.dia]} — ${w.nombre}`, size: 12, bold: true, color: ink, gapAfter: 2 });
    L.push({
      text: `${w.duracion_min} min · TSS ${w.tss_objetivo} · ${w.superficie} · ${w.tipo}`,
      size: 9.5,
      bold: false,
      color: muted,
      gapAfter: 4,
    });
    for (const linea of wrap(w.descripcion, 95)) {
      L.push({ text: linea, size: 10, bold: false, color: ink, gapAfter: 2 });
    }
    // Intervalos
    const est = w.estructura_intervalos;
    if (est.bloques.length > 0) {
      const partes: string[] = [];
      if (est.calentamiento_min) partes.push(`Cal ${est.calentamiento_min}'`);
      for (const b of est.bloques) {
        const watts = Math.round((b.pct_ftp / 100) * plan.ftp_base);
        if (b.repeticiones > 1 && b.off_min > 0) {
          partes.push(`${b.repeticiones}x(${b.on_min}' @${b.pct_ftp}%FTP ~${watts}W / ${b.off_min}' rec)`);
        } else {
          partes.push(`${b.on_min}' @${b.pct_ftp}%FTP ~${watts}W`);
        }
      }
      if (est.enfriamiento_min) partes.push(`Enf ${est.enfriamiento_min}'`);
      for (const linea of wrap("Estructura: " + partes.join("  ·  "), 95)) {
        L.push({ text: linea, size: 9, bold: false, color: olive, gapAfter: 1 });
      }
    }
    L.push({ text: "", size: 6, bold: false, color: ink, gapAfter: 8 });
  }

  L.push({ text: "app.ruralcycle.cc · Rural Cycle — Sabana de Bogotá", size: 8.5, bold: false, color: muted, gapAfter: 0 });
  return L;
}

/** Genera los bytes de un PDF A4 con las líneas dadas (una página). */
export function construirPdf(lineas: Linea[]): Uint8Array {
  const PAGE_H = 842; // A4 en puntos
  const MARGIN = 48;
  let y = PAGE_H - MARGIN;

  const streamParts: string[] = [];
  for (const l of lineas) {
    if (l.text) {
      const font = l.bold ? "F2" : "F1";
      streamParts.push(
        `BT /${font} ${l.size} Tf ${l.color[0]} ${l.color[1]} ${l.color[2]} rg 1 0 0 1 ${MARGIN} ${y.toFixed(
          1
        )} Tm (${esc(l.text)}) Tj ET`
      );
    }
    y -= l.size + l.gapAfter;
  }
  const content = streamParts.join("\n");
  const contentBytes = new TextEncoder().encode(content);

  const objs: string[] = [];
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objs[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objs[3] =
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>";
  objs[4] = `<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream`;
  objs[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objs[6] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 1; i < objs.length; i++) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objs.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < objs.length; i++) {
    pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }
  pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export function pdfSemanal(plan: TrainingPlan, semana: number): Uint8Array {
  return construirPdf(lineasSemana(plan, semana));
}

export function nombreArchivo(plan: TrainingPlan, w: Workout, ext: string): string {
  return `rural-coach-s${w.semana}-${w.tipo}.${ext}`;
}
