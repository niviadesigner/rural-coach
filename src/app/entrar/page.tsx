"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";

function EntrarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { registrar, entrar, disponible } = useAuth();
  const destino = params.get("next") || "/plan";

  const [modo, setModo] = useState<"entrar" | "registro">("registro");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setOk(null);
    if (!email || !password) {
      setMsg("Completa correo y contraseña.");
      return;
    }
    setCargando(true);
    if (modo === "registro") {
      const r = await registrar(email, password, nombre);
      setCargando(false);
      if (r.error) return setMsg(r.error);
      if (r.necesitaConfirmar) {
        setOk("¡Casi listo! Te enviamos un correo para confirmar tu cuenta. Ábrelo y vuelve a entrar.");
        return;
      }
      router.push(destino);
    } else {
      const r = await entrar(email, password);
      setCargando(false);
      if (r.error) return setMsg(r.error);
      router.push(destino);
    }
  }

  return (
    <>
      <Header />
      <section className="topo-light" style={{ minHeight: "calc(100vh - 68px)", padding: "40px 0 72px" }}>
        <div className="rc-container" style={{ maxWidth: 460 }}>
          <span className="rc-eyebrow">Tu cuenta Rural Coach</span>
          <h1 className="rc-display" style={{ fontSize: 34, margin: "6px 0 8px" }}>
            {modo === "registro" ? "Crea tu cuenta" : "Inicia sesión"}
          </h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
            Guarda tu plan en la nube y desbloquéalo desde cualquier dispositivo.
          </p>

          {!disponible && (
            <div className="rc-card" style={{ marginBottom: 16, borderColor: "var(--color-terracotta)" }}>
              El sistema de cuentas aún no está configurado en este entorno. Avísale al equipo.
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button
              className="rc-btn"
              onClick={() => setModo("registro")}
              style={pill(modo === "registro")}
            >
              Crear cuenta
            </button>
            <button className="rc-btn" onClick={() => setModo("entrar")} style={pill(modo === "entrar")}>
              Ya tengo cuenta
            </button>
          </div>

          <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {modo === "registro" && (
              <label className="rc-eyebrow">
                Nombre
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
              </label>
            )}
            <label className="rc-eyebrow">
              Correo
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" />
            </label>
            <label className="rc-eyebrow">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={modo === "registro" ? "new-password" : "current-password"}
              />
            </label>

            {msg && <span style={{ fontSize: 13, color: "var(--color-terracotta)" }}>{msg}</span>}
            {ok && <span style={{ fontSize: 13, color: "var(--color-olive)" }}>{ok}</span>}

            <button className="rc-btn rc-btn--primary" type="submit" disabled={cargando || !disponible} style={{ justifyContent: "center", marginTop: 4 }}>
              {cargando ? "Un momento…" : modo === "registro" ? "Crear cuenta →" : "Entrar →"}
            </button>
          </form>

          <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 16 }}>
            Al crear tu cuenta aceptas las políticas de Rural Cycle. Tus datos solo se usan para tu entrenamiento.
          </p>
        </div>
      </section>
    </>
  );
}

function pill(activo: boolean): React.CSSProperties {
  return {
    flex: 1,
    justifyContent: "center",
    padding: "10px 12px",
    fontSize: 14,
    background: activo ? "var(--color-olive)" : "transparent",
    color: activo ? "var(--color-cream)" : "var(--color-charcoal-brown)",
    border: "2px solid var(--color-olive)",
  };
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarInner />
    </Suspense>
  );
}
