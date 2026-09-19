"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON: Record<string, React.ReactNode> = {
  inicio: (
    <path d="M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  plan: (
    <>
      <rect x="4" y="4" width="16" height="17" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v3M16 3v3M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  nutricion: (
    <>
      <path d="M7 8h10l-1 11a2 2 0 0 1-2 1.8H10A2 2 0 0 1 8 19L7 8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  cuenta: (
    <>
      <circle cx="12" cy="8.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
};

const ITEMS = [
  { href: "/", label: "Inicio", key: "inicio" },
  { href: "/plan", label: "Mi plan", key: "plan" },
  { href: "/nutricion", label: "Nutrición", key: "nutricion" },
  { href: "/entrar", label: "Cuenta", key: "cuenta" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="rc-bottomnav" aria-label="Navegación">
      {ITEMS.map((it) => {
        const activo = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={"rc-bottomnav__item" + (activo ? " is-active" : "")}>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
              {ICON[it.key]}
            </svg>
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
