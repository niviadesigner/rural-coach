"use client";

// ============================================================
// Autenticación real con Supabase Auth (email/contraseña).
// Contexto de sesión para toda la app. Si Supabase no está
// configurado, expone un estado "no disponible" sin romper la app.
// ============================================================

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  cargando: boolean;
  disponible: boolean; // false si Supabase no está configurado
  registrar: (email: string, password: string, nombre?: string) => Promise<{ error?: string; necesitaConfirmar?: boolean }>;
  entrar: (email: string, password: string) => Promise<{ error?: string }>;
  salir: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCargando(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setCargando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const registrar = useCallback(
    async (email: string, password: string, nombre?: string) => {
      if (!supabase) return { error: "Autenticación no disponible." };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: nombre ? { name: nombre } : undefined },
      });
      if (error) return { error: traducir(error.message) };
      // Si no hay sesión inmediata, el proyecto exige confirmar el correo.
      return { necesitaConfirmar: !data.session };
    },
    [supabase]
  );

  const entrar = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "Autenticación no disponible." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: traducir(error.message) };
      return {};
    },
    [supabase]
  );

  const salir = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, session, cargando, disponible: Boolean(supabase), registrar, entrar, salir }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

function traducir(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ese correo ya está registrado. Inicia sesión.";
  if (m.includes("password") && m.includes("6")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("email") && m.includes("valid")) return "Ingresa un correo válido.";
  return msg;
}
