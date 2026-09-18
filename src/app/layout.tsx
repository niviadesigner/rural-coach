import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Rural Coach — Entrenamiento gravel personalizado · Rural Cycle",
  description:
    "Tu plan de entrenamiento de gravel dinámico y por objetivo. Escoge tu evento, conéctate con Strava y recibe tu plan al instante. La mejor plataforma de gravel de Colombia y LATAM.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://ruralcycle.cc/imagenes/logo-oscuro.webp",
  },
  openGraph: {
    title: "Rural Coach — Entrenamiento gravel personalizado",
    description: "Escoge tu evento, conéctate con Strava y recibe tu plan de gravel al instante.",
    url: "https://app.ruralcycle.cc",
    siteName: "Rural Coach",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1b19",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
