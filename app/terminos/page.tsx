import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones - Lukess Home',
  description: 'Términos y condiciones de uso de Lukess Home',
}

export default function TerminosPage() {
  return (
    <LegalPageTemplate title="Términos y Condiciones" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          1. Aceptación de los Términos
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Al acceder y utilizar lukesshome.com, usted acepta estar sujeto a estos 
          términos y condiciones de uso, todas las leyes y regulaciones aplicables, 
          y acepta que es responsable del cumplimiento de las leyes locales aplicables.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          2. Uso del Sitio
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Este sitio web está destinado únicamente para uso personal y no comercial. 
          Usted no puede:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Modificar o copiar los materiales</li>
          <li>Usar los materiales para fines comerciales sin autorización</li>
          <li>Intentar descompilar o realizar ingeniería inversa del software</li>
          <li>Eliminar notificaciones de derechos de autor o marcas registradas</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          3. Productos y Precios
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Todos los productos están sujetos a disponibilidad en nuestros 3 puestos del 
          Mercado Mutualista. Los precios pueden cambiar sin previo aviso. Nos reservamos 
          el derecho de limitar las cantidades de compra por persona o pedido. Las imágenes 
          son referenciales y pueden variar del producto real.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          4. Proceso de Compra
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Al realizar un pedido a través de WhatsApp o en tienda, usted garantiza que toda 
          la información proporcionada es verdadera y precisa. Lukess Home se reserva el 
          derecho de rechazar cualquier pedido por cualquier motivo, incluyendo pero no 
          limitado a: disponibilidad de producto, errores en precios, o información 
          incompleta del cliente.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          5. Métodos de Pago
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Aceptamos los siguientes métodos de pago:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Efectivo (Bolivianos)</li>
          <li>Transferencia bancaria</li>
          <li>QR Yolo Pago</li>
          <li>Tarjetas de crédito/débito (en tienda física)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          6. Limitaciones de Responsabilidad
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Lukess Home no será responsable de ningún daño directo, indirecto, incidental, 
          especial o consecuente que surja del uso o la incapacidad de usar nuestros 
          servicios, incluso si hemos sido notificados de la posibilidad de dichos daños.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          7. Modificaciones
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Lukess Home se reserva el derecho de revisar estos términos en cualquier momento 
          sin previo aviso. Al continuar utilizando este sitio web después de que se 
          publiquen cambios, usted acepta estar sujeto a la versión revisada.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          8. Contacto
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Para cualquier consulta sobre estos términos, contáctenos:
        </p>
        <div className="space-y-2 text-gray-700">
          <p>📧 Email: info@lukesshome.com</p>
          <p>📱 WhatsApp: +591 76020369</p>
          <p>📍 Mercado Mutualista, Santa Cruz, Bolivia</p>
        </div>
      </section>
    </LegalPageTemplate>
  )
}
