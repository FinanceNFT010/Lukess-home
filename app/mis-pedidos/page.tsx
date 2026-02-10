import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis Pedidos - Lukess Home',
}

export default function MisPedidosPage() {
  return (
    <LegalPageTemplate title="Mis Pedidos" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2>Seguimiento de Pedidos</h2>
        <p>
          Para consultar el estado de tu pedido, contáctanos por WhatsApp con tu número 
          de orden. Te proporcionaremos información actualizada sobre:
        </p>
        <ul className="mt-4 space-y-2">
          <li>✅ Estado del pedido (preparando, en camino, entregado)</li>
          <li>✅ Tiempo estimado de entrega</li>
          <li>✅ Información del repartidor</li>
        </ul>
      </section>

      <section>
        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-2">Consulta tu Pedido</h3>
          <p className="mb-4">Contáctanos por WhatsApp con tu número de orden.</p>
          <a
            href="https://wa.me/59176020369?text=Hola,%20quiero%20consultar%20mi%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-whatsapp text-white px-6 py-3 rounded-lg font-semibold hover:bg-whatsapp-dark transition-colors"
          >
            Consultar Pedido
          </a>
        </div>
      </section>
    </LegalPageTemplate>
  )
}
