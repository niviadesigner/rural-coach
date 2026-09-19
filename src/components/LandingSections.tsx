import Link from "next/link";

const METODO = [
  { icon: "📊", titulo: "Calidad, no kilómetros porque sí", texto: "Rodar en grupo a rueda te hace sentir en forma sin estarlo. Detectamos tus “salidas de arrastre” y te decimos cuándo de verdad sumaste." },
  { icon: "🧪", titulo: "Tests de 15 minutos, sin laboratorio", texto: "Cada mes un test corto recalibra tu FTP y tus zonas automáticamente. Tu plan siempre va un paso adelante de tu forma." },
  { icon: "⚡", titulo: "Over/unders que construyen motor", texto: "La columna vertebral de tu fase de construcción: intervalos que suben tu umbral de verdad, no que te dejan solo cansado." },
  { icon: "🏔️", titulo: "Tu altura es tu superpoder", texto: "La Sabana está a 2.600 m. Lo que los pros buscan en campamentos carísimos, tú lo tienes al salir de casa. Tu plan lo aprovecha." },
  { icon: "🧠", titulo: "Flexible como la vida real", texto: "¿Te saltaste un día? El plan se adapta a lo que cumpliste, no te castiga. La consistencia gana, no el heroísmo de un solo día." },
];

const FAQ = [
  { q: "¿Necesito potenciómetro?", a: "No. Si lo tienes, afinamos con vatios. Si no, trabajamos con ritmo cardíaco y sensaciones. El plan se adapta a tu equipo." },
  { q: "¿Sirve si soy principiante?", a: "Totalmente. Tú eliges tu nivel y el plan arranca donde estás. Nadie nació sabiendo rodar en gravel." },
  { q: "¿Cómo se conecta con mi reloj?", a: "Exportamos tus entrenos en .FIT, .ZWO y PDF. Los abres en Garmin, Wahoo, Zwift o los sigues desde la app." },
  { q: "¿Qué pasa si me lesiono o viajo?", a: "Reprogramas sin romper el plan. Se ajusta a tu vida real, no al revés." },
  { q: "¿El plan cambia según cómo voy?", a: "Sí. Cada salida que sincronizas recalcula tu forma y ajusta lo que viene. Es vivo, no un PDF muerto." },
];

