import { createClient } from '@/lib/supabase/server'
import HeroSection from "@/components/home/HeroSection";
import PuestosSection from "@/components/home/PuestosSection";
import { CatalogoClient } from "@/components/home/CatalogoClient";
import TestimoniosSection from "@/components/home/TestimoniosSection";
import UbicacionSection from "@/components/home/UbicacionSection";
import CTAFinalSection from "@/components/home/CTAFinalSection";

export default async function Home() {
  let products = []
  
  try {
    const supabase = await createClient()
    
    // Fetch productos del inventario real de Supabase
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
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching products:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    } else {
      products = data || []
      console.log('✅ Products fetched successfully:', {
        count: products.length,
        firstProduct: products[0]?.name
      })
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message)
  }
  
  return (
    <>
      <HeroSection />
      <PuestosSection />
      <CatalogoClient initialProducts={products} />
      <TestimoniosSection />
      <UbicacionSection />
      <CTAFinalSection />
    </>
  );
}
