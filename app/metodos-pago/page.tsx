import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Métodos de Pago - Lukess Home',
}

export default function MetodosPagoPage() {
  return (
    <LegalPageTemplate title="Métodos de Pago" lastUpdated="10 de febrero de 2026">
      <p className="mb-6">Aceptamos múltiples formas de pago para tu comodidad:</p>

      <section className="mb-8">
        <h2>💵 Efectivo</h2>
        <p>Pago en bolivianos directamente en nuestros puestos o contra entrega.</p>
      </section>

      <section className="mb-8">
        <h2>📱 QR Yolo Pago</h2>
        <p>Escanea nuestro código QR y paga desde tu banco favorito de forma instantánea.</p>
      </section>

      <section className="mb-8">
        <h2>🏦 Transferencia Bancaria</h2>
        <p>Solicita nuestros datos bancarios por WhatsApp. Envía el comprobante para confirmar tu pedido.</p>
      </section>

      <section className="mb-8">
        <h2>💳 Tarjetas de Crédito/Débito</h2>
        <p>Disponible en nuestros puestos físicos. Aceptamos Visa, Mastercard y tarjetas locales.</p>
      </section>

      <section>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-2">✅ Pago Seguro Garantizado</h3>
          <p>Todos nuestros métodos de pago son seguros y verificados.</p>
        </div>
      </section>
    </LegalPageTemplate>
  )
}
