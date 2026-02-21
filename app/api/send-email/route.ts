import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  product: {
    name: string
    price: number
  }
  quantity: number
  size?: string | null
  color?: string | null
}

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items?: OrderItem[]
  subtotal?: number
  shippingCost?: number
  shippingDistance?: number | null
  deliveryAddress?: string | null
  discountAmount?: number
  discountCode?: string | null
  total: number
  notifyByEmail?: boolean
  notifyByWhatsapp?: boolean
}

// ── Shared HTML primitives ─────────────────────────────────────────────────────

function buildHeader(): string {
  return `
    <tr>
      <td style="background-color: #111111; padding: 32px 40px; text-align: center; border-bottom: 3px solid #D4AF37;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase;">LUKESS HOME</h1>
        <p style="margin: 6px 0 0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Mercado Mutualista · Santa Cruz, Bolivia</p>
      </td>
    </tr>
  `
}

function buildOrderNumber(orderId: string): string {
  const shortId = orderId.slice(0, 8).toUpperCase()
  return `
    <tr>
      <td style="padding: 20px 40px 0;">
        <div style="background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px 20px;">
          <p style="margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1.5px;">Número de orden</p>
          <p style="margin: 6px 0 0; font-size: 24px; font-weight: 900; color: #D4AF37; font-family: 'Courier New', monospace; letter-spacing: 3px;">#${shortId}</p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #555; font-family: 'Courier New', monospace;">${orderId}</p>
        </div>
      </td>
    </tr>
  `
}

