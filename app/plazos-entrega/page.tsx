import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plazos de Entrega - Lukess Home',
}

export default function PlazosEntregaPage() {
  return (
    <LegalPageTemplate title="Plazos de Entrega" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2>Tiempos Estimados</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Zona</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Dentro del 4to anillo</td>
                <td className="border border-gray-300 px-4 py-2">24-48 horas</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Fuera del 4to anillo</td>
                <td className="border border-gray-300 px-4 py-2">2-3 días hábiles</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Plan 3000, Warnes</td>
                <td className="border border-gray-300 px-4 py-2">3-4 días hábiles</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Retiro en tienda</td>
                <td className="border border-gray-300 px-4 py-2">Inmediato</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2>Factores que Pueden Afectar la Entrega</h2>
        <ul>
          <li>🌧️ Condiciones climáticas adversas</li>
          <li>🚦 Tráfico en horas pico</li>
          <li>📍 Direcciones incompletas o incorrectas</li>
          <li>🎉 Temporadas de alta demanda (fiestas, fechas especiales)</li>
        </ul>
      </section>

      <section>
        <h2>Seguimiento de tu Pedido</h2>
        <p>
          Te mantendremos informado del estado de tu pedido por WhatsApp. El repartidor 
          te contactará 30 minutos antes de llegar a tu dirección.
        </p>
      </section>
    </LegalPageTemplate>
  )
}
