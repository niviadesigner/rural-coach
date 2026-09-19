"use client";

import { useEffect, useState } from "react";

// Pantalla de ingreso (splash) estilo Strava: fondo amarillo Rural #e7c961
// con el logo circular al centro. Aparece al cargar la app y se desvanece.
export default function SplashScreen() {
  const [oculto, setOculto] = useState(false);
  const [quitar, setQuitar] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOculto(true), 1300);
    const t2 = setTimeout(() => setQuitar(true), 1850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (quitar) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#e7c961",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: oculto ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: oculto ? "none" : "auto",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-rural.jpg"
        alt="Rural Coach"
        width={150}
        height={150}
        style={{
          borderRadius: "50%",
          boxShadow: "0 10px 40px rgba(28,27,25,0.22)",
          animation: "rc-splash-pop 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </div>
  );
}
