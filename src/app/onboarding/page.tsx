"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { loadState, saveState, type AppState } from "@/lib/store";
import { MOCK_MODE } from "@/lib/supabase/client";
import { authorizeUrl, ATLETA_DEV } from "@/lib/strava";
import { estimarFtpDesde20min, estimarFtpRutaB, estimarFcUmbral } from "@/lib/zones";
import { ACTIVIDAD_MOCK, EVENTOS } from "@/lib/sample-data";
import { generarPlan, type PlanInput } from "@/lib/plan-engine";
import type { Nivel } from "@/types";

const DIAS_LABEL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function OnboardingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [st, setSt] = useState<AppState | null>(null);
  const [ruta, setRuta] = useState<"strava" | "manual" | null>(null);
  const [watts20, setWatts20] = useState("");
  const [ftpConocido, setFtpConocido] = useState(false);
  const [kmSalida, setKmSalida] = useState("");
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    const s = loadState();
    // ¿Volvemos del callback real de Strava?
    if (params.get("strava") === "ok") {
      const athlete = Number(params.get("athlete")) || ATLETA_DEV;
      const nuevo = saveState({ conectadoStrava: true, athleteId: athlete });
      setSt(nuevo);
      setRuta("strava");
    } else {
      setSt(s);
    }
  }, [params]);

  if (!st) return null;

  const evento = st.eventoId ? EVENTOS.find((e) => e.id === st.eventoId) ?? null : null;

  function conectarStrava() {
    if (MOCK_MODE) {
      // Modo dev: simulamos la conexión con la actividad de ejemplo.
      const ftp = estimarFtpDesde20min(ACTIVIDAD_MOCK.mejor_20min_w);
      const nuevo = saveState({
        conectadoStrava: true,
        athleteId: ATLETA_DEV,
        ftpBase: ftp,
        fcUmbralBase: estimarFcUmbral(ACTIVIDAD_MOCK.fc_max),
      });
      setSt(nuevo);
      setRuta("strava");
    } else {
      window.location.href = authorizeUrl(st?.eventoId ?? "");
    }
  }

  function elegirManual() {
    saveState({ conectadoStrava: false });
    setRuta("manual");
    setSt(loadState());
  }

  function toggleDia(d: number) {
    const set = new Set(st!.diasDisponibles);
    if (set.has(d)) set.delete(d);
    else set.add(d);
    const nuevo = saveState({ diasDisponibles: Array.from(set).sort((a, b) => a - b) });
    setSt(nuevo);
  }

  function setNivel(n: Nivel) {
    setSt(saveState({ nivel: n }));
  }

  function verMiPlan() {
    setGenerando(true);
    let ftp = st!.ftpBase;
    let fcU = st!.fcUmbralBase;
    if (ruta === "manual") {
      ftp = estimarFtpRutaB(Number(watts20) || 200, ftpConocido);
      fcU = fcU ?? 160;
    }
    ftp = ftp ?? 200;
    fcU = fcU ?? 160;

    const fechaEvento =
      evento?.fecha ?? st!.fechaEventoManual ?? null;

    const input: PlanInput = {
      nivel: st!.nivel,
      diasDisponibles: st!.diasDisponibles,
      horasSemana: st!.horasSemana,
      ftpBase: ftp,
      fcUmbralBase: fcU,
      fechaInicio: new Date(),
      fechaEvento: fechaEvento ? new Date(fechaEvento) : null,
      evento,
      tipo: st!.tipoPlan,
      pctGravel: evento?.pct_gravel ?? 40,
    };
    const plan = generarPlan(input);
    saveState({ ftpBase: ftp, fcUmbralBase: fcU, km_tipicos: Number(kmSalida) || null, plan });
    router.push("/plan");
  }

  const puedeVerPlan =
    st.diasDisponibles.length >= 2 && (ruta === "strava" || (ruta === "manual" && watts20));

  return (
    <>
      <Header paso={ruta ? 3 : 2} />
      <section className="topo-light" style={{ minHeight: "calc(100vh - 68px)", padding: "40px 0 72px" }}>
        <div className="rc-container" style={{ maxWidth: 720 }}>
          {evento && (
            <div className="rc-card rc-card--mustard" style={{ marginBottom: 24, display: "flex", gap: 14, alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={evento.imagen_url} alt="" width={64} height={64} style={{ borderRadius: 6, objectFit: "cover" }} />
              <div>
                <span className="rc-eyebrow">Tu objetivo</span>
                <h3 style={{ fontSize: 20 }}>{evento.nombre}</h3>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  {evento.distancia_km} km · {evento.desnivel_m} m↑ · {evento.pct_gravel}% gravel
                </span>
              </div>
            </div>
          )}

          {/* TOQUE 2 — STRAVA */}
          {!ruta && (
            <>
              <span className="rc-eyebrow">Toque 2 de 4</span>
              <h2 className="rc-display" style={{ fontSize: 32, margin: "6px 0 8px" }}>
                Conéctate con Strava
              </h2>
              <p style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
                Un botón y jalamos todo: tu historial estima tu FTP automáticamente. Cero preguntas técnicas.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
                <button className="rc-btn rc-btn--strava" onClick={conectarStrava}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M15.4 16.97l-2.1-4.14h-3.1L15.4 24l5.2-11.17h-3.1M9.8 0L4.6 11.17h3.1L9.8 6.9l2.1 4.27h3.1z" />
                  </svg>
                  Conectar con Strava
                </button>
                <button className="rc-btn rc-btn--outline" onClick={elegirManual}>
                  Continuar sin Strava →
                </button>
                {MOCK_MODE && (
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    Modo demo: Strava se simula con una salida de ejemplo (FTP ≈{" "}
                    {estimarFtpDesde20min(ACTIVIDAD_MOCK.mejor_20min_w)} W).
                  </span>
                )}
              </div>
            </>
          )}

          {/* TOQUE 3 — DÍAS + (3 preguntas si manual) */}
          {ruta && (
            <>
              <span className="rc-eyebrow">Toque 3 de 4</span>
              <h2 className="rc-display" style={{ fontSize: 32, margin: "6px 0 16px" }}>
                {ruta === "strava" ? "Confirma tus días" : "Cuéntanos lo básico"}
              </h2>

              {ruta === "strava" && st.ftpBase && (
                <div className="rc-card" style={{ marginBottom: 20 }}>
                  <span className="rc-eyebrow">Calibración automática desde Strava</span>
                  <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                    <div>
                      <div className="rc-display" style={{ fontSize: 30, color: "var(--color-olive)" }}>{st.ftpBase} W</div>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>FTP estimado</span>
                    </div>
                    <div>
                      <div className="rc-display" style={{ fontSize: 30, color: "var(--color-terracotta)" }}>{st.fcUmbralBase} ppm</div>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>FC umbral</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 10, marginBottom: 0 }}>
                    Tu primera salida con la app afina esto automáticamente. Sin ramp tests.
                  </p>
                </div>
              )}

              {ruta === "manual" && (
                <div className="rc-card" style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                  <label className="rc-eyebrow">
                    ¿Cuántos vatios sostienes ~20 min? (o tu FTP si lo sabes)
                    <input type="number" min={80} placeholder="ej. 230" value={watts20} onChange={(e) => setWatts20(e.target.value)} />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <input type="checkbox" style={{ width: "auto" }} checked={ftpConocido} onChange={(e) => setFtpConocido(e.target.checked)} />
                    Ese número ya es mi FTP conocido
                  </label>
                  <label className="rc-eyebrow">
                    ¿Km típicos por salida?
                    <input type="number" min={5} placeholder="ej. 45" value={kmSalida} onChange={(e) => setKmSalida(e.target.value)} />
                  </label>
                </div>
              )}

              {/* Nivel */}
              <span className="rc-eyebrow">Tu nivel</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 20px" }}>
                {(["principiante", "intermedio", "avanzado"] as Nivel[]).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNivel(n)}
                    className="rc-btn"
                    style={{
                      background: st.nivel === n ? "var(--color-olive)" : "transparent",
                      color: st.nivel === n ? "var(--color-cream)" : "var(--color-charcoal-brown)",
                      border: "2px solid var(--color-olive)",
                      textTransform: "capitalize",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Días disponibles */}
              <span className="rc-eyebrow">¿Qué días puedes entrenar?</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 16px" }}>
                {DIAS_LABEL.map((label, d) => {
                  const activo = st.diasDisponibles.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDia(d)}
                      className="rc-btn"
                      style={{
                        padding: "10px 16px",
                        background: activo ? "var(--color-mustard)" : "transparent",
                        color: activo ? "var(--color-charcoal-black)" : "var(--color-charcoal-brown)",
                        border: "2px solid var(--color-mustard)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <label className="rc-eyebrow" style={{ display: "block", maxWidth: 280, marginBottom: 24 }}>
                Horas por semana: {st.horasSemana} h
                <input
                  type="range"
                  min={3}
                  max={16}
                  value={st.horasSemana}
                  onChange={(e) => setSt(saveState({ horasSemana: Number(e.target.value) }))}
                  style={{ padding: 0 }}
                />
              </label>

              <button className="rc-btn rc-btn--primary" disabled={!puedeVerPlan || generando} onClick={verMiPlan} style={{ fontSize: 17, padding: "16px 32px" }}>
                {generando ? "Generando tu plan…" : "Ver mi plan al instante →"}
              </button>
              {!puedeVerPlan && (
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 10 }}>
                  Elige al menos 2 días{ruta === "manual" ? " e indica tus vatios" : ""}.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingInner />
    </Suspense>
  );
}
