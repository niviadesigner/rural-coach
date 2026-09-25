"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { loadState, type AppState } from "@/lib/store";
import { categoriaPorWkg } from "@/lib/zones";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CuentaPage() {
  const { user, salir, disponible } = useAuth();
  const [st, setSt] = useState<AppState | null>(null);

  useEffect(() => {
    setSt(loadState());
  }, [user]);

  if (!st) return null;

  const tieneDatos = Boolean(st.ftpBase || st.plan || st.conectadoStrava);

  // Sin datos y sin sesión → invita a empezar.
  if (!tieneDatos && !user) {
    return (
      <>
        <Header />
        <section className="topo-light" style={{ minHeight: "60vh", padding: "48px 0", textAlign: "center" }}>
          <div className="rc-container" style={{ maxWidth: 440 }}>
            <h1 className="rc-display" style={{ fontSize: 28, marginBottom: 8 }}>Tu cuenta</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
              Aún no tienes un plan. Elige tu evento y en 2 minutos lo tienes listo.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="rc-btn rc-btn--primary" href="/">Armar mi plan →</Link>
              {disponible && <Link className="rc-btn rc-btn--gold" href="/entrar">Iniciar sesión</Link>}
            </div>
          </div>
        </section>
      </>
    );
  }

  const nombre =
    (user?.user_metadata?.name as string | undefined) ?? st.nombre ?? user?.email?.split("@")[0] ?? "Ciclista";
  const wkg = st.ftpBase && st.pesoKg ? Math.round((st.ftpBase / st.pesoKg) * 10) / 10 : null;
  const cat = wkg ? categoriaPorWkg(wkg) : null;

  return (
    <>
      <Header />
      <section className="topo-dark" style={{ padding: "32px 0 28px" }}>
        <div className="rc-container" style={{ maxWidth: 640, display: "flex", alignItems: "center", gap: 16 }}>
          {st.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={st.avatarUrl} alt="" width={64} height={64} style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-mustard)" }} />
          ) : (
            <span style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-mustard)", color: "var(--color-charcoal-black)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 28 }}>
              {nombre.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="rc-display" style={{ fontSize: 26, color: "var(--color-cream)" }}>{nombre}</h1>
            <span style={{ fontSize: 13, color: "rgba(240,235,224,0.7)" }}>
              {user?.email ?? "Invitado"} {st.conectadoStrava ? `· Strava${st.stravaPremium ? " Premium" : ""}` : ""}
            </span>
          </div>
        </div>
      </section>

      <section className="topo-light" style={{ padding: "24px 0 64px" }}>
        <div className="rc-container" style={{ maxWidth: 640 }}>
          {disponible && !user && (
            <div className="rc-card" style={{ marginBottom: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", borderTop: "4px solid var(--color-mustard)" }}>
              <span style={{ fontSize: 13.5 }}>Tus datos están en este dispositivo. Crea tu cuenta para guardarlos en la nube y usarlos en cualquier celu.</span>
              <Link className="rc-btn rc-btn--primary" href="/entrar?next=/cuenta" style={{ padding: "8px 16px", fontSize: 13 }}>Crear cuenta →</Link>
            </div>
          )}
          <span className="rc-eyebrow">Tus números {st.conectadoStrava ? "(desde Strava)" : "(los que ingresaste)"}</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, margin: "10px 0 20px" }}>
            <Dato v={st.ftpBase ? `${st.ftpBase} W` : "—"} l="FTP" />
            <Dato v={wkg ? `${wkg.toFixed(1)} W/kg` : "—"} l={cat ? cat.label : "W/kg"} color={cat?.color} />
            <Dato v={st.fcUmbralBase ? `${st.fcUmbralBase} ppm` : "—"} l="FC umbral" />
            <Dato v={st.pesoKg ? `${st.pesoKg} kg` : "—"} l="Peso" />
            <Dato v={st.horasSemana ? `${st.horasSemana} h` : "—"} l="Horas/semana" />
            <Dato v={st.nivel} l="Nivel" />
          </div>

          <span className="rc-eyebrow">Días que entrenas</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 22px" }}>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <span key={d} className="rc-tag" style={{ background: st.diasDisponibles.includes(d) ? "var(--color-olive)" : "transparent", color: st.diasDisponibles.includes(d) ? "var(--color-cream)" : "var(--color-text-muted)", border: st.diasDisponibles.includes(d) ? "none" : "1px solid var(--border-default)" }}>
                {DIAS[d]}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {st.plan && (
              <Link className="rc-btn rc-btn--primary" href="/plan">Ver mi plan →</Link>
            )}
            {!st.conectadoStrava && (
              <Link className="rc-btn rc-btn--outline" href="/onboarding">Conectar Strava / editar datos</Link>
            )}
            {disponible && user && (
              <button className="rc-btn rc-btn--gold" onClick={() => salir()}>Cerrar sesión</button>
            )}
          </div>

          {!st.conectadoStrava && (
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 14 }}>
              Ingresaste tus datos a mano. Si conectas Strava, jalamos tus vatios y tu foto automáticamente.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

function Dato({ v, l, color }: { v: string; l: string; color?: string }) {
  return (
    <div className="rc-card" style={{ padding: "12px 14px" }}>
      <div className="rc-display" style={{ fontSize: 22, color: color ?? "var(--color-olive)", textTransform: "capitalize" }}>{v}</div>
      <span style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{l}</span>
    </div>
  );
}
