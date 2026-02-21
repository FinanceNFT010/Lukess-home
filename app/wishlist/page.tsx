import { createClient } from '@/lib/supabase/server'
import { WishlistClient } from '@/components/wishlist/WishlistClient'

export const metadata = {
  title: 'Lista de Deseos | Lukess Home',
  description: 'Tus productos favoritos guardados',
}

export default async function WishlistPage() {
  let products = []
  
  try {
    const supabase = await createClient()
    
    // Fetch todos los productos (el cliente filtrará por IDs de wishlist)
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner(name),
        inventory(
          quantity,
          location_id,
          locations(name)
        )
      `)
      .eq('is_active', true)
      .eq('published_to_landing', true)
    
    if (error) {
      console.error('❌ Error fetching products:', error)
    } else {
      products = data || []
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message)
  }
  
  return <WishlistClient allProducts={products} />
}
