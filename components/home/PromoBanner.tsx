'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const promos = [
  {
    id: 1,
    title: '20% OFF en Camisas Columbia',
    subtitle: 'Solo por tiempo limitado',
    cta: 'Comprar ahora',
    href: '/#catalogo',
    filter: 'camisas-columbia',
    bg: 'linear-gradient(135deg, #1A1A1A 0%, #8B7355 100%)',
    textColor: 'white',
  },
  {
    id: 2,
    title: 'Nueva Colección Primavera',
    subtitle: 'Blazers desde Bs 450',
    cta: 'Ver colección',
    href: '/#catalogo',
    filter: 'blazers',
    bg: 'linear-gradient(135deg, #D4A574 0%, #8B7355 100%)',
    textColor: 'white',
  },
  {
    id: 3,
    title: 'Envío Gratis',
    subtitle: 'En compras mayores a Bs 300',
    cta: 'Más información',
    href: '/#contacto',
    filter: null,
    bg: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    textColor: 'white',
  },
]

export function PromoBanner() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToNext = () => setCurrent((current + 1) % promos.length)
  const goToPrev = () => setCurrent((current - 1 + promos.length) % promos.length)

  const handlePromoClick = (e: React.MouseEvent, promo: typeof promos[0]) => {
    e.preventDefault()
    const id = promo.href.replace('/#', '')
    const element = document.getElementById(id)
    
    if (element) {
      const navbarHeight = 80
      const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight
      window.scrollTo({ top, behavior: 'smooth' })
      
      // Aplicar filtro si existe
      if (promo.filter) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('applyPromoFilter', { detail: promo.filter }))
        }, 500)
      }
    }
  }

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl mb-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 flex items-center justify-center text-center px-6"
          style={{
            background: promos[current].bg,
            color: promos[current].textColor,
          }}
        >
          <div className="max-w-2xl space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              {promos[current].title}
            </h2>
            <p className="text-xl md:text-2xl opacity-90">
              {promos[current].subtitle}
            </p>
            <Link
              href={promos[current].href}
              onClick={(e) => handlePromoClick(e, promos[current])}
              className="inline-block bg-white text-primary-800 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg"
            >
              {promos[current].cta}
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navegación */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        aria-label="Banner anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        aria-label="Banner siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? 'bg-white w-8' : 'bg-white/50 w-2'
            }`}
            aria-label={`Ir a banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
