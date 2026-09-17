// ============================================================
// Exportador .ZWO — Zwift Workout (XML)
// Convierte la estructura de intervalos de un workout a formato Zwift.
// %FTP se expresa como fracción (0.65 = 65% FTP).
// ============================================================

import type { Workout } from "@/types";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function workoutToZwo(w: Workout, autor = "Rural Coach"): string {
  const est = w.estructura_intervalos;
  const lines: string[] = [];

  if (est.calentamiento_min > 0) {
    lines.push(
      `    <Warmup Duration="${est.calentamiento_min * 60}" PowerLow="0.45" PowerHigh="0.65"/>`
    );
  }

  for (const b of est.bloques) {
    const powerOn = (b.pct_ftp / 100).toFixed(2);
    const cad = b.cadencia ? ` Cadence="${b.cadencia}"` : "";
    if (b.repeticiones > 1 && b.off_min > 0) {
      const powerOff = "0.55";
      lines.push(
        `    <IntervalsT Repeat="${b.repeticiones}" OnDuration="${b.on_min * 60}" OffDuration="${
          b.off_min * 60
        }" OnPower="${powerOn}" OffPower="${powerOff}"${cad}>`
      );
      if (b.nota) lines.push(`      <textevent timeoffset="0" message="${esc(b.nota)}"/>`);
      lines.push(`    </IntervalsT>`);
    } else {
      const dur = (b.repeticiones * b.on_min) * 60;
      lines.push(`    <SteadyState Duration="${dur}" Power="${powerOn}"${cad}>`);
      if (b.nota) lines.push(`      <textevent timeoffset="0" message="${esc(b.nota)}"/>`);
      lines.push(`    </SteadyState>`);
    }
  }

  if (est.enfriamiento_min > 0) {
    lines.push(
      `    <Cooldown Duration="${est.enfriamiento_min * 60}" PowerLow="0.6" PowerHigh="0.4"/>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<workout_file>
  <author>${esc(autor)}</author>
  <name>${esc(w.nombre)} — Semana ${w.semana}</name>
  <description>${esc(w.descripcion)}\nTSS objetivo: ${w.tss_objetivo} · Superficie: ${w.superficie}</description>
  <sportType>bike</sportType>
  <tags>
    <tag name="gravel"/>
    <tag name="rural-coach"/>
  </tags>
  <workout>
${lines.join("\n")}
  </workout>
</workout_file>
`;
}
