import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

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
      user_id,
      customer_name,
      customer_phone,
      customer_email,
      marketing_consent,
      subtotal,
      shipping_cost,
      total,
      delivery_method,
      shipping_address,
      shipping_reference,
      pickup_location,
      gps_lat,
      gps_lng,
      gps_distance_km,
      maps_link,
      recipient_name,
      recipient_phone,
      delivery_instructions,
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

    // Upsert customer — si hay user_id (logueado), vincular auth_user_id
    let customerId: string | null = null

    if (user_id) {
      // Buscar customer existente por auth_user_id
      const { data: existingByAuth } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user_id)
        .maybeSingle()

      if (existingByAuth) {
        customerId = existingByAuth.id
        // Actualizar datos del formulario en el registro existente
        await supabase
          .from('customers')
          .update({
            name: customer_name.trim(),
            phone: customer_phone,
            email: customer_email,
            marketing_consent: marketing_consent ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customerId)
      } else {
        // Crear nuevo customer vinculado al auth user
        const { data: newCustomer } = await supabase
          .from('customers')
          .upsert(
            {
              email: customer_email,
              name: customer_name.trim(),
              phone: customer_phone,
              auth_user_id: user_id,
              marketing_consent: marketing_consent ?? false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email', ignoreDuplicates: false }
          )
          .select('id')
          .single()
        customerId = newCustomer?.id ?? null
      }
    } else {
      // Guest checkout — upsert por email sin vincular auth_user_id
      const { data: guestCustomer } = await supabase
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
      customerId = guestCustomer?.id ?? null
    }

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
        customer_id: customerId,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone,
        customer_email: customer_email,
        marketing_consent: marketing_consent ?? false,
        subtotal: subtotal ?? total,
        discount: 0,
        shipping_cost: shipping_cost ?? 0,
        total: total,
        status: 'pending',
        payment_method: 'qr',
        delivery_method: delivery_method ?? 'delivery',
        shipping_address: shipping_address ?? null,
        shipping_reference: shipping_reference ?? null,
        pickup_location: pickup_location ?? null,
        gps_lat: gps_lat ?? null,
        gps_lng: gps_lng ?? null,
        gps_distance_km: gps_distance_km ?? null,
        maps_link: maps_link ?? null,
        recipient_name: recipient_name ?? null,
        recipient_phone: recipient_phone ?? null,
        delivery_instructions: delivery_instructions ?? null,
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

    // Reservar inventario ahora que los order_items ya existen.
    // El trigger INSERT no puede hacerlo porque dispara antes de que se
    // inserten los items. Llamamos el RPC directamente después de ambos inserts.
    const { error: reserveError } = await supabase.rpc('reserve_order_inventory', {
      p_order_id: order.id,
    })

    if (reserveError) {
      // No es fatal: el pedido se creó; la reserva fallará silenciosamente
      // y el trigger UPDATE lo reintentará si el admin cambia el estado.
      console.error('[api/checkout] reserve_order_inventory error:', reserveError.message)
    }

    revalidatePath('/', 'page')
    revalidatePath('/producto/[id]', 'page')

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
