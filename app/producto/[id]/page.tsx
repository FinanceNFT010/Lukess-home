import { createClient } from '@/lib/supabase/server'
import { ProductDetail } from '@/components/producto/ProductDetail'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener producto
  const { data: product } = await supabase
    .from('products')
    .select(
      `
      *,
      categories(name),
      inventory(
        quantity,
        location_id,
        locations(name)
      )
    `
    )
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  // Obtener productos relacionados (misma categoría)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select(
      `
      *,
      categories(name),
      inventory(quantity)
    `
    )
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', id)
    .limit(4)

  return (
    <ProductDetail product={product} relatedProducts={relatedProducts || []} />
  )
}
