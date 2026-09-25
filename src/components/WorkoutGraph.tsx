import type { EstructuraIntervalos } from "@/types";

// Perfil de potencia del entreno (barras por %FTP), estilo Wahoo/Zwift.
function colorZona(pct: number): string {
  if (pct < 56) return "#657a4f"; // Z1
  if (pct < 76) return "#4a5a3a"; // Z2
  if (pct < 91) return "#d4a62e"; // Z3
  if (pct < 106) return "#c97e4a"; // Z4
  if (pct < 121) return "#b5652d"; // Z5
  return "#a03e1f"; // Z6+
}

export default function WorkoutGraph({ est }: { est: EstructuraIntervalos }) {
  const segs: { min: number; pct: number }[] = [];
  if (est.calentamiento_min) segs.push({ min: est.calentamiento_min, pct: 50 });
  for (const b of est.bloques) {
    for (let r = 0; r < b.repeticiones; r++) {
      segs.push({ min: b.on_min, pct: b.pct_ftp });
      if (b.off_min > 0) segs.push({ min: b.off_min, pct: b.pct_ftp_off ?? 52 });
    }
  }
  if (est.enfriamiento_min) segs.push({ min: est.enfriamiento_min, pct: 45 });
  if (segs.length === 0) return null;

  const totalMin = segs.reduce((a, s) => a + s.min, 0);
  const W = 320;
  const H = 78;
  const maxPct = Math.max(120, ...segs.map((s) => s.pct));
  let x = 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="78" role="img" aria-label="Perfil de potencia del entreno" style={{ display: "block" }}>
      {/* Línea de FTP (100%) */}
      <line x1="0" y1={H - (100 / maxPct) * (H - 6)} x2={W} y2={H - (100 / maxPct) * (H - 6)} stroke="rgba(28,27,25,0.28)" strokeWidth="1" strokeDasharray="3 3" />
      {segs.map((s, i) => {
        const w = (s.min / totalMin) * W;
        const h = (s.pct / maxPct) * (H - 6);
        const rect = <rect key={i} x={x} y={H - h} width={Math.max(0.5, w - 0.5)} height={h} fill={colorZona(s.pct)} rx={1} />;
        x += w;
        return rect;
      })}
    </svg>
  );
}