export default function LandingSections() {
  return (
    <>
      {/* LA METODOLOGÍA */}
      <section className="topo-dark" style={{ padding: "56px 0" }}>
        <div className="rc-container">
          <span className="rc-tag">El método · Kristof De Kegel</span>
          <h2 className="rc-display" style={{ fontSize: "clamp(28px,4vw,40px)", color: "var(--color-cream)", margin: "12px 0 10px", maxWidth: "20ch" }}>
            No es un plan genérico. Es ciencia de élite, escalada a ti.
          </h2>
          <p style={{ color: "rgba(240,235,224,0.82)", maxWidth: "62ch", marginBottom: 28 }}>
            Tomamos los principios que llevaron a Van der Poel a lo más alto —de la mano de su entrenador Kristof De Kegel— y los adaptamos para el ciclista real: el que trabaja, tiene familia y quiere llegar fuerte a su carrera.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {METODO.map((m) => (
              <div key={m.titulo} className="rc-card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 26 }}>{m.icon}</span>
                <b style={{ fontSize: 16, color: "var(--color-cream)" }}>{m.titulo}</b>
                <span style={{ fontSize: 13.5, color: "rgba(240,235,224,0.75)" }}>{m.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUTRICIÓN */}
      <section className="topo-light" style={{ padding: "56px 0" }}>
        <div className="rc-container" style={{ maxWidth: 760 }}>
          <span className="rc-eyebrow">Avituallamiento</span>
          <h2 className="rc-display" style={{ fontSize: "clamp(26px,4vw,38px)", margin: "8px 0 12px" }}>
            Tu sticker de nutrición, como el de Van der Poel.
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 14 }}>
            Van der Poel gana carreras con un sticker pegado a la potencia que le dice qué comer y cuándo. Ahora tú también. Para cada evento generamos tu plan de avituallamiento: qué consumir, en qué kilómetro y cuánto — según la distancia, el desnivel, el clima de la zona y tu peso.
          </p>
          <ul style={{ margin: "0 0 8px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <li>Descárgalo, imprímelo y pégalo en tu potencia.</li>
            <li>Ajustado al calor: frío = más sólido, calor = más líquido y electrolitos.</li>
            <li>Rango seguro para amateurs (60–90 g/h). Te enseñamos a entrenar el estómago.</li>
            <li>Sólidos temprano 🍌, geles cuando pica ⚡, cafeína en el tramo clave ☕.</li>
          </ul>
          <p style={{ fontFamily: "var(--font-label)", fontSize: 14, color: "var(--color-terracotta)", fontWeight: 700 }}>
            No más &quot;pájara&quot; a mitad de carrera. Comes con estrategia, no por instinto.
          </p>
        </div>
      </section>

      {/* PRUEBA GRATIS */}
      <section className="topo-dark" style={{ padding: "48px 0" }}>
        <div className="rc-container" style={{ maxWidth: 700, textAlign: "center" }}>
          <h2 className="rc-display" style={{ fontSize: "clamp(26px,4vw,38px)", color: "var(--color-cream)", marginBottom: 10 }}>
            Una semana real. Gratis. Sin tarjeta.
          </h2>
          <p style={{ color: "rgba(240,235,224,0.82)", marginBottom: 20 }}>
            No te pedimos plata para &quot;ver el plan&quot;. Te damos la primera semana completa —entrenos descargables incluidos— para que entrenes de verdad. Si te sirve, sigues. Así de simple.
          </p>
          <Link className="rc-btn rc-btn--primary" href="#plan">Arma mi plan gratis →</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="topo-light" style={{ padding: "56px 0" }}>
        <div className="rc-container" style={{ maxWidth: 760 }}>
          <span className="rc-eyebrow">Preguntas</span>
          <h2 className="rc-display" style={{ fontSize: "clamp(26px,4vw,36px)", margin: "8px 0 22px" }}>
            Lo que todos preguntan
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQ.map((f) => (
              <details key={f.q} className="rc-card" style={{ padding: "14px 16px" }}>
                <summary style={{ cursor: "pointer", fontFamily: "var(--font-label)", fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  {f.q}
                </summary>
                <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: "var(--color-text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="topo-dark" style={{ padding: "60px 0 40px" }}>
        <div className="rc-container" style={{ textAlign: "center", maxWidth: 680 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🐦</div>
          <h2 className="rc-display" style={{ fontSize: "clamp(30px,5vw,52px)", color: "var(--color-mustard)", marginBottom: 12 }}>
            El pájaro Rural ya cantó, ahora a ganar.
          </h2>
          <p style={{ color: "rgba(240,235,224,0.82)", marginBottom: 22 }}>
            Tu próxima carrera de gravel no se gana el día del evento. Se gana en las semanas de antes. Empieza hoy, gratis.
          </p>
          <Link className="rc-btn rc-btn--primary" href="#plan">Arma mi plan gratis →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="topo-dark" style={{ padding: "28px 0 40px", borderTop: "1px solid var(--border-on-dark)" }}>
        <div className="rc-container" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-rural.jpg" alt="Rural Coach" width={40} height={40} style={{ borderRadius: "50%" }} />
            <div>
              <b className="rc-display" style={{ color: "var(--color-cream)", fontSize: 18 }}>RURAL COACH</b>
              <div style={{ fontSize: 12, color: "rgba(240,235,224,0.6)" }}>Una experiencia Rural Cycle · La Sabana de Bogotá</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <a href="https://www.instagram.com/ruralcycle.cc/" target="_blank" rel="noopener" style={{ color: "#8fd8cc" }}>Instagram</a>
            <a href="https://wa.me/573196546050" target="_blank" rel="noopener" style={{ color: "#8fd8cc" }}>WhatsApp</a>
            <a href="https://ruralcycle.cc" target="_blank" rel="noopener" style={{ color: "#8fd8cc" }}>ruralcycle.cc</a>
          </div>
        </div>
        <p className="rc-container" style={{ fontSize: 11, color: "rgba(240,235,224,0.45)", marginTop: 18 }}>
          Metodología inspirada en principios de entrenamiento de élite. Rural Coach no está afiliado a Kristof De Kegel ni a Alpecin-Premier Tech.
        </p>
      </footer>
    </>
  );
}
