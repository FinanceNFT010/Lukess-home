'use client'
import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, ShoppingBag, CreditCard, PartyPopper, Sparkles, User } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Confetti, SparkleEffect } from '@/components/ui/Confetti'
import { AuthModal } from '@/components/auth/AuthModal'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'form' | 'qr' | 'success'

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, total, clearCart } = useCart()
  const { user, isLoggedIn, customerName } = useAuth()
  const [step, setStep] = useState<Step>('form')
  const [orderId, setOrderId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
  })
  const [marketingConsent, setMarketingConsent] = useState(true)
  const [emailError, setEmailError] = useState('')

  // Pre-fill from auth user
  useEffect(() => {
    if (isLoggedIn && user) {
      setCustomerData((prev) => ({
        name: prev.name || customerName || '',
        phone: prev.phone || user.user_metadata?.phone || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [isLoggedIn, user, customerName])

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('form')
        setShowConfetti(false)
        setEmailError('')
      }, 300)
    }
  }, [isOpen])

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'El email es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerData.name.trim() || !customerData.phone.trim()) {
      toast.error('Por favor completa nombre y teléfono', { position: 'bottom-center' })
      return
    }

    const phoneRegex = /^\d{7,8}$/
    if (!phoneRegex.test(customerData.phone.replace(/\s/g, ''))) {
      toast.error('Número de teléfono inválido (ej: 76020369)', { position: 'bottom-center' })
      return
    }

    const emailValidation = validateEmail(customerData.email)
    if (emailValidation) {
      setEmailError(emailValidation)
      return
    }
    setEmailError('')

    setIsProcessing(true)

    try {
      const supabase = createClient()

      // 1. Upsert customer record
      const { data: customer } = await supabase
        .from('customers')
        .upsert(
          {
            email: customerData.email,
            name: customerData.name,
            phone: customerData.phone,
            marketing_consent: marketingConsent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email', ignoreDuplicates: false }
        )
        .select('id')
        .single()

      // 2. If marketing consent, upsert subscriber
      if (marketingConsent) {
        await supabase
          .from('subscribers')
          .upsert(
            {
              email: customerData.email,
              name: customerData.name,
              source: 'checkout',
            },
            { onConflict: 'email', ignoreDuplicates: true }
          )
      }

      // 3. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer?.id || null,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_email: customerData.email,
          marketing_consent: marketingConsent,
          subtotal: total,
          discount: 0,
          total: total,
          status: 'pending',
          payment_method: 'qr',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 4. Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        size: item.size || null,
        color: item.color || null,
        subtotal: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      setOrderId(order.id)
      setStep('qr')
      toast.success('¡Orden creada! Procede al pago', {
        position: 'bottom-center',
        icon: '🎉',
      })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Intenta de nuevo'
      console.error('Error creating order:', error)
      toast.error('Error al crear la orden: ' + msg, { position: 'bottom-center' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentConfirmed = () => {
    setStep('success')
    setShowConfetti(true)

    const productList = cart
      .map(
        (item) =>
          `• ${item.product.name} x${item.quantity}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}`
      )
      .join('\n')

    const whatsappMessage = encodeURIComponent(
      `🎉 ¡Hola! Realicé un pedido en Lukess Home\n\n` +
        `📋 *Orden #${orderId.slice(0, 8).toUpperCase()}*\n\n` +
        `🛍️ *Productos:*\n${productList}\n\n` +
        `💰 *Total: Bs ${total.toFixed(2)}*\n\n` +
        `✅ Ya realicé el pago por QR. ¿Pueden confirmar mi pedido?`
    )

    setTimeout(() => {
      window.open(`https://wa.me/59176020369?text=${whatsappMessage}`, '_blank')
    }, 1500)

    setTimeout(() => {
      clearCart()
      onClose()
      setStep('form')
      setCustomerData({ name: '', phone: '', email: '' })
      setShowConfetti(false)
    }, 4000)
  }

  return (
    <>
      <Confetti isActive={showConfetti} duration={4000} />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={step !== 'success' ? onClose : undefined}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div
                  className={`p-6 border-b-2 border-gray-100 flex items-center justify-between rounded-t-2xl transition-colors ${
                    step === 'success'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {step === 'form' && <ShoppingBag className="w-6 h-6" />}
                    {step === 'qr' && <CreditCard className="w-6 h-6" />}
                    {step === 'success' && <PartyPopper className="w-6 h-6" />}
                    <h2 className="text-2xl font-bold">
                      {step === 'form' && 'Finalizar Compra'}
                      {step === 'qr' && 'Pagar con QR'}
                      {step === 'success' && '¡Compra Exitosa!'}
                    </h2>
                  </div>
                  {step !== 'success' && (
                    <button
                      onClick={onClose}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {step === 'form' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Badge datos de cuenta */}
                      {isLoggedIn && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <User className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-green-700 font-medium">
                            ✓ Datos de tu cuenta
                          </span>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerData.name}
                          onChange={(e) =>
                            setCustomerData({ ...customerData, name: e.target.value })
                          }
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
                          onChange={(e) =>
                            setCustomerData({ ...customerData, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="76020369"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={customerData.email}
                          onChange={(e) => {
                            setCustomerData({ ...customerData, email: e.target.value })
                            if (emailError) setEmailError(validateEmail(e.target.value))
                          }}
                          onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            emailError
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                          }`}
                          placeholder="tucorreo@gmail.com *"
                        />
                        {emailError && (
                          <p className="mt-1 text-xs text-red-500">{emailError}</p>
                        )}
                      </div>

                      {/* Total */}
                      <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Total a Pagar:</span>
                          <span className="text-3xl font-bold text-primary-600">
                            Bs {total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Marketing consent */}
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            checked={marketingConsent}
                            onChange={(e) => setMarketingConsent(e.target.checked)}
                            className="w-4 h-4 accent-primary-600 cursor-pointer"
                          />
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors leading-relaxed">
                          Quiero recibir ofertas y promociones exclusivas por email
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                            Una vez realizado el pago, presiona "Ya Pagué" y te
                            contactaremos por WhatsApp para coordinar la entrega.
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
                    <div className="text-center space-y-6 py-8 relative overflow-hidden">
                      <SparkleEffect isActive={showConfetti} />

                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.8, bounce: 0.5 }}
                        className="relative"
                      >
                        <div className="w-28 h-28 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                          >
                            <CheckCircle className="w-16 h-16 text-white" />
                          </motion.div>
                        </div>
                        <motion.div
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1, repeat: 2 }}
                          className="absolute inset-0 w-28 h-28 mx-auto border-4 border-green-400 rounded-full"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <PartyPopper className="w-6 h-6 text-accent-500" />
                          <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 to-primary-600 bg-clip-text text-transparent">
                            ¡Felicidades!
                          </h3>
                          <PartyPopper className="w-6 h-6 text-accent-500 scale-x-[-1]" />
                        </div>
                        <p className="text-lg text-gray-600 font-medium">
                          Tu orden ha sido confirmada
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-xl border-2 border-primary-200"
                      >
                        <p className="text-sm text-gray-600 mb-1">Número de Orden</p>
                        <p className="text-2xl font-mono font-black text-primary-600 tracking-wider">
                          #{orderId.slice(0, 8).toUpperCase()}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-green-50 border-2 border-green-200 p-5 rounded-xl"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-green-600" />
                          <p className="text-green-800 font-bold text-lg">
                            ¡Gracias por tu compra!
                          </p>
                          <Sparkles className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm text-green-700">
                          Te contactaremos por WhatsApp para coordinar la entrega
                        </p>
                        <p className="text-xs text-green-600 mt-2 animate-pulse">
                          Abriendo WhatsApp...
                        </p>
                      </motion.div>

                      {/* Post-purchase auth CTA — solo para guests */}
                      {!isLoggedIn && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="border-2 border-[#c89b6e]/40 bg-[#fdf8f3] rounded-xl p-5 text-left"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-5 h-5 text-[#c89b6e]" />
                            <p className="font-bold text-gray-800 text-base">
                              Guarda tu historial de pedidos
                            </p>
                          </div>
                          <ul className="space-y-1 mb-4">
                            {[
                              'Ver todos tus pedidos en un lugar',
                              'Guardar tus favoritos',
                              'Checkout más rápido la próxima vez',
                            ].map((benefit) => (
                              <li
                                key={benefit}
                                className="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <span className="text-[#c89b6e] font-bold">✓</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsAuthModalOpen(true)}
                              className="flex-1 bg-[#c89b6e] hover:bg-[#b8895e] text-white font-semibold py-2.5 rounded-lg text-sm transition-all"
                            >
                              Crear cuenta gratis
                            </button>
                            <button
                              onClick={onClose}
                              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition-all"
                            >
                              Saltar →
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal post-purchase */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode="post-purchase"
        postPurchaseEmail={customerData.email}
        postPurchaseName={customerData.name}
      />
    </>
  )
}
