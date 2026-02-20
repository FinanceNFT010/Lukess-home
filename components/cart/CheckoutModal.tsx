'use client'
import { useState, useEffect } from 'react'
import {
  X,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  PartyPopper,
  Sparkles,
  User,
  Lock,
  MessageCircle,
  MapPin,
  Truck,
  Store,
  Navigation,
  Loader2,
} from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Confetti, SparkleEffect } from '@/components/ui/Confetti'
import { AuthModal } from '@/components/auth/AuthModal'
import {
  PICKUP_LOCATIONS,
  FREE_SHIPPING_THRESHOLD,
  MAX_DELIVERY_DISTANCE_KM,
  calculateShippingCost,
  getDistanceFromMutualista,
  getMapsLink,
} from '@/lib/utils/shipping'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'form' | 'qr' | 'success'
type PaymentMethod = 'qr' | 'libelula'
type DeliveryMethod = 'delivery' | 'pickup'
type GpsStatus = 'idle' | 'loading' | 'captured' | 'denied'

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, total, clearCart } = useCart()
  const { user, isLoggedIn, customerName } = useAuth()
  const [step, setStep] = useState<Step>('form')
  const [orderId, setOrderId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showAccountCard, setShowAccountCard] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('qr')
  const [whatsappMessage, setWhatsappMessage] = useState('')

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
  })
  const [marketingConsent, setMarketingConsent] = useState(true)
  const [emailError, setEmailError] = useState('')

  // Delivery state
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingReference, setShippingReference] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [gpsLat, setGpsLat] = useState<number | null>(null)
  const [gpsLng, setGpsLng] = useState<number | null>(null)
  const [gpsDistanceKm, setGpsDistanceKm] = useState<number | null>(null)
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [mapsLink, setMapsLink] = useState('')
  const [shippingAddressError, setShippingAddressError] = useState('')
  const [pickupLocationError, setPickupLocationError] = useState('')

  // Computed shipping
  const rawShippingCost: number | 'out_of_range' =
    deliveryMethod === 'pickup'
      ? 0
      : gpsStatus === 'captured' && gpsDistanceKm !== null
        ? calculateShippingCost(gpsDistanceKm, total)
        : 0

  const isOutOfRange = rawShippingCost === 'out_of_range'
  const shippingCost = isOutOfRange ? 0 : (rawShippingCost as number)
  const orderTotal = total + shippingCost
  const selectedPickup = PICKUP_LOCATIONS.find((p) => p.id === pickupLocation)

  // Pre-fill desde cuenta autenticada
  useEffect(() => {
    if (isLoggedIn && user) {
      setCustomerData((prev) => ({
        ...prev,
        name: prev.name || customerName || '',
        phone: prev.phone || user.user_metadata?.phone || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [isLoggedIn, user, customerName])

  // Reset al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('form')
        setShowConfetti(false)
        setEmailError('')
        setShowAccountCard(true)
        setSelectedPayment('qr')
        setWhatsappMessage('')
        setDeliveryMethod('delivery')
        setShippingAddress('')
        setShippingReference('')
        setPickupLocation('')
        setGpsLat(null)
        setGpsLng(null)
        setGpsDistanceKm(null)
        setGpsStatus('idle')
        setMapsLink('')
        setShippingAddressError('')
        setPickupLocationError('')
      }, 300)
    }
  }, [isOpen])

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'El email es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido'
    return ''
  }

  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied')
      return
    }
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const distKm = getDistanceFromMutualista(lat, lng)
        setGpsLat(lat)
        setGpsLng(lng)
        setGpsDistanceKm(distKm)
        setMapsLink(getMapsLink(lat, lng))
        setGpsStatus('captured')
      },
      () => {
        setGpsStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const switchToPickup = () => {
    setDeliveryMethod('pickup')
  }

  // Build the out-of-range WhatsApp cotización link
  const outOfRangeWaUrl =
    gpsStatus === 'captured' && mapsLink
      ? `https://wa.me/59176020369?text=${encodeURIComponent(
          `Hola! Quiero cotizar un envío.\nPedido:\n${cart.map((i) => `• ${i.product.name} x${i.quantity}`).join('\n')}\nTotal: Bs ${total.toFixed(2)}\n📍 Mi ubicación: ${mapsLink}\n¿Cuánto costaría el envío hasta allí? 🙏`,
        )}`
      : ''

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

    if (deliveryMethod === 'delivery') {
      if (gpsStatus !== 'captured') {
        toast.error('Captura tu ubicación GPS para continuar', { position: 'bottom-center' })
        return
      }
      if (isOutOfRange) {
        toast.error('Tu ubicación está fuera de la zona de envío', { position: 'bottom-center' })
        return
      }
      if (!shippingAddress.trim() || shippingAddress.trim().length < 10) {
        setShippingAddressError('Ingresa una dirección válida (mínimo 10 caracteres)')
        return
      }
      setShippingAddressError('')
    } else {
      if (!pickupLocation) {
        setPickupLocationError('Selecciona un puesto de recogida')
        return
      }
      setPickupLocationError('')
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: customerData.website,
          customer_name: customerData.name,
          customer_phone: customerData.phone.replace(/\s/g, ''),
          customer_email: customerData.email,
          marketing_consent: marketingConsent,
          subtotal: total,
          shipping_cost: shippingCost,
          total: orderTotal,
          delivery_method: deliveryMethod,
          shipping_address: deliveryMethod === 'delivery' ? shippingAddress.trim() : null,
          shipping_reference:
            deliveryMethod === 'delivery' ? shippingReference.trim() || null : null,
          pickup_location: deliveryMethod === 'pickup' ? pickupLocation : null,
          gps_lat: gpsLat,
          gps_lng: gpsLng,
          gps_distance_km: gpsDistanceKm,
          maps_link: mapsLink || null,
          items: cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price,
            size: item.size || null,
            color: item.color || null,
            subtotal: item.product.price * item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(data.error || 'Demasiados pedidos. Intenta de nuevo en una hora.', {
            position: 'bottom-center',
          })
        } else {
          toast.error(data.error || 'Error al crear la orden', { position: 'bottom-center' })
        }
        return
      }

      const { orderId: newOrderId } = data
      const shortId = newOrderId.slice(0, 8).toUpperCase()
      setOrderId(newOrderId)

      const productList = cart
        .map(
          (item) =>
            `• ${item.product.name} x${item.quantity}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}`,
        )
        .join('\n')

      const deliveryInfo =
        deliveryMethod === 'delivery'
          ? `\n\n📍 *Dirección:* ${shippingAddress}${shippingReference ? `\nRef: ${shippingReference}` : ''}${mapsLink ? `\n📍 Mi ubicación GPS: ${mapsLink}` : ''}`
          : `\n\n🏪 *Recojo en tienda:* ${PICKUP_LOCATIONS.find((p) => p.id === pickupLocation)?.name ?? pickupLocation}`

      setWhatsappMessage(
        encodeURIComponent(
          `Hola! Realicé el pedido #${shortId} por Bs ${orderTotal.toFixed(2)}.\n\n` +
            `🛍️ *Productos:*\n${productList}${deliveryInfo}\n\n` +
            `Ya realicé el pago por QR. ¿Pueden confirmar? 🙏`,
        ),
      )

      setStep('qr')
      toast.success('¡Orden creada! Procede al pago', { position: 'bottom-center', icon: '🎉' })
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
  }

  const handleContinueShopping = () => {
    clearCart()
    onClose()
    setStep('form')
    setCustomerData({ name: '', phone: '', email: '', website: '' })
    setShowConfetti(false)
    setDeliveryMethod('delivery')
    setShippingAddress('')
    setShippingReference('')
    setPickupLocation('')
    setGpsLat(null)
    setGpsLng(null)
    setGpsDistanceKm(null)
    setGpsStatus('idle')
    setMapsLink('')
  }

  // Whether the "Continuar" button should be disabled
  const isContinueDisabled =
    isProcessing ||
    (deliveryMethod === 'delivery' && (gpsStatus !== 'captured' || isOutOfRange))

  // Label for the "Continuar" button
  const continueLabel = isProcessing
    ? 'Procesando...'
    : deliveryMethod === 'delivery' && gpsStatus !== 'captured'
      ? '📍 Captura tu GPS para continuar'
      : deliveryMethod === 'delivery' && isOutOfRange
        ? '⚠️ Fuera de zona de envío'
        : 'Continuar al Pago'

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
                  {/* ── STEP 1: FORMULARIO ── */}
                  {step === 'form' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Honeypot */}
                      <input
                        type="text"
                        name="website"
                        value={customerData.website}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, website: e.target.value })
                        }
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                      />

                      {/* ── SECTION A: Datos personales ── */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Datos personales
                        </h3>

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
                            placeholder="tucorreo@gmail.com"
                          />
                          {emailError && (
                            <p className="mt-1 text-xs text-red-500">{emailError}</p>
                          )}
                        </div>
                      </div>

                      {/* ── SECTION B: Método de entrega ── */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          ¿Cómo quieres recibir tu pedido?
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Envío a domicilio */}
                          <button
                            type="button"
                            onClick={() => setDeliveryMethod('delivery')}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              deliveryMethod === 'delivery'
                                ? 'border-[#c89b6e] bg-[#fdf8f3] shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Truck
                              className={`w-6 h-6 mb-2 ${deliveryMethod === 'delivery' ? 'text-[#c89b6e]' : 'text-gray-400'}`}
                            />
                            <p className="font-bold text-sm text-gray-800">Envío a domicilio</p>
                            <p className="text-xs text-gray-500 mt-0.5">Santa Cruz</p>
                            <div className="mt-2 space-y-0.5">
                              {total >= FREE_SHIPPING_THRESHOLD ? (
                                <p className="text-xs text-green-600 font-semibold">Gratis 🎉</p>
                              ) : (
                                <>
                                  <p className="text-xs text-gray-500">
                                    Desde Bs 5 · máx. {MAX_DELIVERY_DISTANCE_KM} km
                                  </p>
                                  <p className="text-xs text-green-600">
                                    ≥ Bs {FREE_SHIPPING_THRESHOLD} → Gratis
                                  </p>
                                </>
                              )}
                            </div>
                          </button>

                          {/* Recoger en tienda */}
                          <button
                            type="button"
                            onClick={() => setDeliveryMethod('pickup')}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              deliveryMethod === 'pickup'
                                ? 'border-[#c89b6e] bg-[#fdf8f3] shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Store
                              className={`w-6 h-6 mb-2 ${deliveryMethod === 'pickup' ? 'text-[#c89b6e]' : 'text-gray-400'}`}
                            />
                            <p className="font-bold text-sm text-gray-800">Recoger en tienda</p>
                            <p className="text-xs text-gray-500 mt-0.5">Mercado Mutualista</p>
                            <p className="text-xs text-green-600 font-semibold mt-2">
                              Siempre gratis
                            </p>
                          </button>
                        </div>

                        {/* ── Campos: DELIVERY ── */}
                        {deliveryMethod === 'delivery' && (
                          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#c89b6e]" />
                              <p className="text-sm font-semibold text-gray-700">
                                Tu ubicación de entrega
                              </p>
                            </div>

                            {/* GPS Button */}
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={handleGps}
                                disabled={gpsStatus === 'loading'}
                                className={`flex items-center gap-2 w-full justify-center text-sm px-4 py-2.5 rounded-lg border-2 font-semibold transition-all ${
                                  gpsStatus === 'captured' && !isOutOfRange
                                    ? 'border-green-400 bg-green-50 text-green-700'
                                    : gpsStatus === 'captured' && isOutOfRange
                                      ? 'border-red-300 bg-red-50 text-red-600'
                                      : gpsStatus === 'denied'
                                        ? 'border-red-300 bg-red-50 text-red-600'
                                        : gpsStatus === 'loading'
                                          ? 'border-amber-300 bg-amber-50 text-amber-600 cursor-wait'
                                          : 'border-[#c89b6e] bg-[#fdf8f3] text-[#c89b6e] hover:bg-[#f5ede0]'
                                }`}
                              >
                                {gpsStatus === 'loading' ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Navigation className="w-4 h-4" />
                                )}
                                {gpsStatus === 'captured'
                                  ? isOutOfRange
                                    ? '📍 Ubicación capturada (fuera de zona)'
                                    : '✓ Ubicación capturada'
                                  : gpsStatus === 'denied'
                                    ? '📍 Ubicación bloqueada'
                                    : gpsStatus === 'loading'
                                      ? 'Obteniendo ubicación...'
                                      : '📍 Compartir mi ubicación GPS'}
                              </button>

                              {/* GPS captured — within range */}
                              {gpsStatus === 'captured' && gpsDistanceKm !== null && !isOutOfRange && (
                                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 space-y-0.5">
                                  <p className="text-xs text-green-700 font-semibold">
                                    📍 {gpsDistanceKm.toFixed(1)} km del local
                                  </p>
                                  <p className="text-xs text-green-700">
                                    🛵 Costo de envío:{' '}
                                    {shippingCost === 0 ? (
                                      <span className="font-bold">Gratis 🎉</span>
                                    ) : (
                                      <span className="font-bold">Bs {shippingCost}</span>
                                    )}
                                  </p>
                                </div>
                              )}

                              {/* GPS captured — OUT OF RANGE */}
                              {gpsStatus === 'captured' && isOutOfRange && gpsDistanceKm !== null && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                                  <div>
                                    <p className="text-xs font-bold text-red-700">
                                      📍 {gpsDistanceKm.toFixed(1)} km del local
                                    </p>
                                    <p className="text-xs text-red-600 mt-0.5">
                                      ⚠️ Tu ubicación está fuera de nuestra zona de envío (máx.{' '}
                                      {MAX_DELIVERY_DISTANCE_KM} km).
                                    </p>
                                  </div>
                                  <p className="text-xs text-red-600">
                                    Para envíos a larga distancia, cotiza por WhatsApp:
                                  </p>
                                  <a
                                    href={outOfRangeWaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-[#25d366] hover:bg-[#1fb855] text-white text-xs font-semibold py-2 rounded-lg transition-all"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    Cotizar envío por WhatsApp
                                  </a>
                                  <div className="border-t border-red-200 pt-2">
                                    <p className="text-xs text-gray-500 mb-1.5">── ó ──</p>
                                    <p className="text-xs text-gray-600 mb-1.5">
                                      🏪 Recoge gratis en nuestros puestos
                                    </p>
                                    <button
                                      type="button"
                                      onClick={switchToPickup}
                                      className="text-xs text-[#c89b6e] font-semibold underline hover:no-underline"
                                    >
                                      Ver opciones de recojo →
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* GPS DENIED — instructions to re-enable */}
                              {gpsStatus === 'denied' && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2.5">
                                  <div>
                                    <p className="text-xs font-bold text-red-700 mb-1">
                                      📍 Ubicación bloqueada
                                    </p>
                                    <p className="text-xs text-red-600">
                                      Necesitamos tu ubicación para calcular el costo de envío
                                      exacto.
                                    </p>
                                  </div>

                                  <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-gray-700">
                                      Cómo activar la ubicación:
                                    </p>
                                    <div className="bg-white border border-red-100 rounded-lg p-2.5 space-y-1.5">
                                      <p className="text-xs text-gray-700 font-medium">
                                        🖥️ En computadora (Chrome):
                                      </p>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        Haz clic en el ícono 📍 tachado en la barra de dirección
                                        (arriba a la izquierda) → activa{' '}
                                        <strong>Ubicación</strong> → recarga la página
                                      </p>
                                    </div>
                                    <div className="bg-white border border-red-100 rounded-lg p-2.5 space-y-1.5">
                                      <p className="text-xs text-gray-700 font-medium">
                                        📱 En celular:
                                      </p>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        Toca el ícono en la barra de dirección → Permisos →{' '}
                                        <strong>Ubicación</strong> → Permitir
                                      </p>
                                    </div>
                                  </div>

                                  <div className="border-t border-red-200 pt-2">
                                    <p className="text-xs text-gray-500 mb-1.5">── ó ──</p>
                                    <p className="text-xs text-gray-600 mb-1.5">
                                      🏪 Recoge gratis en nuestros puestos
                                    </p>
                                    <button
                                      type="button"
                                      onClick={switchToPickup}
                                      className="text-xs text-[#c89b6e] font-semibold underline hover:no-underline"
                                    >
                                      Ver opciones de recojo →
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* idle hint */}
                              {gpsStatus === 'idle' && (
                                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                                  📍 Requerido para calcular el costo de envío exacto
                                </p>
                              )}
                            </div>

                            {/* Address fields — only show when GPS captured and within range */}
                            {gpsStatus === 'captured' && !isOutOfRange && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Dirección *
                                  </label>
                                  <input
                                    type="text"
                                    value={shippingAddress}
                                    onChange={(e) => {
                                      setShippingAddress(e.target.value)
                                      if (shippingAddressError) setShippingAddressError('')
                                    }}
                                    className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
                                      shippingAddressError
                                        ? 'border-red-400 focus:border-red-500'
                                        : 'border-gray-200 focus:border-[#c89b6e]'
                                    }`}
                                    placeholder="Calle, número, zona/barrio"
                                  />
                                  {shippingAddressError && (
                                    <p className="mt-1 text-xs text-red-500">
                                      {shippingAddressError}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Referencia
                                  </label>
                                  <input
                                    type="text"
                                    value={shippingReference}
                                    onChange={(e) => setShippingReference(e.target.value)}
                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-[#c89b6e] focus:outline-none"
                                    placeholder="Ej: Frente al parque, edificio azul"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* ── Campos: PICKUP ── */}
                        {deliveryMethod === 'pickup' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Store className="w-4 h-4 text-[#c89b6e]" />
                              <p className="text-sm font-semibold text-gray-700">
                                Elige el puesto de recogida
                              </p>
                            </div>

                            {pickupLocationError && (
                              <p className="text-xs text-red-500 mb-1">{pickupLocationError}</p>
                            )}

                            {PICKUP_LOCATIONS.map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => {
                                  setPickupLocation(loc.id)
                                  if (pickupLocationError) setPickupLocationError('')
                                }}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                  pickupLocation === loc.id
                                    ? 'border-[#c89b6e] bg-[#fdf8f3]'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800">
                                      {loc.name} — {loc.aisle}, {loc.stall}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{loc.hours}</p>
                                  </div>
                                  <a
                                    href={loc.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-[#c89b6e] hover:underline whitespace-nowrap flex-shrink-0 mt-0.5"
                                  >
                                    {loc.mapsLabel}
                                  </a>
                                </div>
                              </button>
                            ))}

                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                              ⏰ Recuerda venir en horario de atención
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ── Order Summary ── */}
                      <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200 space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Subtotal:</span>
                          <span>Bs {total.toFixed(2)}</span>
                        </div>

                        {/* Shipping line with descriptive label */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Envío:</span>
                          {deliveryMethod === 'pickup' ? (
                            <span className="text-green-600 font-semibold">
                              🏪 Retiro gratis en tienda
                            </span>
                          ) : isOutOfRange ? (
                            <span className="text-red-600 font-medium text-xs">
                              ⚠️ Fuera de zona · cotizar por WhatsApp
                            </span>
                          ) : gpsStatus === 'captured' ? (
                            shippingCost === 0 ? (
                              <span className="text-green-600 font-semibold">
                                🎉 Envío gratis · pedido mayor a Bs {FREE_SHIPPING_THRESHOLD}
                              </span>
                            ) : (
                              <span className="text-gray-700 font-medium">
                                🛵 Bs {shippingCost.toFixed(2)} ·{' '}
                                {shippingCost === 5
                                  ? 'menos de 1 km'
                                  : shippingCost === 10
                                    ? 'menos de 3 km'
                                    : shippingCost === 15
                                      ? 'menos de 6 km'
                                      : shippingCost === 20
                                        ? 'menos de 10 km'
                                        : 'menos de 20 km'}
                              </span>
                            )
                          ) : (
                            <span className="text-amber-600 font-medium text-xs">
                              Pendiente GPS
                            </span>
                          )}
                        </div>

                        <div className="border-t border-primary-200 pt-2 flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Total a Pagar:</span>
                          <span className="text-3xl font-bold text-primary-600">
                            Bs {orderTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

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
                        disabled={isContinueDisabled}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {continueLabel}
                      </button>
                    </form>
                  )}

                  {/* ── STEP 2: PAGO QR ── */}
                  {step === 'qr' && (
                    <div className="text-center space-y-6">
                      <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200">
                        <p className="text-sm text-gray-700 mb-2">Orden #</p>
                        <p className="text-lg font-mono font-bold text-primary-600">
                          {orderId.slice(0, 8).toUpperCase()}
                        </p>
                      </div>

                      {/* Selector de método de pago */}
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Elige cómo pagar:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedPayment('qr')}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              selectedPayment === 'qr'
                                ? 'border-[#c89b6e] bg-[#fdf8f3] shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-xl mb-1">📱</div>
                            <p className="font-semibold text-sm text-gray-800">Pago con QR</p>
                            <p className="text-xs text-gray-500 mt-0.5">Yolo Pago</p>
                            {selectedPayment === 'qr' && (
                              <span className="inline-block mt-2 text-xs font-bold text-[#c89b6e] bg-[#c89b6e]/10 px-2 py-0.5 rounded-full">
                                SELECCIONADO
                              </span>
                            )}
                          </button>

                          <div className="relative group">
                            <div className="p-4 rounded-xl border-2 border-gray-200 text-left pointer-events-none opacity-50 bg-gray-50">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xl">💳</span>
                              </div>
                              <p className="font-semibold text-sm text-gray-600">Libélula</p>
                              <p className="text-xs text-gray-400 mt-0.5">Tarjeta / QR</p>
                              <span className="inline-block mt-2 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                Próximamente
                              </span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-lg">
                              Integración con Libélula próximamente. Acepta Visa, Mastercard, QR
                              Bolivia y más.
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        </div>
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
                        <p className="text-4xl font-bold">Bs {orderTotal.toFixed(2)}</p>
                        {shippingCost > 0 && (
                          <p className="text-xs mt-1.5 text-white/70">
                            Incluye Bs {shippingCost.toFixed(2)} de envío
                            {gpsDistanceKm !== null && ` · ${gpsDistanceKm.toFixed(1)} km`}
                          </p>
                        )}
                      </div>

                      <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800 text-left">
                            Una vez realizado el pago, presiona &quot;Ya Pagué&quot; y te
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

                  {/* ── STEP 3: ÉXITO ── */}
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

                      {/* Delivery info en confirmación */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-left"
                      >
                        {deliveryMethod === 'delivery' ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="w-4 h-4 text-[#c89b6e]" />
                              <p className="text-sm font-bold text-gray-700">
                                Entrega a domicilio
                              </p>
                            </div>
                            <p className="text-sm text-gray-800">{shippingAddress}</p>
                            {shippingReference && (
                              <p className="text-xs text-gray-500">Ref: {shippingReference}</p>
                            )}
                            <p className="text-xs text-gray-500 pt-0.5">
                              {gpsDistanceKm !== null &&
                                `Distancia: ${gpsDistanceKm.toFixed(1)} km · `}
                              Envío:{' '}
                              {shippingCost === 0 ? (
                                <span className="text-green-600 font-semibold">Gratis 🎉</span>
                              ) : (
                                <span className="font-semibold text-gray-700">
                                  Bs {shippingCost.toFixed(2)}
                                </span>
                              )}
                            </p>
                            {mapsLink && (
                              <a
                                href={mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-xs text-[#c89b6e] hover:underline mt-0.5"
                              >
                                Ver mi ubicación en Maps →
                              </a>
                            )}
                          </div>
                        ) : selectedPickup ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-2">
                              <Store className="w-4 h-4 text-[#c89b6e]" />
                              <p className="text-sm font-bold text-gray-700">Retiro en tienda</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">
                              {selectedPickup.name} — {selectedPickup.aisle},{' '}
                              {selectedPickup.stall}
                            </p>
                            <p className="text-xs text-gray-500">{selectedPickup.hours}</p>
                            <a
                              href={selectedPickup.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-xs text-[#c89b6e] hover:underline mt-0.5"
                            >
                              {selectedPickup.mapsLabel}
                            </a>
                          </div>
                        ) : null}
                      </motion.div>

                      {/* Confirmación + WhatsApp */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-green-50 border-2 border-green-200 p-5 rounded-xl text-left space-y-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-green-600" />
                            <p className="text-green-800 font-bold text-base">
                              ¡Gracias por tu compra!
                            </p>
                          </div>
                          <p className="text-sm text-green-700">
                            Revisaremos tu pago y te contactaremos a la brevedad por WhatsApp.
                          </p>
                        </div>

                        <div className="border-t border-green-200 pt-4">
                          <p className="text-sm text-gray-600 mb-3 font-medium">
                            ¿Ya realizaste el pago QR?
                          </p>
                          <a
                            href={`https://wa.me/59176020369?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-[#25d366] hover:bg-[#1fb855] text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Avisar por WhatsApp que ya pagué
                          </a>
                          <p className="text-xs text-gray-400 text-center mt-2">
                            — o espera que te contactemos —
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.75 }}
                      >
                        <button
                          onClick={handleContinueShopping}
                          className="w-full border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-semibold py-3 rounded-xl transition-all text-sm"
                        >
                          Seguir comprando
                        </button>
                      </motion.div>

                      {/* Card "Crear cuenta" */}
                      {!isLoggedIn && showAccountCard && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                          className="border-2 border-[#c89b6e]/40 bg-[#fdf8f3] rounded-xl p-5 text-left relative"
                        >
                          <button
                            onClick={() => setShowAccountCard(false)}
                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Cerrar"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2 mb-3 pr-6">
                            <User className="w-5 h-5 text-[#c89b6e]" />
                            <p className="font-bold text-gray-800 text-base">
                              Guarda tu historial de pedidos
                            </p>
                          </div>

                          <p className="text-xs text-gray-500 mb-3">
                            Con una cuenta gratuita puedes:
                          </p>

                          <ul className="space-y-1 mb-4">
                            {[
                              'Ver todos tus pedidos',
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
                              onClick={() => setShowAccountCard(false)}
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
