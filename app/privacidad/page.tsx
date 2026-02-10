import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad - Lukess Home',
}

export default function PrivacidadPage() {
  return (
    <LegalPageTemplate title="Política de Privacidad" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2>1. Información que Recopilamos</h2>
        <p>Recopilamos la siguiente información cuando realizas una compra o te registras:</p>
        <ul>
          <li>Nombre completo</li>
          <li>Número de teléfono (WhatsApp)</li>
          <li>Dirección de email (opcional)</li>
          <li>Dirección de entrega</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>2. Uso de la Información</h2>
        <p>Utilizamos tu información para:</p>
        <ul>
          <li>Procesar y entregar tus pedidos</li>
          <li>Contactarte sobre tu compra</li>
          <li>Enviarte ofertas y promociones (solo si te suscribiste)</li>
          <li>Mejorar nuestros servicios</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>3. Protección de Datos</h2>
        <p>
          Implementamos medidas de seguridad para proteger tu información personal. 
          No compartimos tus datos con terceros sin tu consentimiento, excepto cuando 
          sea necesario para procesar tu pedido (ej: servicio de delivery).
        </p>
      </section>

      <section className="mb-8">
        <h2>4. Cookies</h2>
        <p>
          Utilizamos cookies para mejorar tu experiencia de navegación. Puedes 
          deshabilitarlas en la configuración de tu navegador, aunque esto puede 
          afectar algunas funcionalidades del sitio.
        </p>
      </section>

      <section>
        <h2>5. Tus Derechos</h2>
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a tu información personal</li>
          <li>Solicitar corrección de datos incorrectos</li>
          <li>Solicitar eliminación de tus datos</li>
          <li>Desuscribirte del newsletter en cualquier momento</li>
        </ul>
        <p className="mt-4">
          Para ejercer estos derechos, contáctanos por WhatsApp: 
          <a href="https://wa.me/59176020369" className="text-primary-600 font-semibold ml-1">
            +591 76020369
          </a>
        </p>
      </section>
    </LegalPageTemplate>
  )
}