function buildItemsTable(items: OrderItem[]): string {
  const rows = items
    .map((item) => {
      const details = [item.size, item.color].filter(Boolean).join(' · ')
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #e0e0e0; font-size: 14px;">
            ${item.product.name}${details ? `<br><span style="color: #888; font-size: 12px;">${details}</span>` : ''}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #e0e0e0; text-align: center; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #e0e0e0; text-align: right; font-size: 14px; white-space: nowrap;">Bs ${item.product.price.toFixed(2)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; color: #D4AF37; text-align: right; font-size: 14px; font-weight: bold; white-space: nowrap;">Bs ${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    })
    .join('')

  return `
    <tr>
      <td style="padding: 24px 40px 0;">
        <p style="margin: 0 0 12px; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1.5px;">Detalle del pedido</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #333;">
          <thead>
            <tr style="background-color: #1a1a1a;">
              <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 1px solid #333;">Producto</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 1px solid #333;">Cant.</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 1px solid #333;">Precio</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 1px solid #333;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </td>
    </tr>
  `
}

function buildCostBreakdown(data: OrderEmailData): string {
  const subtotal = data.subtotal ?? data.total
  const shipping = data.shippingCost ?? 0
  const discount = data.discountAmount ?? 0
  const hasShipping = shipping > 0
  const hasDiscount = discount > 0
  const isPickup = shipping === 0 && data.shippingDistance == null

  const shippingLabel = isPickup
    ? 'Retiro en tienda'
    : data.shippingDistance != null
      ? `Costo de envío (${data.shippingDistance.toFixed(1)} km)`
      : 'Costo de envío'

  const shippingValue = isPickup
    ? '<span style="color: #4caf50; font-weight: 700;">Gratis</span>'
    : hasShipping
      ? `Bs ${shipping.toFixed(2)}`
      : '<span style="color: #4caf50; font-weight: 700;">Gratis</span>'

  const mapsUrl = data.deliveryAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.deliveryAddress)}`
    : null

  return `
    <tr>
      <td style="padding: 16px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #333; border-radius: 8px; overflow: hidden;">
          <!-- Subtotal productos -->
          <tr style="background-color: #1a1a1a;">
            <td style="padding: 10px 16px; color: #aaa; font-size: 13px; border-bottom: 1px solid #2a2a2a;">Productos</td>
            <td style="padding: 10px 16px; color: #e0e0e0; font-size: 13px; text-align: right; border-bottom: 1px solid #2a2a2a; white-space: nowrap;">Bs ${subtotal.toFixed(2)}</td>
          </tr>
          <!-- Envío -->
          <tr style="background-color: #1a1a1a;">
            <td style="padding: 10px 16px; color: #aaa; font-size: 13px; border-bottom: ${hasDiscount ? '1px solid #2a2a2a' : '0'};">${shippingLabel}</td>
            <td style="padding: 10px 16px; font-size: 13px; text-align: right; border-bottom: ${hasDiscount ? '1px solid #2a2a2a' : '0'}; white-space: nowrap;">${shippingValue}</td>
          </tr>
          ${hasDiscount ? `
          <!-- Descuento -->
          <tr style="background-color: #1a1a1a;">
            <td style="padding: 10px 16px; color: #aaa; font-size: 13px; border-bottom: 0;">
              Descuento${data.discountCode ? ` <span style="color: #D4AF37; font-family: 'Courier New', monospace; font-size: 11px;">[${data.discountCode}]</span>` : ''}
            </td>
            <td style="padding: 10px 16px; color: #4caf50; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 0; white-space: nowrap;">- Bs ${discount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <!-- Total -->
          <tr style="background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);">
            <td style="padding: 14px 16px; color: #aaa; font-size: 14px; font-weight: 700; border-top: 2px solid #D4AF37;">Total a pagar</td>
            <td style="padding: 14px 16px; color: #D4AF37; font-size: 26px; font-weight: 900; text-align: right; border-top: 2px solid #D4AF37; white-space: nowrap;">Bs ${data.total.toFixed(2)}</td>
          </tr>
        </table>
        ${mapsUrl ? `
        <div style="margin-top: 10px; text-align: center;">
          <a href="${mapsUrl}" target="_blank" style="display: inline-block; background-color: #1a3a1a; border: 1px solid #2d6a2d; border-radius: 8px; padding: 10px 20px; color: #4caf50; font-size: 13px; font-weight: 600; text-decoration: none;">
            📍 Ver ubicación de entrega
          </a>
        </div>
        ` : ''}
      </td>
    </tr>
  `
}

function buildWhatsappCta(): string {
  return `
    <tr>
      <td style="padding: 24px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #1a2e1a; border: 1px solid #2d5a2d; border-radius: 8px; padding: 16px 20px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #aaa;">¿Tenés dudas sobre tu pedido?</p>
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #4caf50;">💬 WhatsApp: +591 76020369</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

function buildFooter(): string {
  return `
    <tr>
      <td style="padding: 28px 40px 32px; text-align: center; border-top: 1px solid #2a2a2a; margin-top: 28px;">
        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #D4AF37; letter-spacing: 2px; text-transform: uppercase;">LUKESS HOME</p>
        <p style="margin: 6px 0 0; font-size: 12px; color: #555;">Mercado Mutualista, Santa Cruz, Bolivia</p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #444;">Este email fue enviado porque realizaste un pedido en lukess-home.vercel.app</p>
      </td>
    </tr>
  `
}

function wrapEmail(rows: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #1a1a1a; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #222222; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.5);">
          ${rows}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Email builders ─────────────────────────────────────────────────────────────

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const stepsHtml = [
    { n: '1', icon: '💳', title: 'Confirmamos tu pago', desc: 'Puede tomar unos minutos mientras verificamos la transferencia.' },
    { n: '2', icon: '📦', title: 'Preparamos tu pedido', desc: 'Seleccionamos y empacamos tus productos con cuidado.' },
    { n: '3', icon: '🛵', title: 'Coordinamos la entrega con Yango', desc: 'Te contactaremos por WhatsApp antes de enviar.' },
    { n: '4', icon: '🎉', title: '¡Tu pedido llega a tu puerta!', desc: 'Recibirás tu pedido en la dirección que indicaste.' },
  ].map(step => `
    <tr>
      <td style="padding: 12px 16px; background-color: #1a1a1a; border-radius: 8px; border-left: 3px solid #D4AF37;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 32px; vertical-align: middle;">
              <span style="display: inline-block; width: 24px; height: 24px; background-color: #D4AF37; color: #111; border-radius: 50%; text-align: center; line-height: 24px; font-size: 11px; font-weight: 900;">${step.n}</span>
            </td>
            <td style="padding-left: 12px; vertical-align: middle;">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #e0e0e0;">${step.icon} ${step.title}</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #777;">${step.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  const rows = `
    ${buildHeader()}
    <tr>
      <td style="padding: 28px 40px 0; text-align: center;">
        <div style="display: inline-block; background-color: #1a3a1a; border: 1px solid #2d6a2d; border-radius: 999px; padding: 8px 20px;">
          <span style="color: #4caf50; font-size: 13px; font-weight: 600;">✅ Pedido recibido correctamente</span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px 0;">
        <p style="margin: 0; font-size: 22px; font-weight: 700; color: #f0f0f0;">Hola ${data.customerName},</p>
        <p style="margin: 12px 0 0; font-size: 15px; color: #aaaaaa; line-height: 1.6;">
          Recibimos tu pedido correctamente. En breve confirmaremos tu pago y prepararemos todo para que llegue a tus manos.
        </p>
      </td>
    </tr>
    ${buildOrderNumber(data.orderId)}
    ${data.items && data.items.length > 0 ? buildItemsTable(data.items) : ''}
    ${buildCostBreakdown(data)}
    <tr>
      <td style="padding: 28px 40px 0;">
        <p style="margin: 0 0 16px; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1.5px;">¿Qué sigue?</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0 8px;">
          ${stepsHtml}
        </table>
      </td>
    </tr>
    ${buildWhatsappCta()}
    ${buildFooter()}
  `

  return wrapEmail(rows)
}

function buildStatusEmailHtml(
  data: OrderEmailData,
  badge: string,
  badgeBg: string,
  badgeBorder: string,
  badgeColor: string,
  message: string,
): string {
  const rows = `
    ${buildHeader()}
    <tr>
      <td style="padding: 28px 40px 0; text-align: center;">
        <div style="display: inline-block; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 999px; padding: 8px 20px;">
          <span style="color: ${badgeColor}; font-size: 13px; font-weight: 600;">${badge}</span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px 0;">
        <p style="margin: 0; font-size: 22px; font-weight: 700; color: #f0f0f0;">Hola ${data.customerName},</p>
        <p style="margin: 12px 0 0; font-size: 15px; color: #aaaaaa; line-height: 1.6;">${message}</p>
      </td>
    </tr>
    ${buildOrderNumber(data.orderId)}
    ${data.items && data.items.length > 0 ? buildItemsTable(data.items) : ''}
    ${buildCostBreakdown(data)}
    ${buildWhatsappCta()}
    ${buildFooter()}
  `

  return wrapEmail(rows)
}

// ── POST handler ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, orderData } = body as { type: string; orderData: OrderEmailData }

    if (!orderData?.customerEmail) {
      return NextResponse.json({ error: 'Email del cliente requerido' }, { status: 400 })
    }

    const shortId = orderData.orderId.slice(0, 8).toUpperCase()

    let subject = ''
    let html = ''

    switch (type) {
      case 'order_confirmation':
        subject = `✅ Pedido #${shortId} recibido — Lukess Home`
        html = buildOrderConfirmationHtml(orderData)
        break

      case 'order_paid':
        subject = `💳 Pago confirmado — Pedido #${shortId} | Lukess Home`
        html = buildStatusEmailHtml(
          orderData,
          '💳 Pago confirmado',
          '#1a2e1a',
          '#2d5a2d',
          '#4caf50',
          '¡Tu pago fue confirmado! Ya estamos preparando tu pedido con todo el cuidado que merece.',
        )
        break

      case 'order_shipped':
        subject = `🛵 Tu pedido está en camino — Lukess Home`
        html = buildStatusEmailHtml(
          orderData,
          '🛵 En camino',
          '#1a2332',
          '#2d4a6a',
          '#60a5fa',
          'Tu pedido ya salió y está en camino. El repartidor de Yango está llevando tu pedido. Pronto llegará a tu puerta.',
        )
        break

      case 'order_completed':
        subject = `✅ Pedido entregado — ¡Gracias por tu compra! | Lukess Home`
        html = buildStatusEmailHtml(
          orderData,
          '✅ Pedido entregado',
          '#1a3a1a',
          '#2d6a2d',
          '#4caf50',
          '¡Tu pedido fue entregado con éxito! Gracias por confiar en Lukess Home. Esperamos verte pronto.',
        )
        break

      case 'order_cancelled':
        subject = `❌ Pedido #${shortId} cancelado | Lukess Home`
        html = buildStatusEmailHtml(
          orderData,
          '❌ Pedido cancelado',
          '#3a1a1a',
          '#6a2d2d',
          '#f87171',
          'Tu pedido fue cancelado. Si tenés dudas contáctanos por WhatsApp +591 76020369.',
        )
        break

      default:
        return NextResponse.json({ error: `Tipo de email desconocido: ${type}` }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'Lukess Home <onboarding@resend.dev>',
      to: orderData.customerEmail,
      subject,
      html,
    })

    if (error) {
      console.error('[send-email] Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    console.error('[send-email] Error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
