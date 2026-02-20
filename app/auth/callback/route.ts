import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  const buildRedirectUrl = (path: string) => {
    if (isLocalEnv) return `${origin}${path}`
    if (forwardedHost) return `https://${forwardedHost}${path}`
    return `${origin}${path}`
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Upsert customer record linked to auth user
      await supabase.from('customers').upsert(
        {
          email: data.user.email!,
          name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            null,
          auth_user_id: data.user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false,
        }
      )

      return NextResponse.redirect(buildRedirectUrl(next))
    }
  }

  return NextResponse.redirect(buildRedirectUrl('/?error=auth'))
}
