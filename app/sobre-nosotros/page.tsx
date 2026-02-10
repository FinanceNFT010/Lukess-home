import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Nosotros - Lukess Home',
}

export default function SobreNosotrosPage() {
  return (
    <LegalPageTemplate title="Sobre Nosotros" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2>Nuestra Historia</h2>
        <p>
          Lukess Home nació en 2014 con una visión clara: vestir al hombre boliviano con 
          calidad, estilo y precios justos. Desde nuestro primer puesto en el Mercado 
          Mutualista, hemos crecido hasta convertirnos en una referencia de moda masculina 
          en Santa Cruz de la Sierra.
        </p>
      </section>

      <section className="mb-8">
        <h2>Más de 10 Años de Experiencia</h2>
        <p>
          Con más de una década en el mercado, hemos vestido a miles de bolivianos para 
          toda ocasión: desde el día a día hasta eventos especiales. Nuestra experiencia 
          nos permite ofrecer asesoramiento personalizado y productos de calidad comprobada.
        </p>
      </section>

      <section className="mb-8">
        <h2>Nuestros 3 Puestos</h2>
        <div className="grid md:grid-cols-3 gap-6 my-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Puesto 1</h3>
            <p className="text-sm text-gray-600">Pasillo -2, Caseta 47-48</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Puesto 2</h3>
            <p className="text-sm text-gray-600">Pasillo -3, Caseta 123</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Puesto 3</h3>
            <p className="text-sm text-gray-600">Pasillo -5, Caseta 228-229</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2>Nuestra Misión</h2>
        <p>
          Ofrecer ropa masculina de calidad a precios accesibles, con atención personalizada 
          y un servicio que supere las expectativas de nuestros clientes. Queremos que cada 
          hombre se sienta seguro y bien vestido.
        </p>
      </section>

      <section>
        <h2>¿Por Qué Elegirnos?</h2>
        <ul>
          <li>✅ <strong>Más de 10 años</strong> de experiencia en el mercado</li>
          <li>✅ <strong>3 puestos</strong> para tu comodidad</li>
          <li>✅ <strong>Variedad</strong> de marcas y estilos</li>
          <li>✅ <strong>Precios justos</strong> y competitivos</li>
          <li>✅ <strong>Atención personalizada</strong> y asesoramiento</li>
          <li>✅ <strong>Calidad garantizada</strong> en todos nuestros productos</li>
        </ul>
      </section>
    </LegalPageTemplate>
  )
}
