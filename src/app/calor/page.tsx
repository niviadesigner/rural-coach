"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { loadState } from "@/lib/store";
import { EVENTOS } from "@/lib/sample-data";
import { generarProtocoloCalor, necesitaCalor, type ProtocoloCalor } from "@/lib/heat";
import type { Evento } from "@/types";

export default function CalorPage() {
  const router = useRouter();
  const [protocolo, setProtocolo] = useState<ProtocoloCalor | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);

  useEffect(() => {
    const s = loadState();
    const e = s.eventoId ? EVENTOS.find((x) => x.id === s.eventoId) ?? null : null;
    if (!e || !necesitaCalor(e)) {
      router.replace("/plan");
      return;
    }
    setEvento(e);
    setProtocolo(generarProtocoloCalor(e));
  }, [router]);

  if (!protocolo || !evento) return null;

  return (
    <>
      <Header />
      <section className="topo-dark" style={{ padding: "32px 0 28px" }}>
        <div className="rc-container" style={{ maxWidth: 760 }}>
          <span className="rc-tag">Módulo opcional · Tierra caliente</span>
          <h1 className="rc-display" style={{ fontSize: "clamp(28px,4.5vw,42px)", color: "var(--color-mustard)", margin: "12px 0 8px" }}>
            Adaptación al calor
          </h1>
          <p style={{ color: "rgba(240,235,224,0.85)", maxWidth: "60ch" }}>
            {evento.nombre} corre a ~{protocolo.tempC}°C. El calor te frena si no estás listo. Con 5 sesiones cortas
            en los días previos, tu cuerpo aprende a sudar mejor y a rendir en el calor — <b>sin arriesgar tu salud</b>.
          </p>
        </div>
      </section>

      <section className="topo-light" style={{ padding: "28px 0 64px" }}>
        <div className="rc-container" style={{ maxWidth: 760 }}>
          {/* Reglas de seguridad — PRIMERO, obligatorias */}
          <div className="rc-card rc-card--terracotta" style={{ marginBottom: 20, borderTop: "4px solid var(--color-terracotta)" }}>
            <h2 className="rc-display" style={{ fontSize: 20, color: "var(--color-terracotta)", marginBottom: 10 }}>
              ⚠️ Reglas de seguridad (obligatorias)
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              {protocolo.reglas.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Señales para parar */}
          <div className="rc-card" style={{ marginBottom: 20, background: "color-mix(in srgb, var(--color-terracotta) 8%, #fff)" }}>
            <h2 className="rc-display" style={{ fontSize: 18, marginBottom: 8 }}>🛑 Para YA si sientes:</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {protocolo.senalesParar.map((s, i) => (
                <span key={i} className="rc-tag" style={{ borderColor: "var(--color-terracotta)", color: "var(--color-terracotta)" }}>
                  {s}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 10, marginBottom: 0 }}>
              Detente, ve a la sombra, hidrátate. Si no mejoras rápido, busca atención médica.
            </p>
          </div>

          {/* Protocolo de sesiones */}
          <span className="rc-eyebrow">Las 5 sesiones (días antes del evento)</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "10px 0 20px" }}>
            {protocolo.sesiones.map((s, i) => (
              <div key={i} className="rc-card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ minWidth: 58, textAlign: "center" }}>
                  <div className="rc-display" style={{ fontSize: 22, color: "var(--color-olive)" }}>-{s.dia}d</div>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{s.duracion_min} min</span>
                </div>
                <div>
                  <b style={{ fontSize: 15 }}>{s.titulo}</b>
                  <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", margin: "2px 0 0" }}>{s.descripcion}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>ℹ️ {protocolo.disclaimer}</p>
        </div>
      </section>
    </>
  );
}
