import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId } = body

    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
      return NextResponse.json({ error: 'orderId inválido' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.rpc('reserve_order_inventory', {
      p_order_id: orderId.trim(),
    })

    if (error) {
      console.error('[api/reserve-order] reserve_order_inventory error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno del servidor'
    console.error('[api/reserve-order] Error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
