'use client'
import { useState } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'form' | 'qr' | 'success'

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, total, clearCart } = useCart()
  const [step, setStep] = useState<Step>('form')
  const [orderId, setOrderId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!customerData.name.trim() || !customerData.phone.trim()) {
      toast.error('Por favor completa nombre y teléfono')
      return
    }
    
    // Validar teléfono boliviano
    const phoneRegex = /^\d{7,8}$/
    if (!phoneRegex.test(customerData.phone.replace(/\s/g, ''))) {
      toast.error('Número de teléfono inválido (ej: 76020369)')
      return
    }
    
    setIsProcessing(true)
    
    try {
      const supabase = getSupabaseClient()
      
      // 1. Crear orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_email: customerData.email || null,
          subtotal: total,
          discount: 0,
          total: total,
          status: 'pending',
          payment_method: 'qr'
        })
        .select()
        .single()
      
      if (orderError) throw orderError
      
      // 2. Crear items de la orden
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        size: item.size || null,
        color: item.color || null,
        subtotal: item.product.price * item.quantity
      }))
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) throw itemsError
      
      setOrderId(order.id)
      setStep('qr')
      toast.success('Orden creada exitosamente')
      
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error('Error al crear la orden: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handlePaymentConfirmed = () => {
    setStep('success')
    
    // Crear mensaje de WhatsApp
    const whatsappMessage = encodeURIComponent(
      `Hola! Realicé un pedido #${orderId.slice(0, 8)}\n\n` +
      `📦 Total: Bs ${total.toFixed(2)}\n` +
      `🛍️ Items: ${cart.length}\n\n` +
      `Ya realicé el pago por QR. ¿Pueden confirmar?`
    )
    
    // Abrir WhatsApp en nueva pestaña
    window.open(`https://wa.me/59176020369?text=${whatsappMessage}`, '_blank')
    
    // Limpiar carrito después de 2 segundos
    setTimeout(() => {
      clearCart()
      onClose()
      setStep('form')
      setCustomerData({ name: '', phone: '', email: '' })
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-primary-600 text-white rounded-t-2xl">
                <h2 className="text-2xl font-bold">
                  {step === 'form' && 'Datos de Contacto'}
                  {step === 'qr' && 'Pagar con QR'}
                  {step === 'success' && '¡Listo!'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === 'form' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="76020369"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email (Opcional)
                      </label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="juan@example.com"
                      />
                    </div>
                    
                    <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-semibold">Total a Pagar:</span>
                        <span className="text-3xl font-bold text-primary-600">
                          Bs {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Procesando...' : 'Continuar al Pago'}
                    </button>
                  </form>
                )}
                
                {step === 'qr' && (
                  <div className="text-center space-y-6">
                    <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200">
                      <p className="text-sm text-gray-700 mb-2">Orden #</p>
                      <p className="text-lg font-mono font-bold text-primary-600">
                        {orderId.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-700 mb-4 font-semibold">
                        Escanea este QR con tu app de pagos
                      </p>
                      <div className="bg-white p-4 rounded-xl border-4 border-primary-200 inline-block">
                        <Image
                          src="/qr-yolo-pago.png"
                          alt="QR Yolo Pago"
                          width={280}
                          height={280}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-xl">
                      <p className="text-sm mb-2">Total a Pagar</p>
                      <p className="text-4xl font-bold">Bs {total.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          Una vez realizado el pago, presiona "Ya Pagué" y te contactaremos por WhatsApp para coordinar la entrega.
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handlePaymentConfirmed}
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transform hover:scale-105 transition-all shadow-lg"
                    >
                      ✓ Ya Pagué
                    </button>
                  </div>
                )}
                
                {step === 'success' && (
                  <div className="text-center space-y-6 py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                    >
                      <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
                    </motion.div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Orden Confirmada!
                      </h3>
                      <p className="text-gray-600">
                        Orden #{orderId.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                      <p className="text-green-800 font-semibold">
                        Te contactaremos pronto por WhatsApp
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Revisa tus mensajes para coordinar la entrega
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
