import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  const corsHeaders = new Headers(CORS_HEADERS)

  try {
    const body = await req.json()
    const { to, templateName, variables } = body as {
      to: string
      templateName: string
      variables: string[]
    }

    if (!to || !templateName || !Array.isArray(variables)) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: to, templateName, variables' },
        { status: 400, headers: corsHeaders },
      )
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const version = process.env.WHATSAPP_API_VERSION ?? 'v21.0'

    if (!phoneNumberId || !accessToken) {
      console.error('[send-whatsapp] Faltan variables de entorno WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN')
      return NextResponse.json(
        { error: 'Configuración de WhatsApp incompleta' },
        { status: 500, headers: corsHeaders },
      )
    }

    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'es' },
        components: [
          {
            type: 'body',
            parameters: variables.map((v) => ({
              type: 'text',
              text: v,
            })),
          },
        ],
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    console.log('[send-whatsapp] Respuesta Meta API:', JSON.stringify(data))

    if (!response.ok) {
      console.error('[send-whatsapp] Error de Meta API:', data)
      return NextResponse.json(
        { error: data?.error?.message ?? 'Error al enviar WhatsApp' },
        { status: response.status, headers: corsHeaders },
      )
    }

    return NextResponse.json({ success: true, data }, { headers: corsHeaders })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    console.error('[send-whatsapp] Error:', error)
    return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders })
  }
}
