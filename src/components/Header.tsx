import Link from "next/link";

export default function Header({ paso }: { paso?: number }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid var(--border-default)",
        background: "rgba(240,235,224,0.85)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "inherit" }}>
        <img
          src="https://ruralcycle.cc/imagenes/logo-oscuro.webp"
          alt="Rural Cycle"
          width={34}
          height={34}
          style={{ borderRadius: 6 }}
        />
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <b className="rc-display" style={{ fontSize: 20, color: "var(--color-charcoal-black)" }}>
            RURAL COACH
          </b>
          <span className="rc-eyebrow" style={{ fontSize: 10 }}>
            Entrenamiento gravel · Rural Cycle
          </span>
        </span>
      </Link>
      {paso ? (
        <div className="rc-eyebrow" aria-label={`Paso ${paso} de 4`} style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              style={{
                width: 26,
                height: 6,
                borderRadius: 999,
                background: n <= paso ? "var(--color-mustard)" : "var(--border-default)",
              }}
            />
          ))}
        </div>
      ) : null}
    </header>
  );
}
