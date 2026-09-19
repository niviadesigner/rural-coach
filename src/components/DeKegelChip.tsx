"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeKegelChip() {
  const router = useRouter();
  const [montado, setMontado] = useState(false);
  const [visible, setVisible] = useState(false);

  function abrir() {
    setMontado(true);
    requestAnimationFrame(() => setVisible(true));
  }
  function cerrar() {
    setVisible(false);
    setTimeout(() => setMontado(false), 240);
  }

  useEffect(() => {
    document.body.style.overflow = montado ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [montado]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    if (montado) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [montado]);

  return (
    <>
      <div className="rc-dekegel-bar">
        <button className="rc-dekegel-chip" onClick={abrir}>
          <span>🔬 El método de <b>Kristof De Kegel</b>, entrenador de Van der Poel</span>
          <span className="rc-dekegel-chip__more">¿Quién es? →</span>
        </button>
      </div>

      {montado && (
        <div
          className="rc-modal-overlay"
          data-visible={visible}
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrar();
          }}
        >
          <div className="rc-modal topo-dark" data-visible={visible} role="dialog" aria-modal="true" aria-label="Quién es Kristof De Kegel">
            <button className="rc-modal__close" onClick={cerrar} aria-label="Cerrar">
              ✕
            </button>

            <span className="rc-tag">El método</span>
            <h2 className="rc-display" style={{ fontSize: 30, color: "var(--color-mustard)", margin: "12px 0 16px", lineHeight: 1.05 }}>
              El cerebro detrás del campeón.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "rgba(240,235,224,0.86)", fontSize: 14.5, lineHeight: 1.6 }}>
              <p style={{ margin: 0 }}>
                <b style={{ color: "var(--color-cream)" }}>Kristof De Kegel</b> es el entrenador detrás de
                Mathieu van der Poel, uno de los ciclistas más dominantes de la historia. Su trabajo cambió
                la forma de preparar a un campeón del mundo.
              </p>
              <p style={{ margin: 0 }}>
                Su método prioriza la <b style={{ color: "var(--color-mustard)" }}>calidad sobre el volumen</b>:
                tests cortos que recalibran tu forma, intervalos <b>over/under</b> que suben tu umbral de verdad,
                y hasta un <b>sticker de nutrición</b> pegado a la potencia que dice qué comer y cuándo.
              </p>
              <p style={{ margin: 0 }}>
                En <b style={{ color: "var(--color-cream)" }}>Rural Coach</b> tomamos esos principios de élite y
                los escalamos al ciclista real: el que trabaja, tiene familia y quiere llegar fuerte a su gravel —
                aprovechando además la altura de La Sabana (2.600 m).
              </p>
            </div>

            <p className="rc-display" style={{ fontSize: 18, color: "var(--color-cream)", margin: "18px 0 16px" }}>
              El método de los pros, hecho para nuestras montañas. 🐦
            </p>

            <button
              className="rc-btn rc-btn--primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => {
                cerrar();
                setTimeout(() => {
                  const el = document.getElementById("plan");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else router.push("/onboarding");
                }, 260);
              }}
            >
              Armar mi plan →
            </button>

            <p style={{ fontSize: 10.5, color: "rgba(240,235,224,0.45)", marginTop: 14, marginBottom: 0 }}>
              Metodología inspirada en principios de entrenamiento de élite. Rural Coach no está afiliado a
              Kristof De Kegel ni a Alpecin-Premier Tech.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
