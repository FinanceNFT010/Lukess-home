import { createClient } from '@/lib/supabase/server'
import Container from "@/components/ui/Container";
import HeroSection from "@/components/home/HeroSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import PuestosSection from "@/components/home/PuestosSection";
import { CatalogoClient } from "@/components/home/CatalogoClient";
import TestimoniosSection from "@/components/home/TestimoniosSection";
import UbicacionSection from "@/components/home/UbicacionSection";
import CTAFinalSection from "@/components/home/CTAFinalSection";
import { CountdownTimer } from "@/components/marketing/CountdownTimer";
import { NewsletterPopup } from "@/components/marketing/NewsletterPopup";

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
          reserved_qty,
          location_id,
          locations(name)
        )
      `)
      .eq('is_active', true)
      .eq('published_to_landing', true)
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
  
  // Fecha objetivo para countdown (3 días desde ahora)
  const countdownDate = new Date()
  countdownDate.setDate(countdownDate.getDate() + 3)
  
  return (
    <>
      <HeroSection />
      
      {/* Banner rotativo promocional */}
      <section className="py-8 bg-gray-50">
        <Container>
          <PromoBanner />
        </Container>
      </section>
      
      {/* Countdown timer */}
      <section className="py-6">
        <Container>
          <CountdownTimer 
            targetDate={countdownDate}
            message="Cyber Week termina en"
          />
        </Container>
      </section>
      
      <PuestosSection />
      <CatalogoClient initialProducts={products} />
      <TestimoniosSection />
      <UbicacionSection />
      <CTAFinalSection />
      
      {/* Popup newsletter */}
      <NewsletterPopup />
    </>
  );
}
