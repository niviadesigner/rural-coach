# RURAL COACH

App web de entrenamiento **dinámico y por objetivo** para gravel — la evolución del plan estático de [ruralcycle.cc/entrenamiento](https://ruralcycle.cc/entrenamiento/). Se sirve embebida en `app.ruralcycle.cc`.

> **Principio rector: usabilidad ante todo.** Máximo 4 toques para ver tu plan. Cero jerga técnica en el flujo. Si algo se puede autocompletar desde Strava, no se pregunta.

## Stack

- **Next.js 15 + React 19 + Tailwind v4** (mobile-first, PWA instalable)
- **Supabase** (Postgres + Auth + RLS + Storage) — esquema en `supabase/schema.sql`
- **Auth**: OAuth con Strava (1 clic) + email/contraseña de respaldo
- **Pagos**: Wompi (COP, suscripción + pago único + códigos de descuento)
- **Strava**: OAuth 2.0, refresh cada 6h, sincronización por **webhooks**
- **Exportación**: `.ZWO` (Zwift), `.ERG`, **PDF semanal** — `.FIT` preparado para Fase 1.5

## Arranque rápido

```bash
npm install
cp .env.example .env.local   # pega tus llaves (o déjalo en modo mock)
npm run dev                  # http://localhost:3000
```

Sin credenciales, la app corre en **modo mock** (`NEXT_PUBLIC_MOCK_MODE=true`): el flujo
completo de 4 toques funciona end-to-end, Strava se simula con una salida de ejemplo y el
pago Wompi se simula para desbloquear el plan.

## Flujo de usuario (4 toques)

1. **Escoge tu evento** — catálogo Rural Cycle (incluye *Pantano Martus*) o "otra carrera".
2. **Conéctate con Strava** (1 botón) — o continúa sin Strava (3 preguntas).
3. **Confirma tus días** disponibles, nivel y horas.
4. **Ve tu plan al instante** — primera semana **gratis y real** (descargable). El resto se
   desbloquea pagando con Wompi.

## Motor de planes

`src/lib/plan-engine.ts` — periodización automática (base → construcción → específico →
tapering, última semana siempre taper), sesiones según días/horas, objetivos en %FTP (zonas
Coggan) + %FC umbral, más técnica gravel cuando el evento tiene alto %gravel, y TSS por sesión.
Recalibración de FTP tras cada salida en `src/lib/zones.ts` (`recalibrarFtp`).

## Configurar las integraciones reales

### Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pega `supabase/schema.sql` y luego `supabase/seed.sql`.
3. Copia `Project URL` y `anon key` a `.env.local`. `service_role` solo para backend.

### Strava
1. [strava.com/settings/api](https://www.strava.com/settings/api) → copia **Client ID** y
   **Client Secret** (el número de tu perfil `7026608` es tu *athlete ID*, no el Client ID).
2. Authorization Callback Domain: `localhost` (dev) / `app.ruralcycle.cc` (prod).
3. Da de alta el webhook (una vez):
   ```bash
   curl -X POST https://www.strava.com/api/v3/push_subscriptions \
     -F client_id=TU_CLIENT_ID -F client_secret=TU_CLIENT_SECRET \
     -F callback_url=https://app.ruralcycle.cc/api/strava/webhook \
     -F verify_token=rural-coach-verify-2026
   ```
4. Arranca en modo desarrollo (1 atleta autorizado: `7026608`) y escala tras aprobación.

### Wompi
1. [comercios.wompi.co](https://comercios.wompi.co) → Desarrolladores → llaves **sandbox**.
2. Pega `public key`, `private key`, `events secret` e `integrity secret` en `.env.local`.
3. Configura el webhook a `https://app.ruralcycle.cc/api/wompi/webhook`.

## Identidad visual (ADN Rural Cycle)

Heredada de la web live: mostaza `#D4A62E`, oliva `#4A5A3A`, terracota `#B5652D`, carbón
`#1C1B19`/`#2B241C`, crema `#F0EBE0`; tipografía condensada (Anton + Barlow Condensed +
Barlow) y textura topográfica de La Sabana. Tokens en `src/app/globals.css`.

## Estructura

```
src/
  app/            páginas (/ , /onboarding , /plan) + rutas API
    api/          plan · strava/{callback,webhook} · wompi/{checkout,webhook} · export/[format]
  lib/            plan-engine · zones · strava · wompi · pricing · export/{zwo,erg,pdf,fit} · store
  components/     Header
  types/          modelos de dominio
supabase/         schema.sql (RLS) + seed.sql
```

## Fase 2 (preparada, no construida)

Sensores en vivo (Web Bluetooth HR+potencia, Android/desktop), gráfico de forma física
CTL/ATL/TSB (`metrics_snapshots`), comunidad/rodadas, app nativa, exportación `.FIT`.

---

Rural Cycle — Creamos experiencias sobre la bici por caminos poco transitados. Sabana de Bogotá.
