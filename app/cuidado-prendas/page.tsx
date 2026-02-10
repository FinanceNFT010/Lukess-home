import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cuidado de Prendas - Lukess Home',
}

export default function CuidadoPrendasPage() {
  return (
    <LegalPageTemplate title="Cuidado de Prendas" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2>Camisas y Polos</h2>
        <ul>
          <li>🧺 Lavar a máquina en ciclo delicado (30°C máximo)</li>
          <li>🚫 No usar blanqueador</li>
          <li>👕 Colgar para secar (evitar secadora)</li>
          <li>🔥 Planchar a temperatura media</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>Pantalones y Jeans</h2>
        <ul>
          <li>🧺 Lavar del revés para preservar el color</li>
          <li>❄️ Agua fría o tibia (máximo 40°C)</li>
          <li>🚫 Evitar secadora para mantener la forma</li>
          <li>👖 Primer lavado después de 5-6 usos (jeans)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>Chaquetas y Blazers</h2>
        <ul>
          <li>🏪 Limpieza en seco recomendada</li>
          <li>🧥 Colgar en percha con forma</li>
          <li>💨 Airear después de cada uso</li>
          <li>🔥 Planchar con paño protector</li>
        </ul>
      </section>

      <section>
        <h2>Consejos Generales</h2>
        <ul>
          <li>📋 Siempre revisa la etiqueta de cuidado del producto</li>
          <li>🎨 Lava colores oscuros separados de claros</li>
          <li>🧴 Usa detergente suave para prendas delicadas</li>
          <li>☀️ Evita secar al sol directo para prevenir decoloración</li>
        </ul>
      </section>
    </LegalPageTemplate>
  )
}
