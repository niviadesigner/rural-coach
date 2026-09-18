"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import { EVENTOS } from "@/lib/sample-data";
import { saveState } from "@/lib/store";

function semanasHastaHoy(fecha: string): number {
  const ms = new Date(fecha).getTime() - Date.now();
  return Math.max(1, Math.round(ms / (7 * 24 * 3600 * 1000)));
}

export default function Home() {
  const router = useRouter();
  const [otra, setOtra] = useState(false);
  const [form, setForm] = useState({ fecha: "", distancia: "", desnivel: "" });

  function elegirEvento(id: string) {
    saveState({ eventoId: id, tipoPlan: "evento", fechaEventoManual: null });
    router.push("/onboarding");
  }

  function elegirOtra(e: React.FormEvent) {
    e.preventDefault();
    saveState({
      eventoId: null,
      tipoPlan: "evento",
      fechaEventoManual: form.fecha,
      distanciaManual: Number(form.distancia) || null,
      desnivelManual: Number(form.desnivel) || null,
    });
    router.push("/onboarding");
  }

  return (
    <>
      <Header paso={1} />

      {/* HERO */}
      <section className="topo-dark" style={{ padding: "64px 0 56px" }}>
        <div className="rc-container">
          <span className="rc-tag">Tu coach de entrenamiento · Gravel y Ruta · Colombia y LATAM</span>
          <h1
            className="rc-display"
            style={{ fontSize: "clamp(38px, 6.4vw, 80px)", color: "var(--color-cream)", margin: "18px 0 14px", maxWidth: "18ch" }}
          >
            Pagá una vez,
            <br />
            <span style={{ color: "var(--color-mustard)" }}>entrená hasta tu carrera.</span>
          </h1>
          <p style={{ fontSize: 19, maxWidth: "56ch", color: "rgba(240,235,224,0.85)" }}>
            Elige tu evento y recibe al instante un plan dinámico y personalizado que se ajusta con cada
            salida. Un solo pago, tu plan completo hasta el día de la carrera — y la primera semana{" "}
            <b style={{ color: "var(--color-mustard)" }}>gratis</b>.
          </p>
        </div>
      </section>

      {/* TOQUE 1 — ESCOGE TU EVENTO */}
      <section className="topo-light" style={{ padding: "48px 0 72px" }}>
        <div className="rc-container">
          <span className="rc-eyebrow">Toque 1 de 4 · Elige tu objetivo</span>
          <h2 className="rc-display" style={{ fontSize: 34, margin: "6px 0 8px" }}>
            Próximos eventos que puedes entrenar
          </h2>
          <p style={{ maxWidth: "60ch", color: "var(--color-text-muted)", marginBottom: 24 }}>
            Tu carrera es tu objetivo: elige un evento y armamos el plan exacto para llegar a punto ese día.
            ¿Aún sin fecha? También puedes <b>entrenar sin objetivo</b> con un plan mensual.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {EVENTOS.map((e) => (
              <button
                key={e.id}
                onClick={() => elegirEvento(e.id)}
                className="rc-card rc-card--mustard"
                style={{ textAlign: "left", cursor: "pointer", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div
                  className="topo-dark"
                  style={{ position: "relative", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={e.imagen_url}
                    alt={e.nombre}
                    onError={(ev) => {
                      (ev.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Fallback de marca (visible si no hay logo aún) */}
                  <span className="rc-display" style={{ fontSize: 22, color: "var(--color-mustard)", textAlign: "center", lineHeight: 1, zIndex: 0 }}>
                    {e.nombre}
                  </span>
                  <span className="rc-tag" style={{ position: "absolute", top: 10, left: 10, background: "var(--color-mustard)", color: "var(--color-charcoal-black)", border: "none", zIndex: 2 }}>
                    Destacado 2026
                  </span>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <h3 style={{ fontSize: 20 }}>{e.nombre}</h3>
                    <span className="rc-eyebrow">{semanasHastaHoy(e.fecha)} sem</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <span className="rc-tag">{e.distancia_km} km</span>
                    <span className="rc-tag">{e.desnivel_m} m↑</span>
                    <span className="rc-tag">{e.pct_gravel}% gravel</span>
                    <span className="rc-tag">Dif {e.dificultad}/5</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>{e.descripcion}</p>
                  <span className="rc-btn rc-btn--primary" style={{ marginTop: "auto", justifyContent: "center" }}>
                    Inscribirme →
                  </span>
                </div>
              </button>
            ))}

            {/* OTRA CARRERA */}
            <div className="rc-card rc-card--olive" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ fontSize: 20 }}>Otra carrera</h3>
              <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
                ¿Tu objetivo no está en la lista? Dinos la fecha y armamos tu plan igual.
              </p>
              {!otra ? (
                <button className="rc-btn rc-btn--outline" style={{ marginTop: "auto", justifyContent: "center" }} onClick={() => setOtra(true)}>
                  Crear plan a medida →
                </button>
              ) : (
                <form onSubmit={elegirOtra} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
                  <label className="rc-eyebrow">
                    Fecha del evento
                    <input type="date" required value={form.fecha} onChange={(ev) => setForm({ ...form, fecha: ev.target.value })} />
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <label className="rc-eyebrow" style={{ flex: 1 }}>
                      Distancia (km)
                      <input type="number" min={10} value={form.distancia} onChange={(ev) => setForm({ ...form, distancia: ev.target.value })} />
                    </label>
                    <label className="rc-eyebrow" style={{ flex: 1 }}>
                      Desnivel (m)
                      <input type="number" min={0} value={form.desnivel} onChange={(ev) => setForm({ ...form, desnivel: ev.target.value })} />
                    </label>
                  </div>
                  <button className="rc-btn rc-btn--primary" type="submit" style={{ justifyContent: "center" }}>
                    Continuar →
                  </button>
                </form>
              )}
            </div>
          </div>

          <p style={{ marginTop: 28, color: "var(--color-text-muted)", fontSize: 14 }}>
            ¿Sin un evento aún? Entrena sin objetivo con un plan mensual, de 3 o 6 meses.{" "}
            <button
              className="rc-btn rc-btn--ghost"
              style={{ padding: 0, display: "inline" }}
              onClick={() => {
                saveState({ eventoId: null, tipoPlan: "mensual", fechaEventoManual: null });
                router.push("/onboarding");
              }}
            >
              Entrenar sin objetivo →
            </button>
          </p>
        </div>
      </section>
    </>
  );
}
