'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import Container from '@/components/ui/Container'
import { ShoppingCart, ShoppingBag, Tag, MessageCircle, Plus, Filter, X, Palette, Ruler, Building2, SlidersHorizontal, Check, Sparkles, Percent } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import toast from 'react-hot-toast'
import { FilterSidebar, type Filters } from '@/components/catalogo/FilterSidebar'
import { ProductBadges } from '@/components/catalogo/ProductBadges'

interface CatalogoClientProps {
  initialProducts: Product[]
}

/* ───────── Variantes de animación ───────── */

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0 },
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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: 'easeIn' as const },
  },
}

// Toast personalizado que no bloquea
const showAddedToast = (productName: string) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : -20, scale: t.visible ? 1 : 0.9 }}
      className="flex items-center gap-3 bg-white border-2 border-green-200 shadow-xl rounded-xl px-4 py-3 pointer-events-none"
    >
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">Agregado al carrito</p>
        <p className="text-xs text-gray-500 truncate max-w-[180px]">{productName}</p>
      </div>
    </motion.div>
  ), { duration: 1500, position: 'bottom-center' })
}

export function CatalogoClient({ initialProducts }: CatalogoClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas')
  const [selectedColor, setSelectedColor] = useState<string>('Todos')
  const [showFilters, setShowFilters] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [sidebarFilters, setSidebarFilters] = useState<Filters>({
    priceRange: [0, 1000],
    brands: [],
    colors: [],
    sizes: [],
    inStock: null,
    category: null,
  })
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock'>('all')
  const [showNew, setShowNew] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(20) // Mostrar 20 productos inicialmente
  const { addToCart } = useCart()
  const { ref, inView } = useInView({ 
    triggerOnce: true, 
    threshold: 0.05,
    rootMargin: '50px'
  })

  // Detectar filtros desde URL hash (navbar)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.split('?')[1] || '')
      const filter = params.get('filter')
      const subcategory = params.get('subcategory')
      
      if (filter === 'nuevo') {
        setShowNew(true)
        setShowDiscount(false)
        setSelectedCategory('Todos')
      } else if (filter === 'descuento') {
        setShowDiscount(true)
        setShowNew(false)
        setSelectedCategory('Todos')
      } else if (filter === 'camisas') {
        setSelectedCategory('Camisas')
        setShowNew(false)
        setShowDiscount(false)
        if (subcategory) setSelectedBrand(subcategory)
      } else if (filter === 'pantalones') {
        setSelectedCategory('Pantalones')
        setShowNew(false)
        setShowDiscount(false)
        if (subcategory) setSelectedBrand(subcategory)
      } else if (filter === 'blazers') {
        setSelectedCategory('Blazers')
        setShowNew(false)
        setShowDiscount(false)
      } else if (filter === 'accesorios') {
        setSelectedCategory('Accesorios')
        setShowNew(false)
        setShowDiscount(false)
      }
    }
    
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Extraer categorías únicas
  const categories = useMemo(() => {
    const cats = new Set<string>()
    initialProducts.forEach(p => {
      if (p.categories?.name) cats.add(p.categories.name)
    })
    return ['Todos', ...Array.from(cats).sort()]
  }, [initialProducts])

  // Extraer marcas únicas
  const brands = useMemo(() => {
    const brandSet = new Set<string>()
    initialProducts.forEach(p => {
      if (p.brand) brandSet.add(p.brand)
    })
    return ['Todas', ...Array.from(brandSet).sort()]
  }, [initialProducts])

  // Extraer colores únicos
  const colors = useMemo(() => {
    const colorSet = new Set<string>()
    initialProducts.forEach(p => {
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach(c => colorSet.add(c))
      }
    })
    return ['Todos', ...Array.from(colorSet).sort()]
  }, [initialProducts])

  // Calcular stock total
  const getTotalStock = useCallback((product: Product): number => {
    return product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
  }, [])

  // Filtrar productos con todos los filtros
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      // Filtro por "NUEVO"
      if (showNew && !p.is_new) return false
      
      // Filtro por "DESCUENTO"
      if (showDiscount && !p.discount_percentage) return false
      
      // Filtros del sidebar - Precio
      if (p.price < sidebarFilters.priceRange[0] || p.price > sidebarFilters.priceRange[1]) return false
      
      // Filtros del sidebar - Marca
      if (sidebarFilters.brands.length > 0 && p.brand && !sidebarFilters.brands.includes(p.brand)) return false
      
      // Filtros del sidebar - Color
      if (sidebarFilters.colors.length > 0 && (!p.colors || !p.colors.some(c => sidebarFilters.colors.includes(c)))) return false
      
      // Filtros del sidebar - Talla
      if (sidebarFilters.sizes.length > 0 && (!p.sizes || !p.sizes.some(s => sidebarFilters.sizes.includes(s)))) return false
      
      // Filtros del sidebar - Stock
      const stock = getTotalStock(p)
      if (sidebarFilters.inStock && stock === 0) return false
      
      // Filtros del sidebar - Categoría
      if (sidebarFilters.category && p.categories?.name !== sidebarFilters.category) return false
      
      // Filtro por categoría (botones superiores)
      if (selectedCategory !== 'Todos' && p.categories?.name !== selectedCategory) return false
      
      // Filtro por marca (botones superiores)
      if (selectedBrand !== 'Todas' && p.brand !== selectedBrand) return false
      
      // Filtro por color (botones superiores)
      if (selectedColor !== 'Todos') {
        if (!p.colors || !p.colors.includes(selectedColor)) return false
      }
      
      // Filtro por stock (botones superiores)
      if (stockFilter === 'inStock' && stock === 0) return false
      if (stockFilter === 'lowStock' && (stock === 0 || stock >= 5)) return false
      
      return true
    })
  }, [selectedCategory, selectedBrand, selectedColor, stockFilter, showNew, showDiscount, sidebarFilters, initialProducts, getTotalStock])

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== 'Todos') count++
    if (selectedBrand !== 'Todas') count++
    if (selectedColor !== 'Todos') count++
    if (stockFilter !== 'all') count++
    if (showNew) count++
    if (showDiscount) count++
    return count
  }, [selectedCategory, selectedBrand, selectedColor, stockFilter, showNew, showDiscount])

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedCategory('Todos')
    setSelectedBrand('Todas')
    setSelectedColor('Todos')
    setStockFilter('all')
    setShowNew(false)
    setShowDiscount(false)
  }

  const handleAddToCart = (product: Product) => {
    const stock = getTotalStock(product)
    if (stock === 0) {
      toast.error('Producto sin stock', { position: 'bottom-center', duration: 1500 })
      return
    }
    
    addToCart(product, 1)
    showAddedToast(product.name)
  }

  const handleWhatsAppConsult = (product: Product) => {
    const message = encodeURIComponent(
      `Hola! Estoy interesado en:\n\n` +
      `📦 ${product.name}\n` +
      `💰 Precio: Bs ${product.price.toFixed(2)}\n` +
      `${product.brand ? `🏷️ Marca: ${product.brand}\n` : ''}` +
      `${product.colors?.length ? `🎨 Colores: ${product.colors.join(', ')}\n` : ''}` +
      `\n¿Tienen disponible?`
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

          {/* ── Barra de Filtros ── */}
          <motion.div
            variants={headingVariants}
            className="mb-8 md:mb-12"
          >
            {/* Filtros rápidos: NUEVO y DESCUENTO */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
              <button
                onClick={() => {
                  setShowNew(!showNew)
                  setShowDiscount(false)
                  setSelectedCategory('Todos')
                }}
                className={`
                  px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold
                  transition-all duration-300 flex items-center gap-2
                  ${
                    showNew
                      ? 'bg-accent-400 text-white shadow-lg shadow-accent-400/25 scale-105'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 hover:text-secondary-800'
                  }
                `}
              >
                <Sparkles className="w-4 h-4" />
                Nuevo
              </button>

              <button
                onClick={() => {
                  setShowDiscount(!showDiscount)
                  setShowNew(false)
                  setSelectedCategory('Todos')
                }}
                className={`
                  px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold
                  transition-all duration-300 flex items-center gap-2
                  ${
                    showDiscount
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/25 scale-105'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 hover:text-secondary-800'
                  }
                `}
              >
                <Percent className="w-4 h-4" />
                Descuentos
              </button>
            </div>

            {/* Categorías principales */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setShowNew(false)
                    setShowDiscount(false)
                  }}
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
            </div>

            {/* Botón de filtros avanzados + contador */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-primary-800 hover:bg-primary-900 transition-all shadow-lg"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros Avanzados
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                    : 'bg-secondary-50 text-secondary-600 border-2 border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                Más Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              )}

              <span className="text-sm text-secondary-500">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Panel de filtros avanzados */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 p-6 bg-secondary-50 rounded-2xl border border-secondary-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Filtro por Marca */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-secondary-700 mb-3">
                          <Building2 className="w-4 h-4 text-primary-500" />
                          Marca
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {brands.map((brand) => (
                            <button
                              key={brand}
                              onClick={() => setSelectedBrand(brand)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                selectedBrand === brand
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-secondary-600 border border-secondary-200 hover:border-primary-300'
                              }`}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filtro por Color */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-secondary-700 mb-3">
                          <Palette className="w-4 h-4 text-primary-500" />
                          Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                selectedColor === color
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-secondary-600 border border-secondary-200 hover:border-primary-300'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filtro por Stock */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-secondary-700 mb-3">
                          <Ruler className="w-4 h-4 text-primary-500" />
                          Disponibilidad
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setStockFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              stockFilter === 'all'
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-secondary-600 border border-secondary-200 hover:border-primary-300'
                            }`}
                          >
                            Todos
                          </button>
                          <button
                            onClick={() => setStockFilter('inStock')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              stockFilter === 'inStock'
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-secondary-600 border border-secondary-200 hover:border-green-300'
                            }`}
                          >
                            En Stock
                          </button>
                          <button
                            onClick={() => setStockFilter('lowStock')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              stockFilter === 'lowStock'
                                ? 'bg-amber-500 text-white'
                                : 'bg-white text-secondary-600 border border-secondary-200 hover:border-amber-300'
                            }`}
                          >
                            Últimas unidades
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Layout con Sidebar ── */}
          <div className="flex gap-6">
            {/* Sidebar de filtros */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="hidden lg:block"
                >
                  <FilterSidebar
                    onFilterChange={setSidebarFilters}
                    brands={brands.filter(b => b !== 'Todas')}
                    colors={colors.filter(c => c !== 'Todos')}
                    categories={categories.filter(c => c !== 'Todos')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid de productos */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
                {filteredProducts.slice(0, displayLimit).map((product, index) => {
                const stock = getTotalStock(product)
                const isOutOfStock = stock === 0
                
                return (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                    className="group bg-white rounded-2xl border border-secondary-100 hover:border-primary-300 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 md:hover:-translate-y-1"
                  >
                    {/* Imagen */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-white p-4">
                      <Image
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Badges promocionales */}
                      <ProductBadges
                        isNew={product.is_new}
                        discount={product.discount_percentage || undefined}
                        lowStock={isOutOfStock ? 0 : stock}
                        isBestSeller={product.is_best_seller}
                      />

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
                      {/* Categoría + Marca */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-primary-400" aria-hidden="true" />
                          <span className="text-xs text-secondary-400 font-medium uppercase tracking-wide">
                            {product.categories?.name || 'Sin categoría'}
                          </span>
                        </div>
                        {product.brand && (
                          <span className="text-[10px] bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-semibold">
                            {product.brand}
                          </span>
                        )}
                      </div>

                      {/* Nombre - clickeable para ir al detalle */}
                      <Link href={`/producto/${product.id}`}>
                        <h3 className="text-sm sm:text-base font-bold text-secondary-800 mb-1.5 leading-snug line-clamp-2 min-h-[2.5rem] hover:text-primary-600 transition-colors cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Descripción */}
                      {product.description && (
                        <p className="text-xs text-secondary-400 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Colores disponibles */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Palette className="w-3 h-3 text-secondary-400" />
                          <div className="flex flex-wrap gap-1">
                            {product.colors.slice(0, 3).map((color) => (
                              <span
                                key={color}
                                className="text-[10px] text-secondary-500 bg-secondary-100 rounded px-1.5 py-0.5"
                              >
                                {color}
                              </span>
                            ))}
                            {product.colors.length > 3 && (
                              <span className="text-[10px] text-secondary-400">
                                +{product.colors.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tallas */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Ruler className="w-3 h-3 text-secondary-400" />
                          <div className="flex flex-wrap gap-1">
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
                        </div>
                      )}

                      {/* Precio + Stock */}
                      <div className="flex items-end justify-between pt-2 border-t border-secondary-100">
                        <div>
                          {product.discount_percentage ? (
                            <div className="flex flex-col">
                              <span className="text-sm text-secondary-400 line-through">
                                Bs {product.price.toFixed(2)}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-green-600">
                                  {(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                                </span>
                                <span className="text-xs text-secondary-400 font-medium">
                                  Bs
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="text-2xl font-black text-primary-500">
                                {product.price.toFixed(2)}
                              </span>
                              <span className="text-xs text-secondary-400 ml-1 font-medium">
                                Bs
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold ${
                            stock === 0 ? 'text-red-500' : stock < 5 ? 'text-amber-500' : 'text-green-500'
                          }`}>
                            {stock === 0 ? 'Agotado' : stock < 5 ? `¡Solo ${stock}!` : `${stock} disponibles`}
                          </span>
                        </div>
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
              </div>

              {/* ── Botón Cargar Más ── */}
              {filteredProducts.length > displayLimit && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 12)}
                    className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Cargar más productos ({filteredProducts.length - displayLimit} restantes)
                  </button>
                </div>
              )}

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
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
