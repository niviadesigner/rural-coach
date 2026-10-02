import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="rc-footer topo-dark" style={{ padding: "30px 0 36px", borderTop: "1px solid var(--border-on-dark)" }}>
      <div className="rc-container" style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-rural.jpg" alt="Rural Coach" width={38} height={38} style={{ borderRadius: "50%" }} />
          <div>
            <b className="rc-display" style={{ color: "var(--color-cream)", fontSize: 17 }}>RURAL COACH</b>
            <div style={{ fontSize: 12, color: "rgba(240,235,224,0.6)" }}>Una experiencia Rural Cycle · La Sabana de Bogotá</div>
          </div>
        </div>

        <nav aria-label="Legal y contacto" style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", fontSize: 13 }}>
          <Link href="/privacidad" style={{ color: "#8fd8cc" }}>Privacidad</Link>
          <Link href="/terminos" style={{ color: "#8fd8cc" }}>Términos y reglamento</Link>
          <a href="https://www.instagram.com/ruralcycle.cc/" target="_blank" rel="noopener" style={{ color: "#8fd8cc" }}>Instagram</a>
          <a href="https://wa.me/573196546050" target="_blank" rel="noopener" style={{ color: "#8fd8cc" }}>WhatsApp</a>
          <a href="https://ruralcycle.cc" target="_blank" rel="noopener" style={{ color: "#8fd8cc" }}>ruralcycle.cc</a>
        </nav>
      </div>

      <div className="rc-container" style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(240,235,224,0.45)", margin: 0, maxWidth: "70ch" }}>
          Metodología inspirada en principios de entrenamiento de élite. Rural Coach no está afiliado ni respaldado por
          Strava, Inc., Kristof De Kegel ni Alpecin-Premier Tech. Strava es marca de Strava, Inc.
        </p>
      </div>
    </footer>
  );
}
