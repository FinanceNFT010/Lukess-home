'use client'
import { useState, useMemo } from 'react'
import Container from '@/components/ui/Container'
import { ShoppingCart, ShoppingBag, Tag, MessageCircle, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import toast from 'react-hot-toast'

interface CatalogoClientProps {
  initialProducts: Product[]
}

/* ───────── Variantes de animación ───────── */

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
} as const

const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
}

export function CatalogoClient({ initialProducts }: CatalogoClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const { addToCart } = useCart()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 })

  // Extraer categorías únicas
  const categories = useMemo(() => {
    const cats = new Set<string>()
    initialProducts.forEach(p => {
      if (p.categories?.name) cats.add(p.categories.name)
    })
    return ['Todos', ...Array.from(cats).sort()]
  }, [initialProducts])

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') return initialProducts
    return initialProducts.filter(p => p.categories?.name === selectedCategory)
  }, [selectedCategory, initialProducts])

  // Calcular stock total
  const getTotalStock = (product: Product): number => {
    return product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
  }

  const handleAddToCart = (product: Product) => {
    const stock = getTotalStock(product)
    if (stock === 0) {
      toast.error('Producto sin stock')
      return
    }
    
    addToCart(product, 1)
    toast.success(`${product.name} agregado al carrito`)
  }

  const handleWhatsAppConsult = (product: Product) => {
    const message = encodeURIComponent(
      `Hola! Estoy interesado en:\n\n` +
      `📦 ${product.name}\n` +
      `💰 Precio: Bs ${product.price.toFixed(2)}\n\n` +
      `¿Tienen disponible?`
    )
    window.open(`https://wa.me/59176020369?text=${message}`, '_blank')
  }

  return (
    <section id="catalogo" className="py-20 md:py-28 bg-white">
      <Container>
        <motion.div
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* ── Encabezado ── */}
          <motion.div
            variants={headingVariants}
            className="text-center mb-10 md:mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
              <ShoppingBag className="w-3.5 h-3.5" />
              Catálogo
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-800 mb-4">
              Nuestros{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                Productos
              </span>
            </h2>

            <p className="text-secondary-500 text-base md:text-lg max-w-xl mx-auto">
              Calidad y estilo para el hombre moderno
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary-300" />
            </div>
          </motion.div>

          {/* ── Filtros ── */}
          <motion.div
            variants={headingVariants}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 md:mb-14"
            role="tablist"
            aria-label="Filtrar por categoría"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                aria-label={`Filtrar por ${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold
                  transition-all duration-300
                  ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 scale-105'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 hover:text-secondary-800'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* ── Grid ── */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={selectedCategory}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={sectionVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6"
            >
              {filteredProducts.map((product) => {
                const stock = getTotalStock(product)
                const isOutOfStock = stock === 0
                
                return (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                    layout
                    className="group bg-white rounded-2xl border border-secondary-100 hover:border-primary-300 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1"
                  >
                    {/* Imagen */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-white p-4">
                      <Image
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Badge de Stock */}
                      {isOutOfStock ? (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm bg-red-600 text-white">
                          Sin Stock
                        </span>
                      ) : stock < 5 ? (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm bg-amber-500 text-white">
                          Últimas {stock}
                        </span>
                      ) : null}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-secondary-900/0 group-hover:bg-secondary-900/40 transition-all duration-300 flex items-center justify-center gap-2 p-4">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg ${
                            isOutOfStock
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-primary-500 hover:bg-primary-600 text-white'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {isOutOfStock ? 'Sin Stock' : 'Agregar'}
                        </button>
                        <button
                          onClick={() => handleWhatsAppConsult(product)}
                          className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Consultar
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 sm:p-5">
                      {/* Categoría */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Tag className="w-3 h-3 text-primary-400" aria-hidden="true" />
                        <span className="text-xs text-secondary-400 font-medium uppercase tracking-wide">
                          {product.categories?.name || 'Sin categoría'}
                        </span>
                      </div>

                      {/* Nombre */}
                      <h3 className="text-sm sm:text-base font-bold text-secondary-800 mb-1.5 leading-snug line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      {/* Descripción */}
                      {product.description && (
                        <p className="text-xs text-secondary-400 mb-3 line-clamp-2 min-h-[2rem]">
                          {product.description}
                        </p>
                      )}

                      {/* Tallas */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.sizes.slice(0, 4).map((size) => (
                            <span
                              key={size}
                              className="text-[10px] text-secondary-400 border border-secondary-200 rounded px-1.5 py-0.5"
                            >
                              {size}
                            </span>
                          ))}
                          {product.sizes.length > 4 && (
                            <span className="text-[10px] text-secondary-400 border border-secondary-200 rounded px-1.5 py-0.5">
                              +{product.sizes.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Precio + Stock */}
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-2xl font-black text-primary-500">
                            {product.price}
                          </span>
                          <span className="text-xs text-secondary-400 ml-1 font-medium">
                            Bs
                          </span>
                        </div>
                        <span className="text-xs text-secondary-500 font-medium">
                          Stock: {stock}
                        </span>
                      </div>
                    </div>

                    {/* Botones móvil */}
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 lg:hidden flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                          isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-500 hover:bg-primary-600 text-white'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isOutOfStock ? 'Sin Stock' : 'Agregar'}
                      </button>
                      <button
                        onClick={() => handleWhatsAppConsult(product)}
                        className="px-4 py-2.5 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-full transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>

          {/* ── CTA inferior ── */}
          <motion.div
            variants={headingVariants}
            className="text-center mt-12 md:mt-16"
          >
            <p className="text-secondary-400 text-sm mb-4">
              ¿No encontraste lo que buscas? Tenemos mucho más en tienda
            </p>
            <a
              href="https://wa.me/59176020369?text=Hola%20Lukess%20Home%2C%20quiero%20consultar%20sobre%20otros%20productos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-secondary-800 hover:bg-secondary-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-secondary-800/25"
            >
              <Plus className="w-4 h-4" />
              Pregunta por más productos
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
