"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { loadState } from "@/lib/store";
import { EVENTOS } from "@/lib/sample-data";
import { calcularNutricion, ICONO_ALIMENTO, NOMBRE_ALIMENTO, type PlanNutricion } from "@/lib/nutrition";
import type { Evento } from "@/types";

export default function NutricionPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanNutricion | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);

  useEffect(() => {
    const s = loadState();
    let e: Evento | null = s.eventoId ? EVENTOS.find((x) => x.id === s.eventoId) ?? null : null;
    if (!e && s.fechaEventoManual && s.distanciaManual) {
      e = {
        id: "manual",
        nombre: "Tu carrera",
        es_rural_cycle: false,
        fecha: s.fechaEventoManual,
        ciudad: "",
        distancia_km: s.distanciaManual,
        desnivel_m: s.desnivelManual ?? 0,
        pct_gravel: 50,
        dificultad: 3,
        descripcion: "",
        imagen_url: "",
        temperatura_zona_c: 20,
      };
    }
    if (!e) {
      router.replace("/");
      return;
    }
    setEvento(e);
    setPlan(calcularNutricion(e, s.pesoKg));
  }, [router]);

  if (!plan || !evento) return null;

  return (
    <>
      <Header />
      <section className="topo-light" style={{ padding: "32px 0 64px" }}>
        <div className="rc-container" style={{ maxWidth: 720 }}>
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <span className="rc-eyebrow">Avituallamiento · como el de Van der Poel</span>
              <h1 className="rc-display" style={{ fontSize: 30 }}>Tu sticker de nutrición</h1>
            </div>
            <button className="rc-btn rc-btn--primary" onClick={() => window.print()}>
              Imprimir / PDF ↓
            </button>
          </div>

          {/* STICKER */}
          <div id="sticker" className="rc-card" style={{ padding: 0, overflow: "hidden", border: "2px solid var(--color-charcoal-black)" }}>
            <div className="topo-dark" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-rural.jpg" alt="Rural Coach" width={44} height={44} style={{ borderRadius: "50%" }} />
              <div>
                <div className="rc-display" style={{ fontSize: 22, color: "var(--color-cream)" }}>{evento.nombre}</div>
                <span style={{ fontSize: 12, color: "rgba(240,235,224,0.75)" }}>
                  {evento.distancia_km} km · {plan.duracion_h} h estimadas · {evento.temperatura_zona_c}°C
                </span>
              </div>
            </div>

            {/* Resumen */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid var(--border-default)" }}>
              <Resumen v={`${plan.gramos_carb_hora} g/h`} l="Carbohidrato" />
              <Resumen v={`${plan.gramos_carb_total} g`} l="Total carrera" />
              <Resumen v={`${plan.ml_liquido_hora} ml/h`} l={`Líquido · ${plan.clima.etiqueta}`} />
            </div>

            {/* Timeline */}
            <div style={{ padding: "8px 0" }}>
              {plan.puntos.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    borderTop: i === 0 ? "none" : "1px dashed var(--border-default)",
                    background: p.tipo === "gel_cafeina" ? "color-mix(in srgb, var(--color-mustard) 14%, #fff)" : "transparent",
                  }}
                >
                  <span style={{ fontSize: 24, width: 30, textAlign: "center" }}>{ICONO_ALIMENTO[p.tipo]}</span>
                  <div style={{ width: 74 }}>
                    <div className="rc-display" style={{ fontSize: 18 }}>KM {p.km}</div>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>hora {p.hora}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13.5 }}>{NOMBRE_ALIMENTO[p.tipo]}</b>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{p.detalle}</div>
                  </div>
                  <span className="rc-tag" style={{ fontSize: 11 }}>{p.gramos_carb} g</span>
                </div>
              ))}
            </div>

            {/* Clima + advertencia */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-default)", background: "var(--color-surface-card)" }}>
              <p style={{ fontSize: 13, margin: "0 0 8px" }}>
                <b>Clima {plan.clima.etiqueta}:</b> {plan.clima.estrategia}
              </p>
              <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", margin: 0 }}>⚠️ {plan.advertencia}</p>
            </div>
          </div>

          <p className="no-print" style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 14 }}>
            Descárgalo, imprímelo y pégalo en tu potencia. Los símbolos: 🍌 sólido · ⚡ gel · ☕ gel con cafeína · 💧 bebida.
          </p>
        </div>
      </section>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          header { display: none !important; }
          body { background: #fff !important; }
          #sticker { box-shadow: none !important; }
        }
      `}</style>
    </>
  );
}

function Resumen({ v, l }: { v: string; l: string }) {
  return (
    <div style={{ padding: "14px 12px", textAlign: "center", borderRight: "1px solid var(--border-default)" }}>
      <div className="rc-display" style={{ fontSize: 22, color: "var(--color-olive)" }}>{v}</div>
      <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{l}</span>
    </div>
  );
}
