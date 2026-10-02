import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Política de privacidad · Rural Coach",
  description: "Cómo Rural Coach trata tus datos personales, incluidos los de Strava, conforme a la Ley 1581 de 2012.",
};

const h2 = { fontSize: 22, margin: "30px 0 10px" } as const;
const p = { margin: "0 0 12px", lineHeight: 1.65 } as const;
const ul = { margin: "0 0 12px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, lineHeight: 1.6 } as const;

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <section className="topo-light" style={{ padding: "36px 0 64px" }}>
        <article className="rc-container" style={{ maxWidth: 760, fontSize: 15 }}>
          <span className="rc-eyebrow">Legal</span>
          <h1 className="rc-display" style={{ fontSize: "clamp(30px,5vw,44px)", margin: "8px 0 6px" }}>Política de privacidad</h1>
          <p style={{ ...p, color: "var(--color-text-muted)", fontSize: 13 }}>Última actualización: octubre de 2026</p>

          <p style={p}>
            En Rural Coach (una experiencia de Rural Cycle) tratamos tus datos con cuidado y solo para entrenarte mejor.
            Esta política explica qué datos recogemos, para qué los usamos, con quién los compartimos y cómo ejercer tus derechos,
            conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.
          </p>

          <h2 className="rc-display" style={h2}>1. Responsable del tratamiento</h2>
          <p style={p}>
            Rural Cycle · Sopó, Cundinamarca, Colombia · <a href="mailto:info@ruralcycle.cc">info@ruralcycle.cc</a> · +57 319 654 6050.
          </p>

          <h2 className="rc-display" style={h2}>2. Datos que recogemos</h2>
          <ul style={ul}>
            <li><b>Cuenta:</b> nombre, correo electrónico y contraseña (la contraseña se guarda cifrada).</li>
            <li><b>Perfil de entrenamiento:</b> peso, nivel, días y horas disponibles, FTP, frecuencia cardíaca, kilómetros típicos por salida y el evento que eliges como objetivo.</li>
            <li><b>Tu plan:</b> las sesiones generadas y tu avance.</li>
            <li><b>Pagos:</b> referencia, monto y estado de la transacción. <b>No almacenamos datos de tarjetas</b>: el pago lo procesa Wompi.</li>
            <li>
              <b>Datos de Strava</b> (solo si decides conectarte): nombre, foto de perfil, peso y FTP (si tu cuenta es Premium) y, de tus
              actividades, la fecha, distancia, desnivel, duración, potencia y frecuencia cardíaca.
            </li>
          </ul>
          <p style={p}>
            <b>Datos sensibles.</b> El peso y la frecuencia cardíaca se relacionan con tu salud y son datos sensibles. Son opcionales:
            no estás obligado a suministrarlos, y los usamos únicamente para calcular tus zonas de entrenamiento y tu plan, con tu autorización expresa.
          </p>

          <h2 className="rc-display" style={h2}>3. Para qué los usamos</h2>
          <ul style={ul}>
            <li>Calibrar tu FTP y tus zonas, y generar y ajustar tu plan de entrenamiento.</li>
            <li>Mostrar tu perfil y tu progreso dentro de la app.</li>
            <li>Gestionar tu cuenta, tus pagos y darte soporte.</li>
            <li>Mejorar el servicio con datos agregados que no te identifican.</li>
          </ul>
          <p style={p}>No vendemos tus datos ni los usamos para publicidad de terceros.</p>

          <h2 className="rc-display" style={h2}>4. Datos de Strava</h2>
          <ul style={ul}>
            <li>Accedemos a tu información de Strava <b>solo con tu autorización</b>, que das al conectar tu cuenta. Los permisos que solicitamos son de lectura (perfil y actividades).</li>
            <li><b>No publicamos ni modificamos nada</b> en tu cuenta de Strava.</li>
            <li>Usamos esos datos únicamente para tu plan y tu perfil. No los vendemos, ni los compartimos con terceros distintos de nuestros proveedores, ni los mostramos a otros usuarios.</li>
            <li>Puedes retirar el acceso en cualquier momento desde <a href="https://www.strava.com/settings/apps" target="_blank" rel="noopener">strava.com/settings/apps</a>. Al hacerlo, dejamos de recibir tus datos y, si lo solicitas, eliminamos los que ya teníamos.</li>
          </ul>

          <h2 className="rc-display" style={h2}>5. Con quién los compartimos</h2>
          <p style={p}>Solo con proveedores que nos ayudan a operar el servicio y que tratan los datos por nuestra cuenta:</p>
          <ul style={ul}>
            <li><b>Supabase</b> — base de datos y autenticación.</li>
            <li><b>Vercel</b> — alojamiento de la aplicación.</li>
            <li><b>Wompi</b> — procesamiento de pagos.</li>
            <li><b>Strava</b> — origen de los datos que decides conectar.</li>
          </ul>
          <p style={p}>Algunos de estos proveedores pueden almacenar datos en servidores fuera de Colombia. También podemos revelar información cuando una autoridad competente lo exija.</p>

          <h2 className="rc-display" style={h2}>6. Cuánto tiempo los conservamos</h2>
          <p style={p}>
            Mientras tu cuenta esté activa y el tiempo necesario para cumplir obligaciones legales o contables. Cuando pidas eliminar tu cuenta,
            borramos tus datos personales, salvo los que debamos conservar por ley.
          </p>

          <h2 className="rc-display" style={h2}>7. Tus derechos (habeas data)</h2>
          <p style={p}>Como titular puedes, en cualquier momento:</p>
          <ul style={ul}>
            <li>Conocer, actualizar y rectificar tus datos.</li>
            <li>Solicitar prueba de la autorización que nos diste.</li>
            <li>Ser informado del uso que damos a tus datos.</li>
            <li>Revocar la autorización y solicitar la supresión de tus datos.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
          </ul>
          <p style={p}>
            Para ejercerlos escribe a <a href="mailto:info@ruralcycle.cc">info@ruralcycle.cc</a> o por WhatsApp al +57 319 654 6050. Respondemos en los plazos que fija la ley.
          </p>

          <h2 className="rc-display" style={h2}>8. Seguridad</h2>
          <p style={p}>
            Aplicamos medidas técnicas y organizativas razonables: conexión cifrada (HTTPS), contraseñas cifradas, acceso a los datos restringido por usuario
            y claves de servicio protegidas. Ningún sistema es infalible, por lo que te pedimos cuidar tu contraseña.
          </p>

          <h2 className="rc-display" style={h2}>9. Menores de edad</h2>
          <p style={p}>La app está pensada para mayores de 18 años. Si eres menor, usa el servicio solo con autorización de tu madre, padre o representante legal.</p>

          <h2 className="rc-display" style={h2}>10. Cambios a esta política</h2>
          <p style={p}>Si la actualizamos de forma importante, lo avisaremos en la app. La fecha de arriba indica la última versión.</p>
        </article>
      </section>
    </>
  );
}
