import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// TODO Bloque 6b-1 parte 2:
// En lukess-inventory-system/order-detail-modal.tsx
// agregar sección "Comprobante de pago" que muestre
// la imagen si orders.payment_receipt_url !== null
// Usar supabaseAdmin para generar signed URL
// (bucket es privado, no público)

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const orderId = formData.get('orderId') as string | null

    if (!orderId || !orderId.trim()) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Solo se aceptan imágenes (JPG, PNG, WebP)' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'La imagen no puede superar los 5 MB' },
        { status: 400 },
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${orderId}-${Date.now()}.${ext}`

    const supabase = getSupabaseAdmin()

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload-receipt] Storage error:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir el archivo. Intenta de nuevo.' },
        { status: 500 },
      )
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_receipt_url: fileName })
      .eq('id', orderId)

    if (updateError) {
      console.error('[upload-receipt] DB update error:', updateError)
      return NextResponse.json(
        { error: 'Archivo subido pero no se pudo registrar. Contacta soporte.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, url: fileName })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno del servidor'
    console.error('[upload-receipt] Error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
