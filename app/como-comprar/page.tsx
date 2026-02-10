import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cómo Comprar - Lukess Home',
}

export default function ComoComprarPage() {
  return (
    <LegalPageTemplate title="¿Cómo Comprar?" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2>Opción 1: Compra en Línea</h2>
        <ol className="space-y-4">
          <li>
            <strong>1. Navega el catálogo</strong>
            <p>Explora nuestros productos en la sección de catálogo. Usa los filtros para encontrar exactamente lo que buscas.</p>
          </li>
          <li>
            <strong>2. Agrega al carrito</strong>
            <p>Haz click en "Agregar al Carrito" y selecciona talla y color si aplica.</p>
          </li>
          <li>
            <strong>3. Revisa tu pedido</strong>
            <p>Click en el ícono del carrito para ver tu pedido completo.</p>
          </li>
          <li>
            <strong>4. Procede al pago</strong>
            <p>Completa tus datos de contacto y dirección de entrega.</p>
          </li>
          <li>
            <strong>5. Realiza el pago</strong>
            <p>Escanea el QR de Yolo Pago o realiza transferencia bancaria.</p>
          </li>
          <li>
            <strong>6. Confirma por WhatsApp</strong>
            <p>Envía el comprobante de pago y recibirás confirmación de tu pedido.</p>
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2>Opción 2: Compra por WhatsApp</h2>
        <ol className="space-y-4">
          <li>
            <strong>1. Contáctanos</strong>
            <p>Envía un mensaje a <a href="https://wa.me/59176020369" className="text-primary-600 font-semibold">+591 76020369</a></p>
          </li>
          <li>
            <strong>2. Indica el producto</strong>
            <p>Dinos qué producto te interesa (puedes enviar foto o nombre)</p>
          </li>
          <li>
            <strong>3. Confirma detalles</strong>
            <p>Talla, color, cantidad y dirección de entrega</p>
          </li>
          <li>
            <strong>4. Recibe el total</strong>
            <p>Te enviaremos el monto total incluyendo envío</p>
          </li>
          <li>
            <strong>5. Realiza el pago</strong>
            <p>Por QR, transferencia o efectivo contra entrega</p>
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2>Opción 3: Compra en Tienda</h2>
        <p>Visita cualquiera de nuestros 3 puestos en el Mercado Mutualista:</p>
        <ul className="mt-4 space-y-2">
          <li>📍 Pasillo -2, Caseta 47-48</li>
          <li>📍 Pasillo -3, Caseta 123</li>
          <li>📍 Pasillo -5, Caseta 228-229</li>
        </ul>
        <p className="mt-4">
          <strong>Horarios:</strong> Lun-Sáb 8:00 AM - 10:00 PM | Dom 9:00 AM - 9:00 PM
        </p>
      </section>

      <section>
        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            ¿Tienes dudas?
          </h3>
          <p className="text-gray-700 mb-4">
            Nuestro equipo está listo para ayudarte en cada paso del proceso de compra.
          </p>
          <a
            href="https://wa.me/59176020369?text=Hola,%20tengo%20dudas%20sobre%20cómo%20comprar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-whatsapp text-white px-6 py-3 rounded-lg font-semibold hover:bg-whatsapp-dark transition-colors"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </section>
    </LegalPageTemplate>
  )
}
