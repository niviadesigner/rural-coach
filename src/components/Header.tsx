"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { loadState } from "@/lib/store";

export default function Header({ paso }: { paso?: number }) {
  const { user, salir, disponible } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    const s = loadState();
    setAvatar(s.avatarUrl);
    const meta = (user?.user_metadata?.name as string | undefined) ?? s.nombre ?? user?.email ?? null;
    setNombre(meta);
  }, [user]);

  const primerNombre = nombre ? nombre.split(/[ @]/)[0] : null;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid var(--border-default)",
        background: "rgba(240,235,224,0.85)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "inherit" }}>
        <img src="/logo-rural.jpg" alt="Rural Coach" width={40} height={40} style={{ borderRadius: "50%" }} />
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <b className="rc-display" style={{ fontSize: 20, color: "var(--color-charcoal-black)" }}>
            RURAL COACH
          </b>
          <span className="rc-eyebrow" style={{ fontSize: 10 }}>
            Entrenamiento gravel · Rural Cycle
          </span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {paso ? (
          <div className="rc-eyebrow" aria-label={`Paso ${paso} de 4`} style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                style={{
                  width: 22,
                  height: 6,
                  borderRadius: 999,
                  background: n <= paso ? "var(--color-teal)" : "var(--border-default)",
                }}
              />
            ))}
          </div>
        ) : null}

        {disponible &&
          (user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" title={user.email ?? ""} width={30} height={30} style={{ borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span
                  title={user.email ?? ""}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--color-olive)",
                    color: "var(--color-cream)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-label)",
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: "uppercase",
                  }}
                >
                  {(user.email ?? "?").slice(0, 1)}
                </span>
              )}
              {primerNombre && (
                <span className="rc-eyebrow" style={{ fontSize: 12, color: "var(--color-charcoal-black)", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {primerNombre}
                </span>
              )}
              <button className="rc-btn rc-btn--ghost" style={{ padding: "6px 8px", fontSize: 12 }} onClick={() => salir()}>
                Salir
              </button>
            </div>
          ) : (
            <Link className="rc-btn rc-btn--outline" href="/entrar" style={{ padding: "8px 14px", fontSize: 13 }}>
              Entrar
            </Link>
          ))}
      </div>
    </header>
  );
}
