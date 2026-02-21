'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Search, Loader2, ShoppingBag, ShoppingCart, Shirt } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
import { AuthModal } from '@/components/auth/AuthModal'
import toast from 'react-hot-toast'
import { Product } from '@/lib/types'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'

interface OrderProduct {
  id: string
  name: string
  image_url: string | null
  images: string[] | null
}

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number | null
  size: string | null
  color: string | null
  products: OrderProduct | OrderProduct[] | null
}

interface Order {
  id: string
  created_at: string
  status: OrderStatus
  total: number
  order_items?: OrderItem[]
}

const ORDER_SELECT = `
  id,
  created_at,
  status,
  total,
  order_items (
    id,
    product_id,
    quantity,
    unit_price,
    subtotal,
    size,
    color,
    products (
      id,
      name,
      image_url,
      images
    )
  )
`

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; message: string }
> = {
  pending: {
    label: 'Pendiente',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    message: 'Revisando tu pedido, te contactamos pronto',
  },
  confirmed: {
    label: 'Confirmado',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    message: '✅ Pedido confirmado, preparando tu envío',
  },
  shipped: {
    label: 'En camino',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    message: '🚚 Tu pedido está en camino',
  },
  completed: {
    label: 'Entregado',
    color: 'text-green-700',
    bg: 'bg-green-100',
    message: '🎉 ¡Pedido entregado! Gracias por tu compra',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-700',
    bg: 'bg-red-100',
    message: '❌ Pedido cancelado. Contáctanos por WhatsApp',
  },
}

function resolveProduct(item: OrderItem): OrderProduct | null {
  if (!item.products) return null
  return Array.isArray(item.products) ? (item.products[0] ?? null) : item.products
}

function resolveImage(item: OrderItem): string | null {
  const p = resolveProduct(item)
  if (!p) return null
  if (p.image_url) return p.image_url
  if (p.images && p.images.length > 0) return p.images[0]
  return null
}

function shouldShowSize(size: string | null | undefined): boolean {
  if (!size || size.trim() === '') return false
  if (size === 'Unitalla') return false
  return true
}

