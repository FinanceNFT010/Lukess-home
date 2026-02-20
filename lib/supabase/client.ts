import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton para compatibilidad con código existente que usa `supabase` directamente
export const supabase = createClient()

// Alias para compatibilidad con código existente
export function getSupabaseClient() {
  return supabase
}
