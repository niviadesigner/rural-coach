// ============================================================
// Wompi — pagos en COP.
// - Firma de integridad para el Web Checkout.
// - Verificación de la firma de eventos (webhook de Wompi).
// Docs: https://docs.wompi.co
// ============================================================

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface CheckoutParams {
  referencia: string;
  montoCentavos: number; // Wompi cobra en centavos de COP
  moneda?: "COP";
}

/**
 * Firma de integridad exigida por el Web Checkout de Wompi:
 * SHA256(referencia + monto + moneda + integritySecret)
 */
export async function firmaIntegridad(p: CheckoutParams): Promise<string> {
  const secret = process.env.WOMPI_INTEGRITY_SECRET ?? "";
  const moneda = p.moneda ?? "COP";
  return sha256Hex(`${p.referencia}${p.montoCentavos}${moneda}${secret}`);
}

/** Config pública para lanzar el widget/checkout desde el cliente. */
export interface CheckoutConfig {
  publicKey: string;
  currency: "COP";
  amountInCents: number;
  reference: string;
  signatureIntegrity: string;
  redirectUrl: string;
}

export async function construirCheckout(
  referencia: string,
  montoCop: number,
  redirectUrl: string
): Promise<CheckoutConfig> {
  const montoCentavos = Math.round(montoCop * 100);
  const firma = await firmaIntegridad({ referencia, montoCentavos });
  return {
    publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "",
    currency: "COP",
    amountInCents: montoCentavos,
    reference: referencia,
    signatureIntegrity: firma,
    redirectUrl,
  };
}

/**
 * Verifica la firma de un evento entrante de Wompi.
 * Wompi firma: SHA256(concat(valores de properties) + timestamp + eventsSecret)
 */
export async function verificarEvento(
  properties: string[],
  data: Record<string, unknown>,
  timestamp: number,
  firmaRecibida: string
): Promise<boolean> {
  const secret = process.env.WOMPI_EVENTS_SECRET ?? "";
  let concat = "";
  for (const path of properties) {
    concat += String(getPath(data, path) ?? "");
  }
  const calculada = await sha256Hex(`${concat}${timestamp}${secret}`);
  return calculada === firmaRecibida;
}

function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function referenciaPago(userId: string, planTipo: string): string {
  return `RC-${planTipo}-${userId.slice(0, 8)}-${Date.now()}`;
}
