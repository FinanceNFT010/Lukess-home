'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
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
  Map,
  Paperclip,
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

const DeliveryMapPicker = dynamic(
  () => import('@/components/cart/DeliveryMapPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm border-2 border-gray-200">
        Cargando mapa...
      </div>
    ),
  },
)

const MUTUALISTA_LAT = -17.762778
const MUTUALISTA_LNG = -63.161667

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'form' | 'qr' | 'success'
type PaymentMethod = 'qr' | 'libelula'
type DeliveryMethod = 'delivery' | 'pickup'
type LocationState = 'initial' | 'gps_loading' | 'gps_denied' | 'map_open' | 'confirmed'
type ReceiptUploadState = 'idle' | 'uploading' | 'success' | 'error'

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, total, clearCart } = useCart()
  const { user, isLoggedIn, customerName, signInWithGoogle } = useAuth()
  const [step, setStep] = useState<Step>('form')
  const [orderId, setOrderId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showAccountCard, setShowAccountCard] = useState(true)
  const [showGoogleBanner, setShowGoogleBanner] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('qr')
  const [whatsappMessage, setWhatsappMessage] = useState('')

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
  })
  const [marketingConsent, setMarketingConsent] = useState(true)
  const [notifyByEmail, setNotifyByEmail] = useState(true)
  const [notifyByWhatsapp, setNotifyByWhatsapp] = useState(false)
  const [emailError, setEmailError] = useState('')

  // Delivery state
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingReference, setShippingReference] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [shippingAddressError, setShippingAddressError] = useState('')
  const [pickupLocationError, setPickupLocationError] = useState('')

  // Location state
  const [locationState, setLocationState] = useState<LocationState>('initial')
  const [locationSource, setLocationSource] = useState<'gps' | 'map' | null>(null)
  const [gpsLat, setGpsLat] = useState<number | null>(null)
  const [gpsLng, setGpsLng] = useState<number | null>(null)
  const [gpsDistanceKm, setGpsDistanceKm] = useState<number | null>(null)
  const [mapsLink, setMapsLink] = useState('')

  // Recipient state
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientPhoneError, setRecipientPhoneError] = useState('')

  // Delivery instructions (optional)
  const [deliveryInstructions, setDeliveryInstructions] = useState('')

  // Comprobante de pago (opcional)
  const [receiptUploadState, setReceiptUploadState] = useState<ReceiptUploadState>('idle')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null)
  const [receiptError, setReceiptError] = useState('')
  const [showReceiptLightbox, setShowReceiptLightbox] = useState(false)

  // Computed shipping
  const rawShippingCost: number | 'out_of_range' =
    deliveryMethod === 'pickup'
      ? 0
      : gpsDistanceKm !== null
        ? calculateShippingCost(gpsDistanceKm, total)
        : 0

  const isOutOfRange = rawShippingCost === 'out_of_range'
  const shippingCost = isOutOfRange ? 0 : (rawShippingCost as number)
  const orderTotal = total + shippingCost
  const selectedPickup = PICKUP_LOCATIONS.find((p) => p.id === pickupLocation)

  // Pre-fill recipient from customer data
  useEffect(() => {
    setRecipientName((prev) => prev || customerData.name)
    setRecipientPhone((prev) => prev || customerData.phone)
  }, [customerData.name, customerData.phone])

  // Pre-fill from authenticated account
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

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('form')
        setShowConfetti(false)
        setEmailError('')
        setNotifyByEmail(true)
        setNotifyByWhatsapp(false)
        setShowAccountCard(true)
        setShowGoogleBanner(true)
        setSelectedPayment('qr')
        setWhatsappMessage('')
        setDeliveryMethod('delivery')
        setShippingAddress('')
        setShippingReference('')
        setPickupLocation('')
        setShippingAddressError('')
        setPickupLocationError('')
        setLocationState('initial')
        setLocationSource(null)
        setGpsLat(null)
        setGpsLng(null)
        setGpsDistanceKm(null)
        setMapsLink('')
        setRecipientName('')
        setRecipientPhone('')
        setRecipientPhoneError('')
        setDeliveryInstructions('')
        setReceiptUploadState('idle')
        setReceiptFile(null)
        setReceiptPreviewUrl(null)
        setReceiptError('')
      }, 300)
    }
  }, [isOpen])

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'El email es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido'
    return ''
  }

  const setLocation = (lat: number, lng: number) => {
    const distKm = getDistanceFromMutualista(lat, lng)
    setGpsLat(lat)
    setGpsLng(lng)
    setGpsDistanceKm(distKm)
    setMapsLink(getMapsLink(lat, lng))
  }

  const handleGps = () => {
    if (!navigator.geolocation) {
      setLocationState('gps_denied')
      return
    }
    setLocationState('gps_loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude)
        setLocationSource('gps')
        setLocationState('map_open')
      },
      () => {
        setLocationState('gps_denied')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleOpenMap = () => {
    if (!gpsLat) {
      setLocation(MUTUALISTA_LAT, MUTUALISTA_LNG)
    }
    setLocationSource('map')
    setLocationState('map_open')
  }

  const handleMapLocationUpdate = (lat: number, lng: number) => {
    setLocation(lat, lng)
  }

  const handleConfirmLocation = () => {
    setLocationState('confirmed')
  }

  const handleResetLocation = () => {
    setLocationState('initial')
    setLocationSource(null)
    setGpsLat(null)
    setGpsLng(null)
    setGpsDistanceKm(null)
    setMapsLink('')
  }

  // Out-of-range WhatsApp cotización
  const outOfRangeWaUrl =
    mapsLink
      ? `https://wa.me/59176020369?text=${encodeURIComponent(
          `Hola! Quiero cotizar un envío 📦\n*Productos:*\n${cart.map((i) => `• ${i.product.name} x${i.quantity}`).join('\n')}\n💰 Total del pedido: Bs ${total.toFixed(2)}\n📍 Ubicación de entrega: ${mapsLink}\n¿Cuánto cuesta el envío hasta allí? 🙏`,
        )}`
      : ''

  const handleReceiptSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setReceiptError('Solo se aceptan imágenes (JPG, PNG, WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('La imagen no puede superar los 5 MB')
      return
    }

    setReceiptError('')
    setReceiptFile(file)
    setReceiptPreviewUrl(URL.createObjectURL(file))
    setReceiptUploadState('uploading')

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('orderId', orderId)

      const res = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: form,
      })

      const data = await res.json()

      if (!res.ok) {
        setReceiptUploadState('error')
        setReceiptError(data.error || 'Error al subir el comprobante')
        return
      }

      setReceiptUploadState('success')
    } catch {
      setReceiptUploadState('error')
      setReceiptError('Error de conexión. Intenta de nuevo.')
    }
  }

  const handleReceiptReset = () => {
    setReceiptUploadState('idle')
    setReceiptFile(null)
    if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl)
    setReceiptPreviewUrl(null)
    setReceiptError('')
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

    if (!customerData.email.trim() && notifyByEmail) {
      setEmailError('Ingresá tu email para recibir notificaciones por Gmail')
      return
    }
    if (customerData.email.trim()) {
      const emailValidation = validateEmail(customerData.email)
      if (emailValidation) {
        setEmailError(emailValidation)
        return
      }
    }
    setEmailError('')

    if (deliveryMethod === 'delivery') {
      if (locationState !== 'confirmed') {
        toast.error('Confirma tu ubicación de entrega', { position: 'bottom-center' })
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
      if (!recipientName.trim()) {
        toast.error('Ingresa el nombre de quien recibe', { position: 'bottom-center' })
        return
      }
      if (!phoneRegex.test(recipientPhone.replace(/\s/g, ''))) {
        setRecipientPhoneError('Número inválido (7-8 dígitos)')
        return
      }
      setRecipientPhoneError('')
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
          user_id: user?.id ?? undefined,
          customer_name: customerData.name,
          customer_phone: customerData.phone.replace(/\s/g, ''),
          customer_email: customerData.email,
          marketing_consent: marketingConsent,
          notify_email: notifyByEmail,
          notify_whatsapp: notifyByWhatsapp,
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
          recipient_name: deliveryMethod === 'delivery' ? recipientName.trim() : null,
          recipient_phone:
            deliveryMethod === 'delivery' ? recipientPhone.replace(/\s/g, '') : null,
          delivery_instructions:
            deliveryMethod === 'delivery' ? deliveryInstructions.trim() || null : null,
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
          ? `\n\n📍 *Dirección:* ${shippingAddress}${shippingReference ? `\nRef: ${shippingReference}` : ''}\n👤 *Recibe:* ${recipientName} · ${recipientPhone}${deliveryInstructions.trim() ? `\n📝 Instrucciones: ${deliveryInstructions.trim()}` : ''}${mapsLink ? `\n📍 Ubicación exacta: ${mapsLink}` : ''}`
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

    // Fire-and-forget: email de confirmación al hacer click en "Ya Pagué"
    if (notifyByEmail && customerData.email.trim()) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_confirmation',
          orderData: {
            orderId,
            customerName: customerData.name,
            customerEmail: customerData.email,
            customerPhone: customerData.phone,
            items: cart,
            subtotal: total,
            shippingCost,
            shippingDistance: gpsDistanceKm,
            deliveryAddress: deliveryMethod === 'delivery' && shippingAddress.trim() ? shippingAddress.trim() : null,
            locationUrl: deliveryMethod === 'delivery' && mapsLink ? mapsLink : null,
            discountAmount: 0,
            discountCode: null,
            total: orderTotal,
            notifyByEmail: true,
            notifyByWhatsapp,
          },
        }),
      }).catch((err) => console.error('[send-email] fetch error:', err))
    }

    // Fire-and-forget: reservar stock solo cuando el cliente confirma el pago
    fetch('/api/reserve-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    }).catch((err) => console.error('[reserve-order] fetch error:', err))
  }

  const handleContinueShopping = () => {
    clearCart()
    onClose()
    setStep('form')
    setCustomerData({ name: '', phone: '', email: '', website: '' })
    setNotifyByEmail(true)
    setNotifyByWhatsapp(false)
    setShowConfetti(false)
    setDeliveryMethod('delivery')
    setShippingAddress('')
    setShippingReference('')
    setPickupLocation('')
    setLocationState('initial')
    setLocationSource(null)
    setGpsLat(null)
    setGpsLng(null)
    setGpsDistanceKm(null)
    setMapsLink('')
    setRecipientName('')
    setRecipientPhone('')
    setDeliveryInstructions('')
    setReceiptUploadState('idle')
    setReceiptFile(null)
    if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl)
    setReceiptPreviewUrl(null)
    setReceiptError('')
  }

  const isContinueDisabled =
    isProcessing ||
    (deliveryMethod === 'delivery' && (locationState !== 'confirmed' || isOutOfRange))

  const continueLabel = isProcessing
    ? 'Procesando...'
    : deliveryMethod === 'delivery' && locationState !== 'confirmed'
      ? '📍 Confirma tu ubicación de entrega'
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

                      {/* ── Banner Google One Tap (solo si no está logueado y no lo cerró) ── */}
                      {!isLoggedIn && showGoogleBanner && (
                        <div className="flex items-center justify-between gap-3 bg-[#fdf8f3] border-2 border-[#c89b6e]/50 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Lock className="w-4 h-4 text-[#c89b6e] flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-700 leading-snug">
                              Guarda tu pedido y rastréalo fácil
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={signInWithGoogle}
                              className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all whitespace-nowrap"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              Continuar con Google
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowGoogleBanner(false)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              aria-label="Cerrar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

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
                            Email
                          </label>
                          <input
                            type="email"
                            value={customerData.email}
                            onChange={(e) => {
                              setCustomerData({ ...customerData, email: e.target.value })
                              if (emailError && e.target.value.trim()) setEmailError(validateEmail(e.target.value))
                              if (emailError && !e.target.value.trim()) setEmailError('')
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim()) setEmailError(validateEmail(e.target.value))
                            }}
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

                        {/* ── Preferencias de notificación ── */}
                        <div className="bg-[#111] border border-[#333] rounded-xl p-4 space-y-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            ¿Cómo querés recibir actualizaciones de tu pedido?
                          </p>

                          <label
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => {
                              if (notifyByEmail && !notifyByWhatsapp) return
                              setNotifyByEmail(!notifyByEmail)
                              if (emailError && notifyByEmail) setEmailError('')
                            }}
                          >
                            <div className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                              notifyByEmail
                                ? 'bg-[#D4AF37] border-[#D4AF37]'
                                : 'bg-transparent border-gray-500 group-hover:border-gray-300'
                            }`}>
                              {notifyByEmail && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-200 select-none">
                              📧 Por Gmail <span className="text-xs text-gray-500">(recomendado)</span>
                            </span>
                          </label>

                          <label
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => {
                              if (notifyByWhatsapp && !notifyByEmail) return
                              setNotifyByWhatsapp(!notifyByWhatsapp)
                            }}
                          >
                            <div className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                              notifyByWhatsapp
                                ? 'bg-[#D4AF37] border-[#D4AF37]'
                                : 'bg-transparent border-gray-500 group-hover:border-gray-300'
                            }`}>
                              {notifyByWhatsapp && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-200 select-none">
                              💬 Por WhatsApp
                            </span>
                          </label>

                          {!notifyByEmail && notifyByWhatsapp && (
                            <p className="text-xs text-gray-500 pl-8">
                              Usaremos el teléfono que ingresaste arriba
                            </p>
                          )}
                          {notifyByEmail && !notifyByWhatsapp && (
                            <p className="text-xs text-gray-500 pl-8">
                              Usaremos el correo que ingresaste arriba
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ── SECTION B: Método de entrega ── */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          ¿Cómo quieres recibir tu pedido?
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
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
                            <div className="mt-2">
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

                        {/* ── DELIVERY: location flow ── */}
                        {deliveryMethod === 'delivery' && (
                          <>
                          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#c89b6e]" />
                              <p className="text-sm font-semibold text-gray-700">
                                ¿Dónde entregamos tu pedido?
                              </p>
                            </div>

                            {/* STEP A — Initial: two options */}
                            {locationState === 'initial' && (
                              <div className="space-y-3">
                                <button
                                  type="button"
                                  onClick={handleGps}
                                  className="flex items-center gap-3 w-full p-3 rounded-xl border-2 border-[#c89b6e] bg-[#fdf8f3] hover:bg-[#f5ede0] transition-all text-left"
                                >
                                  <Navigation className="w-5 h-5 text-[#c89b6e] flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-bold text-gray-800">
                                      Usar mi ubicación actual
                                    </p>
                                    <p className="text-xs text-gray-500">Rápido y preciso</p>
                                  </div>
                                </button>

                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-px bg-gray-200" />
                                  <span className="text-xs text-gray-400 px-1">o</span>
                                  <div className="flex-1 h-px bg-gray-200" />
                                </div>

                                <button
                                  type="button"
                                  onClick={handleOpenMap}
                                  className="flex items-center gap-3 w-full p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all text-left"
                                >
                                  <Map className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-bold text-gray-800">
                                      Elegir en el mapa
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Mueve el pin al lugar exacto
                                    </p>
                                  </div>
                                </button>
                              </div>
                            )}

                            {/* GPS Loading */}
                            {locationState === 'gps_loading' && (
                              <div className="flex items-center justify-center gap-3 py-6">
                                <Loader2 className="w-6 h-6 animate-spin text-[#c89b6e]" />
                                <p className="text-sm text-gray-600 font-medium">
                                  Obteniendo tu ubicación...
                                </p>
                              </div>
                            )}

                            {/* GPS Denied — instructions + map option */}
                            {locationState === 'gps_denied' && (
                              <div className="space-y-3">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2.5">
                                  <p className="text-xs font-bold text-red-700">
                                    📍 Ubicación bloqueada
                                  </p>
                                  <p className="text-xs text-red-600">
                                    GPS no disponible en este navegador.
                                  </p>
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-gray-700">
                                      Cómo activar:
                                    </p>
                                    <div className="bg-white border border-red-100 rounded-lg p-2.5">
                                      <p className="text-xs text-gray-700 font-medium mb-0.5">
                                        🖥️ Chrome / Edge:
                                      </p>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        Haz clic en el ícono 📍 tachado en la barra de dirección
                                        (arriba izquierda) → activa{' '}
                                        <strong>Ubicación</strong> → Permitir → recarga la página
                                      </p>
                                    </div>
                                    <div className="bg-white border border-red-100 rounded-lg p-2.5">
                                      <p className="text-xs text-gray-700 font-medium mb-0.5">
                                        📱 Celular:
                                      </p>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        Toca el ícono en la barra de dirección → Permisos →{' '}
                                        <strong>Ubicación</strong> → Permitir
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-px bg-gray-200" />
                                  <span className="text-xs text-gray-400 px-1">o elige en el mapa</span>
                                  <div className="flex-1 h-px bg-gray-200" />
                                </div>

                                <button
                                  type="button"
                                  onClick={handleOpenMap}
                                  className="flex items-center gap-3 w-full p-3 rounded-xl border-2 border-[#c89b6e] bg-[#fdf8f3] hover:bg-[#f5ede0] transition-all text-left"
                                >
                                  <Map className="w-5 h-5 text-[#c89b6e] flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-bold text-gray-800">
                                      Elegir ubicación en el mapa
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Sin necesidad de GPS
                                    </p>
                                  </div>
                                </button>
                              </div>
                            )}

                            {/* STEP B — Map open (draggable, with live cost) */}
                            {locationState === 'map_open' &&
                              gpsLat !== null &&
                              gpsLng !== null && (
                                <div className="space-y-3">
                                  {locationSource === 'gps' && (
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                      <Navigation className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                      <p className="text-xs text-green-700 font-medium">
                                        ✓ Ubicación GPS · puedes ajustar el pin si es necesario
                                      </p>
                                    </div>
                                  )}

                                  <DeliveryMapPicker
                                    key="map-open"
                                    lat={gpsLat}
                                    lng={gpsLng}
                                    draggable={true}
                                    height={280}
                                    onLocationSelect={handleMapLocationUpdate}
                                  />

                                  {/* Live cost preview */}
                                  {gpsDistanceKm !== null && !isOutOfRange && (
                                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 space-y-0.5">
                                      <p className="text-xs text-gray-600">
                                        📍{' '}
                                        <span className="font-semibold">
                                          {gpsDistanceKm.toFixed(1)} km
                                        </span>{' '}
                                        del local
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        🚚 Costo de envío:{' '}
                                        {shippingCost === 0 ? (
                                          <span className="text-green-600 font-bold">
                                            Gratis 🎉
                                          </span>
                                        ) : (
                                          <span className="font-bold text-gray-800">
                                            Bs {shippingCost}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  )}

                                  {/* Out of range warning in map_open */}
                                  {isOutOfRange && gpsDistanceKm !== null && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                                      <p className="text-xs font-bold text-red-700">
                                        📍 {gpsDistanceKm.toFixed(1)} km — Fuera de zona de envío
                                      </p>
                                      <p className="text-xs text-red-600">
                                        Máximo {MAX_DELIVERY_DISTANCE_KM} km. Mueve el pin a una
                                        zona más cercana o cotiza por WhatsApp:
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
                                      <div className="flex items-center gap-2 pt-1">
                                        <div className="flex-1 h-px bg-red-200" />
                                        <span className="text-xs text-red-400">ó</span>
                                        <div className="flex-1 h-px bg-red-200" />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('pickup')}
                                        className="text-xs text-[#c89b6e] font-semibold underline hover:no-underline w-full text-center"
                                      >
                                        🏪 Ver opciones de recojo →
                                      </button>
                                    </div>
                                  )}

                                  {/* Confirm button (only if within range) */}
                                  {!isOutOfRange && (
                                    <button
                                      type="button"
                                      onClick={handleConfirmLocation}
                                      className="w-full bg-[#c89b6e] hover:bg-[#b8895e] text-white font-bold py-2.5 rounded-xl text-sm transition-all"
                                    >
                                      ✓ Confirmar esta ubicación
                                    </button>
                                  )}
                                </div>
                              )}

                            {/* STEP C — Confirmed: smaller static map + summary */}
                            {locationState === 'confirmed' &&
                              gpsLat !== null &&
                              gpsLng !== null && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-green-700">
                                      ✓ Ubicación de entrega confirmada
                                    </p>
                                    <button
                                      type="button"
                                      onClick={handleResetLocation}
                                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                                    >
                                      Cambiar
                                    </button>
                                  </div>

                                  <DeliveryMapPicker
                                    key="map-confirmed"
                                    lat={gpsLat}
                                    lng={gpsLng}
                                    draggable={false}
                                    height={200}
                                  />

                                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 space-y-0.5">
                                    <p className="text-xs text-green-700">
                                      📍{' '}
                                      <span className="font-semibold">
                                        {gpsDistanceKm?.toFixed(1)} km
                                      </span>{' '}
                                      del local
                                    </p>
                                    <p className="text-xs text-green-700">
                                      🚚 Costo de envío:{' '}
                                      {shippingCost === 0 ? (
                                        <span className="font-bold">Gratis 🎉</span>
                                      ) : (
                                        <span className="font-bold">Bs {shippingCost}</span>
                                      )}
                                    </p>
                                    {mapsLink && (
                                      <a
                                        href={mapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block text-xs text-[#c89b6e] hover:underline"
                                      >
                                        Ver en Maps →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Address + Reference + Recipient — only when confirmed */}
                            {locationState === 'confirmed' && !isOutOfRange && (
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

                                {/* Recipient info */}
                                <div className="border-t border-gray-200 pt-3 space-y-3">
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    ¿Quién recibe el pedido?
                                  </p>

                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                      Nombre de quien recibe *
                                    </label>
                                    <input
                                      type="text"
                                      value={recipientName}
                                      onChange={(e) => setRecipientName(e.target.value)}
                                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-[#c89b6e] focus:outline-none"
                                      placeholder="Puede ser diferente al tuyo"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                      Teléfono de quien recibe *
                                    </label>
                                    <input
                                      type="tel"
                                      value={recipientPhone}
                                      onChange={(e) => {
                                        setRecipientPhone(e.target.value)
                                        if (recipientPhoneError) setRecipientPhoneError('')
                                      }}
                                      className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
                                        recipientPhoneError
                                          ? 'border-red-400 focus:border-red-500'
                                          : 'border-gray-200 focus:border-[#c89b6e]'
                                      }`}
                                      placeholder="Para coordinar la entrega"
                                    />
                                    {recipientPhoneError && (
                                      <p className="mt-1 text-xs text-red-500">
                                        {recipientPhoneError}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Delivery instructions — optional */}
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-gray-600">
                                      📝 Instrucciones para el mensajero
                                    </label>
                                    <span className="text-xs text-gray-400">
                                      {deliveryInstructions.length}/200
                                    </span>
                                  </div>
                                  <textarea
                                    value={deliveryInstructions}
                                    onChange={(e) => {
                                      if (e.target.value.length <= 200)
                                        setDeliveryInstructions(e.target.value)
                                    }}
                                    rows={3}
                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-[#c89b6e] focus:outline-none resize-none"
                                    placeholder='Ej: "Tocar el timbre", "Llamar al llegar", "Casa azul con reja negra"'
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          {/* Coordination notice */}
                          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                            <span className="text-base flex-shrink-0 mt-0.5">ℹ️</span>
                            <div>
                              <p className="text-xs font-semibold text-blue-700 mb-0.5">
                                Importante
                              </p>
                              <p className="text-xs text-blue-600 leading-relaxed">
                                Te avisaremos por WhatsApp antes de enviar tu pedido para
                                coordinar la entrega. Asegúrate de estar disponible en la
                                ubicación indicada.
                              </p>
                            </div>
                          </div>
                          </>
                        )}

                        {/* ── PICKUP ── */}
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
                          ) : gpsDistanceKm !== null ? (
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
                              Pendiente ubicación
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

                      {/* ── Subir comprobante (opcional) ── */}
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-left space-y-3">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-[#c89b6e]" />
                          <p className="text-sm font-semibold text-gray-700">
                            Subí tu comprobante de pago
                          </p>
                          <span className="text-xs text-gray-400 ml-auto">Opcional</span>
                        </div>

                        {receiptUploadState === 'idle' && (
                          <>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              Subí la captura de tu comprobante para acelerar la verificación
                              de tu pago
                            </p>
                            <label className="flex items-center justify-center gap-2 w-full border-2 border-[#c89b6e] text-[#c89b6e] hover:bg-[#fdf8f3] font-semibold text-sm py-2.5 rounded-xl cursor-pointer transition-all">
                              <Paperclip className="w-4 h-4" />
                              Elegir imagen
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) handleReceiptSelect(f)
                                }}
                              />
                            </label>
                            <p className="text-xs text-gray-400 text-center">
                              Formatos: JPG, PNG, WebP · Máx 5 MB
                            </p>
                          </>
                        )}

                        {receiptUploadState === 'uploading' && (
                          <div className="flex items-center justify-center gap-3 py-3">
                            <Loader2 className="w-5 h-5 animate-spin text-[#c89b6e]" />
                            <p className="text-sm text-gray-600 font-medium">
                              Subiendo comprobante...
                            </p>
                          </div>
                        )}

                        {receiptUploadState === 'success' && (
                          <div className="flex items-center gap-3">
                            {receiptPreviewUrl && (
                              <button
                                type="button"
                                onClick={() => setShowReceiptLightbox(true)}
                                className="flex-shrink-0 focus:outline-none"
                                title="Ver imagen completa"
                              >
                                <img
                                  src={receiptPreviewUrl}
                                  alt="Comprobante"
                                  className="w-[120px] h-[120px] object-cover rounded-xl border-2 border-gray-200 cursor-pointer hover:border-[#c89b6e] transition-colors shadow-sm"
                                />
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                Comprobante recibido ✓
                              </div>
                              {receiptFile && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  {receiptFile.name}
                                </p>
                              )}
                            </div>
                            <label className="text-xs text-[#c89b6e] hover:underline cursor-pointer flex-shrink-0">
                              Cambiar imagen
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) {
                                    handleReceiptReset()
                                    handleReceiptSelect(f)
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}

                        {receiptUploadState === 'error' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <p className="text-sm font-medium">{receiptError}</p>
                            </div>
                            <label className="flex items-center justify-center gap-2 w-full border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold text-sm py-2 rounded-xl cursor-pointer transition-all">
                              Reintentar
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) {
                                    handleReceiptReset()
                                    handleReceiptSelect(f)
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
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

                      {/* Delivery info */}
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
                            {recipientName && (
                              <p className="text-xs text-gray-600">
                                👤 Recibe:{' '}
                                <span className="font-semibold">{recipientName}</span>
                                {recipientPhone && ` · ${recipientPhone}`}
                              </p>
                            )}
                            {deliveryInstructions && (
                              <p className="text-xs text-gray-500">
                                📝 {deliveryInstructions}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 pt-0.5">
                              {gpsDistanceKm !== null &&
                                `${gpsDistanceKm.toFixed(1)} km · `}
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
                                className="inline-block text-xs text-[#c89b6e] hover:underline"
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
                              className="inline-block text-xs text-[#c89b6e] hover:underline"
                            >
                              {selectedPickup.mapsLabel}
                            </a>
                          </div>
                        ) : null}
                      </motion.div>

                      {/* Delivery time banner — only for delivery orders */}
                      {deliveryMethod === 'delivery' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.58 }}
                          className="border-l-4 border-amber-500 bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2"
                        >
                          <p className="text-sm font-bold text-gray-700">
                            🕐 Tiempo estimado de entrega
                          </p>
                          <div className="space-y-1.5 text-xs text-gray-600">
                            <div className="flex items-start gap-2">
                              <span className="text-base flex-shrink-0">⚡</span>
                              <div>
                                <p className="font-semibold text-gray-700">
                                  Mínimo: ~30 min – 1 hora
                                </p>
                                <p className="text-gray-500">
                                  Si el puesto está abierto y hay disponibilidad de Yango
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-base flex-shrink-0">📅</span>
                              <div>
                                <p className="font-semibold text-gray-700">
                                  Máximo: hasta 2 días hábiles
                                </p>
                                <p className="text-gray-500">
                                  Si el pedido entra fuera de horario o hay alta demanda
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-base flex-shrink-0">🕐</span>
                              <div>
                                <p className="font-semibold text-gray-700">Horario de atención</p>
                                <p className="text-gray-500">
                                  Lun–Sáb 8AM–10PM · Dom 9AM–9PM
                                </p>
                              </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-1">
                              <p className="text-xs text-amber-700">
                                ⚠️ Pedidos fuera de horario se procesan al día siguiente
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* WhatsApp */}
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
                            href={`https://wa.me/59176020369?text=${whatsappMessage}${receiptUploadState === 'success' ? encodeURIComponent('\n📎 Ya subí mi comprobante de pago en el sistema.') : ''}`}
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

      {/* ── Lightbox comprobante ── */}
      <AnimatePresence>
        {showReceiptLightbox && receiptPreviewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReceiptLightbox(false)}
            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          >
            <button
              onClick={() => setShowReceiptLightbox(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={receiptPreviewUrl}
              alt="Comprobante de pago"
              style={{ maxWidth: '90vw', maxHeight: '85vh' }}
              className="rounded-xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
