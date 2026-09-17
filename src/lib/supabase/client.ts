// Cliente Supabase para el navegador (componentes cliente).
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("TU_PROYECTO")) {
    return null; // Modo mock / sin credenciales: la app funciona sin Supabase.
  }
  return createBrowserClient(url, key);
}

export const MOCK_MODE =
  process.env.NEXT_PUBLIC_MOCK_MODE === "true" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("TU_PROYECTO");
