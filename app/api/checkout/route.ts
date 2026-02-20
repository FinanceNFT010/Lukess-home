import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Rate limiting en memoria ──────────────────────────────────────────────────
// Simple Map por email e IP. Se resetea al reiniciar el servidor.
// Para producción con múltiples instancias, usar Redis (Upstash).

interface RateLimitEntry {
  count: number
  resetAt: number
}

const emailAttempts = new Map<string, RateLimitEntry>()
const ipAttempts = new Map<string, RateLimitEntry>()

const MAX_PER_EMAIL = 3   // max órdenes por email por hora
const MAX_PER_IP = 5      // max órdenes por IP por hora
const WINDOW_MS = 60 * 60 * 1000 // 1 hora

function checkRateLimit(map: Map<string, RateLimitEntry>, key: string, max: number): boolean {
  const now = Date.now()
  const entry = map.get(key)

  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= max) return false

  entry.count++
  return true
}

// ── Validaciones ──────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string): boolean {
  return /^[0-9]{7,8}$/.test(phone)
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      website, // honeypot
      customer_name,
      customer_phone,
      customer_email,
      marketing_consent,
      total,
      items,
    } = body

    // A) Honeypot — bots llenan este campo, humanos no lo ven
    if (website && website !== '') {
      return NextResponse.json({ error: 'Bad request', code: 'honeypot' }, { status: 400 })
    }

    // B) Validaciones mínimas de datos
    if (!customer_name || customer_name.trim().length < 3) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 3 caracteres', code: 'invalid_name' },
        { status: 400 }
      )
    }

    if (!isValidPhone(customer_phone)) {
      return NextResponse.json(
        { error: 'Número de teléfono inválido (7-8 dígitos)', code: 'invalid_phone' },
        { status: 400 }
      )
    }

    if (!isValidEmail(customer_email)) {
      return NextResponse.json(
        { error: 'Email inválido', code: 'invalid_email' },
        { status: 400 }
      )
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: 'El total del pedido debe ser mayor a 0', code: 'invalid_total' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío', code: 'empty_cart' },
        { status: 400 }
      )
    }

    // C) Rate limiting por email e IP
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (!checkRateLimit(emailAttempts, customer_email.toLowerCase(), MAX_PER_EMAIL)) {
      return NextResponse.json(
        {
          error: 'Demasiados pedidos. Intenta de nuevo en una hora.',
          code: 'rate_limit_email',
        },
        { status: 429 }
      )
    }

    if (!checkRateLimit(ipAttempts, ip, MAX_PER_IP)) {
      return NextResponse.json(
        {
          error: 'Demasiados pedidos. Intenta de nuevo en una hora.',
          code: 'rate_limit_ip',
        },
        { status: 429 }
      )
    }

    // D) Crear la orden en Supabase con service role (server-side)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upsert customer
    const { data: customer } = await supabase
      .from('customers')
      .upsert(
        {
          email: customer_email,
          name: customer_name.trim(),
          phone: customer_phone,
          marketing_consent: marketing_consent ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    // Upsert subscriber si hay consentimiento
    if (marketing_consent) {
      await supabase
        .from('subscribers')
        .upsert(
          {
            email: customer_email,
            name: customer_name.trim(),
            source: 'checkout',
          },
          { onConflict: 'email', ignoreDuplicates: true }
        )
    }

    // Crear orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer?.id || null,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone,
        customer_email: customer_email,
        marketing_consent: marketing_consent ?? false,
        subtotal: total,
        discount: 0,
        total: total,
        status: 'pending',
        payment_method: 'qr',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Crear items de la orden
    const orderItems = items.map(
      (item: {
        product_id: string
        quantity: number
        unit_price: number
        size: string | null
        color: string | null
        subtotal: number
      }) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        size: item.size || null,
        color: item.color || null,
        subtotal: item.subtotal,
      })
    )

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno del servidor'
    console.error('[api/checkout] Error:', error)
    return NextResponse.json({ error: msg, code: 'server_error' }, { status: 500 })
  }
}
