// Barras de TSS semanal (carga del plan por semana). Datos reales del plan.
export default function TssBars({
  valores,
  actual,
  fases,
}: {
  valores: number[]; // TSS objetivo por semana (índice 0 = semana 1)
  actual: number; // semana actual (1-based)
  fases?: string[]; // fase por semana, para colorear
}) {
  const max = Math.max(1, ...valores);
  const W = 320;
  const H = 74;
  const gap = 3;
  const n = valores.length;
  const bw = Math.min(28, Math.max(4, (W - gap * (n - 1)) / n));
  const x0 = (W - (n * bw + gap * (n - 1))) / 2;

  const colorFase = (f?: string) =>
    f === "base" ? "#657a4f" : f === "construccion" ? "#e7c961" : f === "especifico" ? "#c97e4a" : "#8fd8cc";

  return (
    <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" role="img" aria-label="TSS semanal del plan" style={{ display: "block" }}>
      {valores.map((v, i) => {
        const h = Math.max(3, (v / max) * H);
        const x = x0 + i * (bw + gap);
        const esActual = i + 1 === actual;
        return (
          <g key={i}>
            <rect
              x={x}
              y={H - h}
              width={bw}
              height={h}
              rx={2}
              fill={colorFase(fases?.[i])}
              opacity={esActual ? 1 : 0.55}
            />
            {esActual && <rect x={x} y={H + 4} width={bw} height={3} rx={1.5} fill="#f0ebe0" />}
          </g>
        );
      })}
    </svg>
  );
}
