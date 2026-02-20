'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Search, Loader2, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import Link from 'next/link'
import { AuthModal } from '@/components/auth/AuthModal'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'

interface OrderItem {
  quantity: number
  unit_price: number
  products?: { name: string } | { name: string }[] | null
}

interface Order {
  id: string
  created_at: string
  status: OrderStatus
  total: number
  order_items?: OrderItem[]
}

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

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const date = new Date(order.created_at).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#c89b6e] flex-shrink-0" />
          <span className="font-mono font-bold text-gray-800 text-sm">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-gray-500">{date}</span>
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}
        >
          {status.label}
        </span>
        <span className="text-sm text-gray-600">
          {itemCount} producto{itemCount !== 1 ? 's' : ''}
        </span>
        <span className="text-sm font-bold text-[#333333]">
          Bs {order.total.toFixed(2)}
        </span>
      </div>

      <p className="text-xs text-gray-500 italic">{status.message}</p>
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
        .select(`
          id,
          created_at,
          status,
          total,
          order_items (
            quantity,
            unit_price,
            products (name)
          )
        `)
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
        {/* Search form */}
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

        {/* Results */}
        {searched && !isLoading && orders !== null && (
          <div className="space-y-3 mb-6">
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
                  {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
                </p>
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">o</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Login CTA */}
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

  useState(() => {
    const fetchOrders = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total,
            order_items (
              quantity,
              unit_price,
              products (name)
            )
          `)
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
  })

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
        <p className="text-lg font-semibold text-gray-700 mb-2">
          Aún no tienes pedidos
        </p>
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
    <div className="max-w-lg mx-auto space-y-3">
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-7 h-7 text-[#c89b6e]" />
            <h1 className="text-3xl font-black text-[#333333] tracking-tight">
              Mis Pedidos
            </h1>
          </div>
          {isLoggedIn && customerName && (
            <p className="text-gray-500 text-sm">
              Hola, <strong>{customerName}</strong> — aquí están todos tus pedidos
            </p>
          )}
        </motion.div>

        {/* Content */}
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
