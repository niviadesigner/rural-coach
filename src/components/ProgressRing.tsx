// Anillo de progreso (SVG) para el dashboard del plan.
export default function ProgressRing({
  value,
  label,
  sub,
  size = 84,
  color = "#5fd0c1",
}: {
  value: number; // 0–100
  label: string; // texto central grande
  sub: string; // etiqueta debajo
  size?: number;
  color?: string;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} ${sub}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(240,235,224,0.10)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * c} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div
          className="rc-display"
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.27, color: "var(--app-text, #f0ebe0)" }}
        >
          {label}
        </div>
      </div>
      <span style={{ fontSize: 11, color: "var(--app-muted, #a39a8b)", textAlign: "center", lineHeight: 1.2 }}>{sub}</span>
    </div>
  );
}
