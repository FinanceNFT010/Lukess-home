'use client'
import { useState, useEffect } from 'react'
import { X, Mail, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Mostrar después de 10 segundos, solo si no se ha mostrado antes
    const hasSeenPopup = localStorage.getItem('newsletter-popup-seen')
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setIsOpen(true), 10000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('newsletter-popup-seen', 'true')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Aquí conectarías con tu servicio de email (ej: Mailchimp, Supabase)
    // Por ahora solo guardamos en localStorage
    localStorage.setItem('newsletter-email', email)
    
    toast.success('¡Suscripción exitosa! Revisa tu email.')
    handleClose()
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative pointer-events-auto">
              {/* Botón cerrar */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Contenido */}
              <div className="text-center space-y-6">
                <div className="inline-flex p-4 bg-accent-100 rounded-full">
                  <Gift className="w-12 h-12 text-accent-600" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    10% OFF en tu primera compra
                  </h3>
                  <p className="text-gray-600">
                    Suscríbete a nuestro newsletter y recibe ofertas exclusivas
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-800 text-white py-3 rounded-lg font-bold hover:bg-primary-900 transition-colors shadow-lg"
                  >
                    Obtener mi descuento
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    No gracias, prefiero pagar precio completo
                  </button>
                </form>

                <p className="text-xs text-gray-500">
                  Podrás desuscribirte en cualquier momento
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
