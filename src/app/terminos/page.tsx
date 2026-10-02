import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Términos y reglamento · Rural Coach",
  description: "Condiciones de uso, exoneración de responsabilidad, pagos y devoluciones de Rural Coach.",
};

const h2 = { fontSize: 22, margin: "30px 0 10px" } as const;
const p = { margin: "0 0 12px", lineHeight: 1.65 } as const;
const ul = { margin: "0 0 12px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, lineHeight: 1.6 } as const;

export default function TerminosPage() {
  return (
    <>
      <Header />
      <section className="topo-light" style={{ padding: "36px 0 64px" }}>
        <article className="rc-container" style={{ maxWidth: 760, fontSize: 15 }}>
          <span className="rc-eyebrow">Legal</span>
          <h1 className="rc-display" style={{ fontSize: "clamp(30px,5vw,44px)", margin: "8px 0 6px" }}>Términos y reglamento</h1>
          <p style={{ ...p, color: "var(--color-text-muted)", fontSize: 13 }}>Última actualización: octubre de 2026</p>

          <p style={p}>
            Al crear una cuenta o pagar un plan en Rural Coach aceptas estas condiciones y nuestra{" "}
            <Link href="/privacidad">política de privacidad</Link>. Léelas con calma: son cortas.
          </p>

          <h2 className="rc-display" style={h2}>1. Qué es Rural Coach</h2>
          <p style={p}>
            Rural Coach genera planes de entrenamiento de ciclismo (gravel y ruta) según tu evento objetivo, tu nivel y tus datos.
            Es una herramienta de orientación deportiva: <b>no es un servicio médico</b> ni reemplaza el consejo de un profesional de la salud.
          </p>

          <h2 className="rc-display" style={h2}>2. Tu cuenta</h2>
          <p style={p}>
            Eres responsable de la información que ingresas y de cuidar tu contraseña. Debes ser mayor de 18 años o contar con autorización
            de tu representante legal. Puedes pedir la eliminación de tu cuenta en cualquier momento.
          </p>

          <h2 className="rc-display" style={h2}>3. Participación voluntaria y exoneración de responsabilidad</h2>
          <p style={p}>
            Al usar Rural Coach declaras que entrenas y participas en eventos de forma voluntaria, bajo tu propio riesgo, y que cuentas con la
            condición física adecuada. Te recomendamos consultar a tu médico antes de iniciar o aumentar tu carga de entrenamiento, y detenerte
            ante cualquier síntoma de alarma.
          </p>
          <p style={p}>
            Rural Cycle, sus organizadores, patrocinadores y staff no serán responsables por lesiones, daños o pérdidas derivadas de seguir un plan
            o de participar en un evento, salvo negligencia comprobada. Es tu responsabilidad contar con un seguro médico vigente y declarar cualquier
            condición de salud relevante. Los entrenamientos y módulos (incluidos los de nutrición y adaptación al calor) son orientativos.
          </p>

          <h2 className="rc-display" style={h2}>4. Planes, prueba gratis y pagos</h2>
          <ul style={ul}>
            <li>La <b>primera semana de tu plan es gratis</b> y no requiere tarjeta.</li>
            <li>El plan completo se paga <b>una sola vez</b> y cubre las semanas hasta tu evento. El precio depende de cuántas semanas faltan, e incluye el descuento de evento si tienes un código válido.</li>
            <li>Los precios se muestran en pesos colombianos (COP) antes de pagar.</li>
            <li>Los pagos se procesan por <b>Wompi</b>. Rural Coach no almacena los datos de tu tarjeta.</li>
          </ul>

          <h2 className="rc-display" style={h2}>5. Política de devolución</h2>
          <p style={p}>
            Los pagos realizados por la inscripción a una carrera o por el plan de entrenamiento no son reembolsables una vez procesados.
            El cupo de una carrera puede transferirse a otra persona hasta 5 días antes del evento, notificando por escrito a Rural Cycle.
            Lo anterior se entiende sin perjuicio de los derechos que la ley colombiana reconoce al consumidor.
          </p>

          <h2 className="rc-display" style={h2}>6. Strava y servicios de terceros</h2>
          <p style={p}>
            Conectar Strava es opcional. Strava es una marca de Strava, Inc.; Rural Coach no está afiliado ni respaldado por Strava.
            Al conectarte autorizas el uso de tus datos como se explica en la política de privacidad, y puedes retirar el acceso cuando quieras.
            La metodología se inspira en principios de entrenamiento de élite y no implica afiliación con Kristof De Kegel ni con Alpecin-Premier Tech.
          </p>

          <h2 className="rc-display" style={h2}>7. Reglamento de los eventos Rural</h2>
          <p style={p}>
            Cuando te inscribes a una carrera de Rural Cycle (por ejemplo, Rural Gravel), aplican además el reglamento y las condiciones de cada
            evento: uso obligatorio de casco, respeto de las normas de tránsito y de las indicaciones del staff y las autoridades. El incumplimiento
            puede resultar en descalificación.
          </p>

          <h2 className="rc-display" style={h2}>8. Datos personales</h2>
          <p style={p}>
            Tratamos tus datos conforme a la Ley 1581 de 2012, como se detalla en la <Link href="/privacidad">política de privacidad</Link>.
            Puedes consultar, actualizar o eliminar tus datos escribiendo a <a href="mailto:info@ruralcycle.cc">info@ruralcycle.cc</a>.
          </p>

          <h2 className="rc-display" style={h2}>9. Cambios y contacto</h2>
          <p style={p}>
            Podemos actualizar estas condiciones; la fecha de arriba indica la última versión. Dudas: <a href="mailto:info@ruralcycle.cc">info@ruralcycle.cc</a> ·
            WhatsApp +57 319 654 6050 · Sopó, Cundinamarca, Colombia.
          </p>
        </article>
      </section>
    </>
  );
}