function ItemImage({ item }: { item: OrderItem }) {
  const product = resolveProduct(item)
  const imgSrc = resolveImage(item)

  const inner = imgSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={product?.name ?? 'Producto'}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <Shirt className="w-6 h-6 text-gray-300" />
    </div>
  )

  if (product) {
    return (
      <Link
        href={`/producto/${product.id}`}
        className="block w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 hover:opacity-80 transition-opacity"
      >
        {inner}
      </Link>
    )
  }
  return (
    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
      {inner}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const { addToCart } = useCart()
  const [isReordering, setIsReordering] = useState(false)

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const date = new Date(order.created_at).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const handleReorder = async () => {
    const items = order.order_items
    if (!items?.length) return
    setIsReordering(true)

    try {
      const supabase = createClient()
      const productIds = items.map((i) => i.product_id)

      const { data: products } = await supabase
        .from('products')
        .select('*, inventory(quantity, reserved_qty, location_id, size)')
        .in('id', productIds)
        .eq('is_active', true)

      let addedCount = 0
      let skippedCount = 0

      for (const item of items) {
        const product = products?.find((p) => p.id === item.product_id) as Product | undefined
        if (!product) {
          skippedCount++
          continue
        }

        const available = (product.inventory ?? []).reduce(
          (sum, inv) => sum + inv.quantity - (inv.reserved_qty ?? 0),
          0
        )
        if (available <= 0) {
          skippedCount++
          continue
        }

        addToCart(product, item.quantity, item.size ?? undefined, item.color ?? undefined)
        addedCount++
      }

      if (addedCount > 0) {
        toast.success('Productos añadidos al carrito')
      }
      if (skippedCount > 0) {
        const plural = skippedCount !== 1
        toast(
          `${skippedCount} producto${plural ? 's' : ''} sin stock no ${plural ? 'fueron' : 'fue'} añadido${plural ? 's' : ''}`,
          { icon: '⚠️' }
        )
      }
    } catch (err) {
      console.error('Error al reordenar:', err)
      toast.error('Error al añadir productos al carrito')
    } finally {
      setIsReordering(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <ShoppingBag className="w-5 h-5 text-[#c89b6e] flex-shrink-0" />
          <span className="font-mono font-bold text-gray-800 text-sm">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}
          >
            {status.label}
          </span>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{date}</span>
      </div>

      {/* Lista de productos */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="space-y-3 mb-4 border-t border-gray-50 pt-4">
          {order.order_items.map((item) => {
            const product = resolveProduct(item)
            return (
              <div key={item.id} className="flex items-start gap-3">
                <ItemImage item={item} />
                <div className="flex-1 min-w-0">
                  {product ? (
                    <Link
                      href={`/producto/${product.id}`}
                      className="block font-semibold text-sm text-gray-800 hover:text-[#c89b6e] transition-colors leading-tight line-clamp-2"
                    >
                      {product.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-sm text-gray-800">Producto</span>
                  )}
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                    {shouldShowSize(item.size) && (
                      <span className="text-xs text-gray-500">Talla: {item.size}</span>
                    )}
                    {item.color && (
                      <span className="text-xs text-gray-500">Color: {item.color}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Cantidad: {item.quantity}</span>
                    <span className="text-xs font-semibold text-[#333333]">
                      Bs {(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pie de tarjeta */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-500 italic mb-1">{status.message}</p>
          <p className="text-base font-black text-[#333333]">Total: Bs {order.total.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/59176020369?text=Hola,%20quiero%20consultar%20mi%20pedido%20%23${order.id.slice(0, 8).toUpperCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
          >
            Ver seguimiento
          </a>
          <button
            onClick={handleReorder}
            disabled={isReordering}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#c89b6e] hover:bg-[#b8895e] text-white rounded-lg transition-all disabled:opacity-60"
          >
            {isReordering ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            Comprar de nuevo
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function GuestSearch() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [searched, setSearched] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setSearched(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select(ORDER_SELECT)
        .eq('customer_email', email.trim().toLowerCase())
        .order('created_at', { ascending: false })

      setOrders((data as unknown as Order[]) ?? [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Busca tu pedido con tu email:
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@gmail.com"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c89b6e] focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 bg-[#333333] hover:bg-black text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Buscar
            </button>
          </form>
        </div>

        {searched && !isLoading && orders !== null && (
          <div className="space-y-4 mb-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No encontramos pedidos con ese email</p>
                <p className="text-sm mt-1">
                  Verifica el email o{' '}
                  <a
                    href="https://wa.me/59176020369?text=Hola,%20quiero%20consultar%20mi%20pedido"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25d366] hover:underline font-medium"
                  >
                    contáctanos por WhatsApp
                  </a>
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado
                  {orders.length !== 1 ? 's' : ''}
                </p>
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">o</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsAuthOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#333333] hover:text-[#c89b6e] transition-colors"
          >
            Iniciar sesión
          </button>
          <span className="text-sm text-gray-500 ml-1">
            para ver todos tus pedidos en un lugar
          </span>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode="login"
      />
    </>
  )
}

function AuthenticatedOrders({ email }: { email: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('orders')
          .select(ORDER_SELECT)
          .eq('customer_email', email)
          .order('created_at', { ascending: false })

        setOrders((data as unknown as Order[]) ?? [])
      } catch (err) {
        console.error('Error fetching orders:', err)
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [email])

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#c89b6e]" />
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 max-w-sm mx-auto">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-semibold text-gray-700 mb-2">Aún no tienes pedidos</p>
        <p className="text-sm mb-6">
          Cuando realices tu primera compra, aparecerá aquí.
        </p>
        <Link
          href="/#catalogo"
          className="inline-block bg-[#c89b6e] hover:bg-[#b8895e] text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
        >
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        {orders.length} pedido{orders.length !== 1 ? 's' : ''} en tu historial
      </p>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

export default function MisPedidosPage() {
  const { isLoggedIn, isLoading, user, customerName } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-7 h-7 text-[#c89b6e]" />
            <h1 className="text-3xl font-black text-[#333333] tracking-tight">Mis Pedidos</h1>
          </div>
          {isLoggedIn && customerName && (
            <p className="text-gray-500 text-sm">
              Hola, <strong>{customerName}</strong> — aquí están todos tus pedidos
            </p>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#c89b6e]" />
          </div>
        ) : isLoggedIn && user?.email ? (
          <AuthenticatedOrders email={user.email} />
        ) : (
          <GuestSearch />
        )}
      </div>
    </div>
  )
}
