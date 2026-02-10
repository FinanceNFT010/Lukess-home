import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Políticas de Envío - Lukess Home',
  description: 'Información sobre envíos y entregas de Lukess Home',
}

export default function PoliticasEnvioPage() {
  return (
    <LegalPageTemplate title="Políticas de Envío" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Cobertura de Envíos
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Realizamos envíos a toda la ciudad de Santa Cruz de la Sierra y zonas aledañas.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Santa Cruz capital:</strong> Envío gratis en compras mayores a Bs 300</li>
          <li><strong>Plan 3000, Warnes, La Guardia:</strong> Costo adicional de Bs 20-30</li>
          <li><strong>Otras ciudades:</strong> Consultar disponibilidad por WhatsApp</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tiempos de Entrega
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Dentro del 4to anillo:</strong> 24-48 horas</li>
          <li><strong>Fuera del 4to anillo:</strong> 2-3 días hábiles</li>
          <li><strong>Retiro en tienda:</strong> Inmediato (coordinar por WhatsApp)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Proceso de Envío
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>Realiza tu pedido por WhatsApp o en nuestro sitio web</li>
          <li>Confirma tu dirección de entrega</li>
          <li>Realiza el pago (efectivo, transferencia o QR)</li>
          <li>Envía comprobante de pago por WhatsApp</li>
          <li>Recibirás confirmación y tiempo estimado de entrega</li>
          <li>El repartidor te contactará 30 minutos antes de llegar</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Costos de Envío
        </h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Zona</th>
                <th className="text-right py-2">Costo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2">Dentro del 4to anillo</td>
                <td className="text-right py-2">Gratis (compras &gt; Bs 300)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2">Fuera del 4to anillo</td>
                <td className="text-right py-2">Bs 20-30</td>
              </tr>
              <tr>
                <td className="py-2">Plan 3000, Warnes</td>
                <td className="text-right py-2">Bs 30-40</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Contacto
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Para consultas sobre envíos, contáctanos por WhatsApp: 
          <a href="https://wa.me/59176020369" className="text-primary-600 font-semibold ml-1">
            +591 76020369
          </a>
        </p>
      </section>
    </LegalPageTemplate>
  )
}
