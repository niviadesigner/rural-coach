"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { loadState, saveState, type AppState } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { guardarPlan } from "@/lib/persist";
import { NOMBRE_FASE, faseDeSemana } from "@/lib/plan-engine";
import { descargarZwo, descargarErg, descargarPdfSemana } from "@/lib/download";
import { PLANES, formatCOP, aplicarDescuento, CODIGOS_MOCK, planTipoPorDuracion } from "@/lib/pricing";
import { EVENTOS } from "@/lib/sample-data";
import { necesitaCalor } from "@/lib/heat";
import type { Workout } from "@/types";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const COLOR_TIPO: Record<string, string> = {
  fondo: "var(--color-olive)",
  tempo: "var(--color-mustard)",
  umbral: "var(--color-terracotta)",
  vo2: "#a03e1f",
  tecnica_gravel: "#7a5a2d",
  fuerza: "#4a5a3a",
  descanso: "#9a9284",
  test: "#2c9c8f",
};

export default function PlanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [st, setSt] = useState<AppState | null>(null);
  const [semanaAbierta, setSemanaAbierta] = useState(1);

  useEffect(() => {
    const s = loadState();
    if (!s.plan) {
      router.replace("/");
      return;
    }
    setSt(s);
  }, [router]);

  // Al iniciar sesión, guarda el plan en la nube (una vez por sesión).
  useEffect(() => {
    const s = loadState();
    if (user && s.plan) {
      const flag = `rc_saved_${user.id}`;
      if (typeof window !== "undefined" && !sessionStorage.getItem(flag)) {
        guardarPlan(user.id, s.plan).then(() => {
          try {
            sessionStorage.setItem(flag, "1");
          } catch {
            /* noop */
          }
        });
      }
    }
  }, [user]);

  // Al volver de Wompi (?id=<txId>), verifica el pago y desbloquea.
  const [pagoMsg, setPagoMsg] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    setPagoMsg("Confirmando tu pago…");
    fetch(`/api/wompi/verificar?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.aprobado) {
          setSt(saveState({ pagado: true }));
          setPagoMsg("¡Pago confirmado! Tu plan completo está desbloqueado. 🚴");
        } else {
          setPagoMsg(`Tu pago quedó ${d.estado ?? "pendiente"}. Si crees que es un error, escríbenos.`);
        }
      })
      .catch(() => setPagoMsg("No pudimos confirmar el pago automáticamente. Escríbenos si ya pagaste."))
      .finally(() => window.history.replaceState({}, "", "/plan"));
  }, []);

  if (!st || !st.plan) return null;
  const plan = st.plan;
  const evento = plan.event_id ? EVENTOS.find((e) => e.id === plan.event_id) : null;

  const semanas = Array.from(new Set(plan.workouts.map((w) => w.semana))).sort((a, b) => a - b);

  const tssTotal = plan.workouts.reduce((a, w) => a + w.tss_objetivo, 0);

  function workoutsDe(semana: number): Workout[] {
    return plan.workouts.filter((w) => w.semana === semana).sort((a, b) => a.dia - b.dia);
  }

  const semanaBloqueada = (semana: number) => semana > 1 && !st.pagado;

  return (
    <>
      <Header paso={4} />
      {pagoMsg && (
        <div style={{ background: "#1f8b7d", color: "#fff", textAlign: "center", padding: "12px 16px", fontFamily: "var(--font-label)", fontWeight: 600, letterSpacing: "0.02em" }}>
          {pagoMsg}
        </div>
      )}

      {/* Resumen del plan */}
      <section className="topo-dark" style={{ padding: "36px 0 32px" }}>
        <div className="rc-container">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-rural.jpg" alt="Rural Coach" width={48} height={48} style={{ borderRadius: "50%" }} />
            <span className="rc-tag">Tu plan está listo</span>
          </div>
          <h1 className="rc-display" style={{ fontSize: "clamp(30px,5vw,52px)", color: "var(--color-cream)", margin: "12px 0 6px" }}>
            {evento ? evento.nombre : "Plan de gravel"}
          </h1>
          <p style={{ color: "rgba(240,235,224,0.8)", maxWidth: "60ch" }}>
            {plan.semanas_totales} semanas · periodización {plan.fases.map((f) => NOMBRE_FASE[f.fase]).join(" → ")}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 16 }}>
            <Metric v={`${plan.ftp_base} W`} l="FTP base" />
            <Metric v={`${plan.fc_umbral_base} ppm`} l="FC umbral" />
            <Metric v={`${plan.workouts.length}`} l="Sesiones" />
            <Metric v={`${tssTotal}`} l="TSS total" />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
            {evento && (
              <Link className="rc-btn rc-btn--gold" href="/nutricion">
                🍚 Tu sticker de nutrición →
              </Link>
            )}
            {necesitaCalor(evento ?? null) && (
              <Link className="rc-btn rc-btn--outline" href="/calor">
                🌡️ Adaptación al calor →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Barra de fases */}
      <div className="rc-container" style={{ marginTop: -16 }}>
        <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          {plan.fases.map((f) => {
            const ancho = ((f.sem_fin - f.sem_inicio + 1) / plan.semanas_totales) * 100;
            const colores: Record<string, string> = {
              base: "var(--color-olive)",
              construccion: "var(--color-mustard)",
              especifico: "var(--color-terracotta)",
              tapering: "#7a2d16",
            };
            return (
              <div
                key={f.fase}
                title={`${NOMBRE_FASE[f.fase]} · sem ${f.sem_inicio}-${f.sem_fin}`}
                style={{ width: `${ancho}%`, background: colores[f.fase], padding: "10px 8px", color: "#fff", fontSize: 11, fontFamily: "var(--font-label)", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden" }}
              >
                {NOMBRE_FASE[f.fase]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Semanas */}
      <section className="topo-light" style={{ padding: "32px 0 64px" }}>
        <div className="rc-container">
          {semanas.map((semana) => {
            const fase = faseDeSemana(plan.fases, semana);
            const bloqueada = semanaBloqueada(semana);
            const abierta = semanaAbierta === semana;
            const ws = workoutsDe(semana);
            const tssSem = ws.reduce((a, w) => a + w.tss_objetivo, 0);
            return (
              <div key={semana} className="rc-card" style={{ marginBottom: 12, padding: 0, opacity: bloqueada ? 0.85 : 1 }}>
                <button
                  onClick={() => setSemanaAbierta(abierta ? -1 : semana)}
                  style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="rc-display" style={{ fontSize: 24, color: "var(--color-charcoal-black)" }}>S{semana}</span>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="rc-tag">{NOMBRE_FASE[fase]}</span>
                        {semana === 1 && (
                          <span className="rc-tag" style={{ background: "var(--color-mustard)", color: "var(--color-charcoal-black)", border: "none" }}>
                            Gratis
                          </span>
                        )}
                        {bloqueada && <span className="rc-eyebrow">🔒 Bloqueada</span>}
                      </div>
                      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                        {ws.length} sesiones · TSS {tssSem}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 20 }}>{abierta ? "−" : "+"}</span>
                </button>

                {abierta && (
                  <div style={{ padding: "0 18px 18px" }}>
                    {bloqueada ? (
                      <Paywall
                        semanas={plan.semanas_totales}
                        eventoNombre={evento?.nombre ?? null}
                        onPay={(pagado) => {
                          const nuevo = saveState({ pagado });
                          setSt(nuevo);
                        }}
                      />
                    ) : (
                      <>
                        <div style={{ display: "grid", gap: 10 }}>
                          {ws.map((w) => (
                            <WorkoutRow key={w.id} w={w} ftp={plan.ftp_base} />
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-default)" }}>
                          <button className="rc-btn rc-btn--outline" onClick={() => descargarPdfSemana(plan, semana)}>
                            PDF de la semana ↓
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function Metric({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div className="rc-display" style={{ fontSize: 26, color: "#5fd0c1" }}>{v}</div>
      <span style={{ fontSize: 12, color: "rgba(240,235,224,0.7)" }}>{l}</span>
    </div>
  );
}

function WorkoutRow({ w, ftp }: { w: Workout; ftp: number }) {
  const [abierto, setAbierto] = useState(false);
  const est = w.estructura_intervalos;
  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ width: 6, background: COLOR_TIPO[w.tipo] ?? "var(--color-olive)" }} />
        <button
          onClick={() => setAbierto(!abierto)}
          style={{ flex: 1, background: "#fff", border: "none", textAlign: "left", padding: "12px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
        >
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
              <span className="rc-eyebrow" style={{ color: "var(--color-charcoal-black)" }}>{DIAS[w.dia]}</span>
              <b style={{ fontSize: 15 }}>{w.nombre}</b>
              {w.tipo === "test" && (
                <span className="rc-tag" style={{ fontSize: 10, background: "var(--color-teal)", color: "var(--color-cream)", border: "none" }}>
                  Recalibra tu FTP
                </span>
              )}
            </div>
            <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
              {w.duracion_min} min · TSS {w.tss_objetivo} · {w.superficie}
              {w.tipo === "fondo" ? " · 🏔️ ventaja altura (2.600m)" : ""}
            </span>
          </div>
          <span style={{ fontSize: 12 }}>{abierto ? "−" : "detalle +"}</span>
        </button>
      </div>
      {abierto && (
        <div style={{ background: "var(--color-surface-card)", padding: "12px 14px 14px 20px", fontSize: 13.5 }}>
          <p style={{ margin: "0 0 10px" }}>{w.descripcion}</p>
          {est.bloques.length > 0 && (
            <ul style={{ margin: "0 0 12px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
              {est.calentamiento_min > 0 && <li>Calentamiento {est.calentamiento_min} min</li>}
              {est.bloques.map((b, i) => {
                const wOn = Math.round((b.pct_ftp / 100) * ftp);
                let linea: string;
                if (b.repeticiones > 1 && b.off_min > 0 && b.pct_ftp_off) {
                  const wOff = Math.round((b.pct_ftp_off / 100) * ftp);
                  linea = `${b.repeticiones} × (${b.on_min}′ a ${b.pct_ftp}% ≈ ${wOn} W / ${b.off_min}′ a ${b.pct_ftp_off}% ≈ ${wOff} W)`;
                } else if (b.repeticiones > 1 && b.off_min > 0) {
                  linea = `${b.repeticiones} × (${b.on_min}′ a ${b.pct_ftp}% FTP ≈ ${wOn} W / ${b.off_min}′ recup)`;
                } else {
                  linea = `${b.on_min}′ a ${b.pct_ftp}% FTP ≈ ${wOn} W`;
                }
                return (
                  <li key={i}>
                    {linea}
                    {b.cadencia ? ` · ${b.cadencia} rpm` : ""}
                    {b.nota ? ` — ${b.nota}` : ""}
                  </li>
                );
              })}
              {est.enfriamiento_min > 0 && <li>Enfriamiento {est.enfriamiento_min} min</li>}
            </ul>
          )}
          {w.tipo !== "descanso" && (
            <>
              <div className="rc-eyebrow" style={{ marginBottom: 6, color: "var(--color-charcoal-black)" }}>
                Descarga el entreno a tu ciclocomputador o app
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <button className="rc-btn rc-btn--outline" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => descargarZwo(w)}>
                  Descargar .ZWO (Zwift) ↓
                </button>
                <button className="rc-btn rc-btn--outline" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => descargarErg(w, ftp)}>
                  Descargar .ERG (Garmin / Wahoo) ↓
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Paywall({
  semanas,
  eventoNombre,
  onPay,
}: {
  semanas: number;
  eventoNombre: string | null;
  onPay: (pagado: boolean) => void;
}) {
  const router = useRouter();
  const { user, disponible } = useAuth();
  const recomendado = planTipoPorDuracion(semanas);
  const [codigo, setCodigo] = useState("");
  const [seleccion, setSeleccion] = useState<string>(recomendado);
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const plan = PLANES.find((p) => p.tipo === seleccion)!;
  const codigoValido = codigo ? Boolean(CODIGOS_MOCK[codigo.toUpperCase()]) : true;
  const desc = aplicarDescuento(plan, codigo || null, codigoValido);

  async function pagar() {
    // Login requerido para desbloquear/pagar (guarda tu plan en tu cuenta).
    if (disponible && !user) {
      router.push("/entrar?next=/plan");
      return;
    }
    setCargando(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wompi/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTipo: seleccion, codigo: codigo || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      if (data.mock) {
        setMsg("Modo demo: pago simulado. Desbloqueando tu plan completo…");
        setTimeout(() => onPay(true), 900);
      } else {
        // En prod: redirigir al Web Checkout de Wompi con la firma de integridad.
        const c = data.checkout;
        const p = new URLSearchParams({
          "public-key": c.publicKey,
          currency: c.currency,
          "amount-in-cents": String(c.amountInCents),
          reference: c.reference,
          "signature:integrity": c.signatureIntegrity,
          "redirect-url": c.redirectUrl,
        });
        window.location.href = `https://checkout.wompi.co/p/?${p.toString()}`;
      }
    } catch (e) {
      setMsg(`No se pudo iniciar el pago: ${String(e)}`);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="topo-dark" style={{ borderRadius: 8, padding: 22 }}>
      <span className="rc-tag">Primera semana completada gratis</span>
      <h3 className="rc-display" style={{ fontSize: 26, color: "var(--color-cream)", margin: "10px 0 4px" }}>
        Desbloquea tu plan completo
      </h3>
      <p style={{ color: "rgba(240,235,224,0.85)", fontSize: 14.5, marginBottom: 16 }}>
        Tu carrera es en <b style={{ color: "var(--color-mustard)" }}>{semanas} semanas</b>
        {eventoNombre ? ` (${eventoNombre})` : ""}. Pagas <b>una sola vez</b> y tienes tu plan completo hasta
        el día del evento — con todos los entrenos descargables y recálculo tras cada salida.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 16 }}>
        {PLANES.map((p) => {
          const activo = seleccion === p.tipo;
          const esRecomendado = p.tipo === recomendado;
          return (
            <button
              key={p.tipo}
              onClick={() => setSeleccion(p.tipo)}
              className="rc-card"
              style={{ position: "relative", textAlign: "left", cursor: "pointer", border: activo ? "2px solid var(--color-mustard)" : esRecomendado ? "1px solid var(--color-mustard)" : "1px solid var(--border-on-dark)", background: activo ? "rgba(212,166,46,0.14)" : undefined, opacity: p.tipo === "mensual" ? 0.85 : 1 }}
            >
              {esRecomendado && (
                <span className="rc-tag" style={{ position: "absolute", top: -10, right: 10, background: "var(--color-mustard)", color: "var(--color-charcoal-black)", border: "none", fontSize: 10 }}>
                  Para tu carrera
                </span>
              )}
              <span className="rc-eyebrow" style={{ color: "var(--color-mustard)" }}>{p.nombre}</span>
              <div className="rc-display" style={{ fontSize: 24, color: "var(--color-cream)" }}>{formatCOP(p.precio_cop)}</div>
              <span style={{ fontSize: 12, color: "rgba(240,235,224,0.7)" }}>{p.descripcion}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <input
          placeholder="Código de evento (ej. RURAL15)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          style={{ maxWidth: 240 }}
        />
        {codigo && (
          <span className="rc-eyebrow" style={{ color: codigoValido ? "var(--color-mustard)" : "#e88" }}>
            {codigoValido ? `−${desc.descuentoPct}% aplicado` : "Código inválido"}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: 12, color: "rgba(240,235,224,0.6)" }}>Total</span>
          <div className="rc-display" style={{ fontSize: 30, color: "var(--color-mustard)" }}>{formatCOP(desc.precioFinal)}</div>
        </div>
        <button className="rc-btn rc-btn--primary" onClick={pagar} disabled={cargando}>
          {cargando ? "Procesando…" : disponible && !user ? "Crear cuenta para desbloquear →" : "Pagar con Wompi →"}
        </button>
      </div>
      {msg && <p style={{ color: "var(--color-cream)", fontSize: 13, marginTop: 12 }}>{msg}</p>}
      <p style={{ fontSize: 11, color: "rgba(240,235,224,0.5)", marginTop: 12 }}>
        Wompi · Nequi · Bancolombia · Tarjetas — pagos en COP.
      </p>
    </div>
  );
}
