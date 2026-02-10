'use client'
import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    q: '¿Cuáles son los métodos de pago?',
    a: 'Aceptamos efectivo, transferencia bancaria, QR Yolo Pago y tarjetas de crédito/débito en tienda física.',
  },
  {
    q: '¿Hacen envíos a domicilio?',
    a: 'Sí, realizamos envíos a toda Santa Cruz capital y zonas aledañas. Envío gratis en compras mayores a Bs 300 dentro del 4to anillo.',
  },
  {
    q: '¿Puedo cambiar un producto?',
    a: 'Sí, tienes 30 días para cambios. El producto debe estar sin uso, con etiquetas y comprobante de compra.',
  },
  {
    q: '¿Cómo sé mi talla correcta?',
    a: 'Consulta nuestra Guía de Tallas o contáctanos por WhatsApp para asesoramiento personalizado.',
  },
  {
    q: '¿Los productos tienen garantía?',
    a: 'Sí, todos nuestros productos tienen garantía contra defectos de fábrica. Consulta condiciones específicas por producto.',
  },
  {
    q: '¿Puedo reservar un producto?',
    a: 'Sí, puedes reservar por WhatsApp con un adelanto del 50%. La reserva dura 48 horas.',
  },
  {
    q: '¿Tienen tienda en línea?',
    a: 'Sí, puedes ver nuestro catálogo completo en lukesshome.com y realizar pedidos por WhatsApp.',
  },
  {
    q: '¿Cuál es el horario de atención?',
    a: 'Lunes a Sábado: 8:00 AM - 10:00 PM | Domingo: 9:00 AM - 9:00 PM en nuestros 3 puestos del Mercado Mutualista.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:text-primary-600 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-gray-700 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PreguntasFrecuentesPage() {
  return (
    <LegalPageTemplate title="Preguntas Frecuentes" lastUpdated="10 de febrero de 2026">
      <div className="space-y-1">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>

      <section className="mt-12">
        <div className="bg-accent-50 border-2 border-accent-200 rounded-lg p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            ¿No encontraste tu respuesta?
          </h3>
          <p className="text-gray-700 mb-4">
            Contáctanos y te responderemos de inmediato.
          </p>
          <a
            href="https://wa.me/59176020369?text=Hola,%20tengo%20una%20pregunta"
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
