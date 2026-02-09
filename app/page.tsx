import { createClient } from '@/lib/supabase/server'
import HeroSection from "@/components/home/HeroSection";
import PuestosSection from "@/components/home/PuestosSection";
import { CatalogoClient } from "@/components/home/CatalogoClient";
import TestimoniosSection from "@/components/home/TestimoniosSection";
import UbicacionSection from "@/components/home/UbicacionSection";
import CTAFinalSection from "@/components/home/CTAFinalSection";

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch productos del inventario real de Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      inventory(
        quantity,
        location_id,
        locations(name)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
  }
  
  // Log para debugging en Vercel
  console.log('Products fetched:', {
    count: products?.length || 0,
    hasError: !!error,
    errorMessage: error?.message
  })
  
  return (
    <>
      <HeroSection />
      <PuestosSection />
      <CatalogoClient initialProducts={products || []} />
      <TestimoniosSection />
      <UbicacionSection />
      <CTAFinalSection />
    </>
  );
}
