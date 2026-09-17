// ============================================================
// Exportador .ERG — perfil de potencia en vatios absolutos.
// Formato texto compatible con TrainerRoad / GoldenCheetah / ERG mode.
// Requiere el FTP del atleta para convertir %FTP → watts.
// ============================================================

import type { Workout } from "@/types";

export function workoutToErg(w: Workout, ftp: number): string {
  const est = w.estructura_intervalos;
  // Puntos [minuto, watts]. ERG define segmentos por pares de tiempo/potencia.
  const puntos: [number, number][] = [];
  let t = 0;
  const push = (durMin: number, pctFtp: number) => {
    const watts = Math.round((pctFtp / 100) * ftp);
    puntos.push([t, watts]);
    t += durMin;
    puntos.push([t, watts]);
  };

  if (est.calentamiento_min > 0) push(est.calentamiento_min, 55);
  for (const b of est.bloques) {
    for (let r = 0; r < b.repeticiones; r++) {
      push(b.on_min, b.pct_ftp);
      if (b.off_min > 0) push(b.off_min, 55);
    }
  }
  if (est.enfriamiento_min > 0) push(est.enfriamiento_min, 50);

  const cuerpo = puntos.map(([min, watts]) => `${min.toFixed(2)}\t${watts}`).join("\n");

  return `[COURSE HEADER]
VERSION = 2
UNITS = ENGLISH
DESCRIPTION = ${w.nombre} — Semana ${w.semana} · Rural Coach
FILE NAME = rural-coach-s${w.semana}-${w.tipo}.erg
FTP = ${ftp}
MINUTES\tWATTS
[END COURSE HEADER]
[COURSE DATA]
${cuerpo}
[END COURSE DATA]
`;
}
