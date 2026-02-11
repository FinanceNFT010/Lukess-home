'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import Container from '@/components/ui/Container'
import { ShoppingCart, ShoppingBag, Tag, MessageCircle, Plus, Filter, X, Palette, Ruler, Building2, SlidersHorizontal, Check, Sparkles, Percent, Leaf, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import toast from 'react-hot-toast'
import { FilterSidebar, type Filters } from '@/components/catalogo/FilterSidebar'
import { ProductBadges } from '@/components/catalogo/ProductBadges'
import { QuickViewModal } from '@/components/catalogo/QuickViewModal'
import { WishlistButton } from '@/components/wishlist/WishlistButton'

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

// Toast personalizado que no bloquea - Posición bottom-right
const showAddedToast = (productName: string) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: t.visible ? 1 : 0, x: t.visible ? 0 : 100, scale: t.visible ? 1 : 0.9 }}
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
  ), { duration: 1500, position: 'bottom-right' })
}

export function CatalogoClient({ initialProducts }: CatalogoClientProps) {
  // Estados de filtros - Ahora son arrays para multiselección
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sidebarFilters, setSidebarFilters] = useState<Filters>({
    priceRange: [0, 1000],
    brands: [],
    colors: [],
    sizes: [],
    inStock: true,
    category: null,
    hasDiscount: null,
  })
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock'>('inStock')
  const [showNew, setShowNew] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [showCollection, setShowCollection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [displayLimit, setDisplayLimit] = useState(20)
  const [sortOrder, setSortOrder] = useState<'recent' | 'price-asc' | 'price-desc'>('recent')
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const { addToCart } = useCart()
  const { ref, inView } = useInView({ 
    triggerOnce: true, 
    threshold: 0.05,
    rootMargin: '50px'
  })

  // Detectar búsqueda desde URL - Se ejecuta al montar y cuando hay eventos
  useEffect(() => {
    const updateSearchFromURL = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const busqueda = params.get('busqueda')
        const newQuery = busqueda ? decodeURIComponent(busqueda) : ''
        
        // Solo actualizar si es diferente para evitar loops
        if (newQuery !== searchQuery) {
          console.log('📝 Actualizando búsqueda desde URL:', newQuery)
          
          // IMPORTANTE: Limpiar todos los filtros antes de aplicar la búsqueda
          if (newQuery) {
            setSelectedCategories([])
            setSelectedSubcategories([])
            setSelectedBrands([])
            setSelectedColors([])
            setStockFilter('inStock')
            setShowNew(false)
            setShowDiscount(false)
            setShowCollection(null)
          }
          
          setSearchQuery(newQuery)
        }
      }
    }
    
    updateSearchFromURL()
    
    // Escuchar cambios en la búsqueda y en el popstate (navegación)
    const handleSearchUpdate = () => {
      setTimeout(updateSearchFromURL, 100)
    }
    
    window.addEventListener('searchUpdate', handleSearchUpdate)
    window.addEventListener('popstate', updateSearchFromURL)
    
    return () => {
      window.removeEventListener('searchUpdate', handleSearchUpdate)
      window.removeEventListener('popstate', updateSearchFromURL)
    }
  }, [])

  // Función para verificar si un producto es nuevo (usa el campo is_new de la BD)
  const isProductNew = useCallback((product: Product): boolean => {
    return product.is_new === true
  }, [])

  // Función para verificar si tiene descuento
  const hasDiscount = useCallback((product: Product): boolean => {
    return !!(product.discount && product.discount > 0) || !!(product.discount_percentage && product.discount_percentage > 0)
  }, [])

  // Función para obtener el porcentaje de descuento
  const getDiscount = useCallback((product: Product): number => {
    return product.discount || product.discount_percentage || 0
  }, [])

  // Función para calcular precio con descuento
  const getPriceWithDiscount = useCallback((product: Product): number => {
    const discount = getDiscount(product)
    return product.price * (1 - discount / 100)
  }, [getDiscount])

  // Función para calcular ahorro
  const getSavings = useCallback((product: Product): number => {
    const discount = getDiscount(product)
    return product.price * (discount / 100)
  }, [getDiscount])

  // Detectar filtros desde URL hash (navbar) y eventos de banners
  useEffect(() => {
    const resetFilters = () => {
      setShowNew(false)
      setShowDiscount(false)
      setShowCollection(null)
      setSelectedSubcategories([])
      setSelectedCategories([])
      setSelectedBrands([])
      setSelectedColors([])
    }

    const handleHashChange = () => {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.split('?')[1] || '')
      const filter = params.get('filter')
      
      // Resetear filtros primero
      resetFilters()
      
      if (!filter) return
      
      // Filtros especiales
      if (filter === 'nuevo') {
        setShowNew(true)
      } else if (filter === 'descuento' || filter === 'descuentos') {
        setShowDiscount(true)
      } else if (filter === 'primavera' || filter === 'collection-primavera') {
        setShowCollection('primavera')
      } 
      // Categorías principales
      else if (filter === 'camisas') {
        setSelectedCategories(['Camisas'])
      } else if (filter === 'pantalones') {
        setSelectedCategories(['Pantalones'])
      } else if (filter === 'blazers') {
        setSelectedCategories(['Blazers'])
      } else if (filter === 'accesorios') {
        setSelectedCategories(['Accesorios'])
      } else if (filter === 'chaquetas') {
        setSelectedCategories(['Chaquetas'])
      } else if (filter === 'polos') {
        setSelectedCategories(['Polos'])
      }
      // Subcategorías de camisas
      else if (filter === 'camisas-columbia') {
        setSelectedCategories(['Camisas'])
        setSelectedBrands(['Columbia'])
      } else if (filter === 'camisas-manga-larga') {
        setSelectedCategories(['Camisas'])
        setSelectedSubcategories(['manga-larga'])
      } else if (filter === 'camisas-manga-corta') {
        setSelectedCategories(['Camisas'])
        setSelectedSubcategories(['manga-corta'])
      } else if (filter === 'camisas-elegantes') {
        setSelectedCategories(['Camisas'])
        setSelectedSubcategories(['elegante'])
      }
      // Subcategorías de pantalones
      else if (filter === 'pantalones-oversize') {
        setSelectedCategories(['Pantalones'])
        setSelectedSubcategories(['oversize'])
      } else if (filter === 'pantalones-jeans') {
        setSelectedCategories(['Pantalones'])
        setSelectedSubcategories(['jeans'])
      } else if (filter === 'pantalones-elegantes') {
        setSelectedCategories(['Pantalones'])
        setSelectedSubcategories(['elegante'])
      }
      // Subcategorías de accesorios
      else if (filter === 'accesorios-sombreros') {
        setSelectedCategories(['Accesorios'])
        setSelectedSubcategories(['sombreros'])
      } else if (filter === 'accesorios-gorras') {
        setSelectedCategories(['Accesorios'])
        setSelectedSubcategories(['gorras'])
      } else if (filter === 'accesorios-cinturones') {
        setSelectedCategories(['Accesorios'])
        setSelectedSubcategories(['cinturones'])
      } else if (filter === 'accesorios-billeteras') {
        setSelectedCategories(['Accesorios'])
        setSelectedSubcategories(['billeteras'])
      }
    }
    
    // Escuchar eventos de los banners promocionales
    const handlePromoFilter = (e: CustomEvent) => {
      const filter = e.detail
      resetFilters()
      
      if (filter === 'descuento' || filter === 'descuentos') {
        setShowDiscount(true)
      } else if (filter === 'primavera' || filter === 'collection-primavera') {
        setShowCollection('primavera')
      } else if (filter === 'camisas-columbia') {
        setSelectedCategories(['Camisas'])
        setSelectedBrands(['Columbia'])
      }
    }
    
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('applyPromoFilter', handlePromoFilter as EventListener)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('applyPromoFilter', handlePromoFilter as EventListener)
    }
  }, [])

  // Extraer categorías únicas
  const categories = useMemo(() => {
    const cats = new Set<string>()
    initialProducts.forEach(p => {
      if (p.categories?.name) cats.add(p.categories.name)
    })
    return ['Todos', ...Array.from(cats).sort()]
  }, [initialProducts])

  // Extraer marcas únicas (máximo 8)
  const brands = useMemo(() => {
    const brandSet = new Set<string>()
    initialProducts.forEach(p => {
      if (p.brand) brandSet.add(p.brand)
    })
    const sortedBrands = Array.from(brandSet).sort()
    return ['Todas', ...sortedBrands.slice(0, 8)]
  }, [initialProducts])

  // Colores estándar (9 colores típicos)
  const colors = useMemo(() => {
    const standardColors = ['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Verde', 'Beige', 'Café', 'Amarillo']
    const availableColors = new Set<string>()
    
    initialProducts.forEach(p => {
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach(c => {
          // Normalizar y matchear con colores estándar
          const normalized = c.toLowerCase()
          standardColors.forEach(std => {
            if (normalized.includes(std.toLowerCase())) {
              availableColors.add(std)
            }
          })
        })
      }
    })
    
    return ['Todos', ...standardColors.filter(c => availableColors.has(c))]
  }, [initialProducts])

  // Calcular stock total
  const getTotalStock = useCallback((product: Product): number => {
    return product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
  }, [])

  // Filtrar y ordenar productos con todos los filtros
  const filteredProducts = useMemo(() => {
    console.log('🔍 Filtrando productos con búsqueda:', searchQuery)
    
    let filtered = initialProducts.filter(p => {
      // Filtro de búsqueda - MEJORADO para incluir más campos
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = p.name.toLowerCase().includes(query)
        const matchesBrand = p.brand?.toLowerCase().includes(query)
        const matchesCategory = p.categories?.name.toLowerCase().includes(query)
        const matchesDescription = p.description?.toLowerCase().includes(query)
        const matchesSKU = p.sku?.toLowerCase().includes(query)
        
        // Buscar en colores
        const matchesColor = p.colors?.some(color => 
          color.toLowerCase().includes(query)
        )
        
        // Buscar en tallas
        const matchesSize = p.sizes?.some(size => 
          size.toLowerCase().includes(query)
        )
        
        // Buscar palabras clave especiales
        const matchesKeywords = 
          (query === 'nuevo' || query === 'nuevos') && p.is_new === true ||
          (query === 'descuento' || query === 'descuentos' || query === 'oferta' || query === 'ofertas') && hasDiscount(p) ||
          (query === 'primavera') && p.collection === 'primavera'
        
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesDescription && 
            !matchesSKU && !matchesColor && !matchesSize && !matchesKeywords) {
          return false
        }
      }
      
      // Filtro por "NUEVO" (productos con is_new = true)
      if (showNew && !isProductNew(p)) return false
      
      // Filtro por "DESCUENTO"
      if (showDiscount && !hasDiscount(p)) return false
      
      // Filtro por colección (primavera, verano, etc.)
      if (showCollection && p.collection !== showCollection) return false
      
      // Filtro por subcategorías (multiselección)
      if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(p.subcategory || '')) return false
      
      // Filtros del sidebar - Precio
      if (p.price < sidebarFilters.priceRange[0] || p.price > sidebarFilters.priceRange[1]) return false
      
      // Filtros del sidebar - Talla
      if (sidebarFilters.sizes.length > 0 && (!p.sizes || !p.sizes.some(s => sidebarFilters.sizes.includes(s)))) return false
      
      // Filtros del sidebar - Stock
      const stock = getTotalStock(p)
      if (sidebarFilters.inStock && stock === 0) return false
      
      // Filtros del sidebar - Descuento
      if (sidebarFilters.hasDiscount && !hasDiscount(p)) return false
      
      // Filtro por categorías (multiselección)
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.categories?.name || '')) return false
      
      // Filtro por marcas (multiselección)
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand || '')) return false
      
      // Filtro por colores (multiselección)
      if (selectedColors.length > 0 && (!p.colors || !p.colors.some(c => selectedColors.includes(c)))) return false
      
      // Filtro por stock (botones superiores)
      if (stockFilter === 'inStock' && stock === 0) return false
      if (stockFilter === 'lowStock' && (stock === 0 || stock >= 5)) return false
      
      return true
    })

    // Ordenar productos
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'price-asc':
          return getPriceWithDiscount(a) - getPriceWithDiscount(b)
        case 'price-desc':
          return getPriceWithDiscount(b) - getPriceWithDiscount(a)
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return sorted
  }, [selectedCategories, selectedSubcategories, selectedBrands, selectedColors, stockFilter, showNew, showDiscount, showCollection, searchQuery, sidebarFilters, initialProducts, getTotalStock, isProductNew, hasDiscount, sortOrder, getPriceWithDiscount])

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    count += selectedCategories.length
    count += selectedSubcategories.length
    count += selectedBrands.length
    count += selectedColors.length
    count += sidebarFilters.sizes.length
    if (stockFilter !== 'inStock') count++ // inStock es el default
    if (showNew) count++
    if (showDiscount) count++
    if (showCollection) count++
    if (searchQuery.trim()) count++
    return count
  }, [selectedCategories, selectedSubcategories, selectedBrands, selectedColors, sidebarFilters.sizes, stockFilter, showNew, showDiscount, showCollection, searchQuery])

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedSubcategories([])
    setSelectedBrands([])
    setSelectedColors([])
    setStockFilter('inStock') // Volver al default
    setShowNew(false)
    setShowDiscount(false)
    setShowCollection(null)
    setSidebarFilters({
      priceRange: [0, 1000],
      brands: [],
      colors: [],
      sizes: [],
      inStock: true, // Volver al default
      category: null,
      hasDiscount: null,
    })
    setSearchQuery('')
    // Limpiar la URL
    window.history.pushState(null, '', '/#catalogo')
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

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewProduct(product)
    setIsQuickViewOpen(true)
  }

  const closeQuickView = () => {
    setIsQuickViewOpen(false)
    setTimeout(() => setQuickViewProduct(null), 300)
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

          {/* ── Barra de Filtros Simplificada ── */}
          <motion.div
            variants={headingVariants}
            className="mb-8 md:mb-12"
          >
            {/* Filtros rápidos principales */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
              {/* Botón Nuevo */}
              <button
                onClick={() => {
                  clearAllFilters()
                  setShowNew(true)
                }}
                className={`
                  px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold
                  transition-all duration-300 flex items-center gap-2
                  ${
                    showNew
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30 scale-105'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 hover:text-secondary-800'
                  }
                `}
              >
                <Sparkles className="w-4 h-4" />
                Nuevo
              </button>

              {/* Botón Descuentos */}
              <button
                onClick={() => {
                  clearAllFilters()
                  setShowDiscount(true)
                }}
                className={`
                  px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold
                  transition-all duration-300 flex items-center gap-2
                  ${
                    showDiscount
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-105'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 hover:text-secondary-800'
                  }
                `}
              >
                <Percent className="w-4 h-4" />
                Descuentos
              </button>

              {/* Botón Colección Primavera */}
              <button
                onClick={() => {
                  clearAllFilters()
                  setShowCollection('primavera')
                }}
                className={`
                  px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold
                  transition-all duration-300 flex items-center gap-2
                  ${
                    showCollection === 'primavera'
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30 scale-105'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 hover:text-secondary-800'
                  }
                `}
              >
                <Leaf className="w-4 h-4" />
                Primavera
              </button>
            </div>

            {/* Botón de filtros + contador + ordenamiento */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md ${
                  showFilters
                    ? 'bg-primary-800 text-white'
                    : 'bg-primary-700 text-white hover:bg-primary-800'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition-all border border-red-200"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Contador y ordenamiento */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
              <span className="text-sm font-semibold text-secondary-700">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </span>
              
              <div className="flex items-center gap-2">
                <label htmlFor="sort-order" className="text-sm text-secondary-600 font-medium">
                  Ordenar por:
                </label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'recent' | 'price-asc' | 'price-desc')}
                  className="px-3 py-1.5 text-sm border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="recent">Más recientes</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                </select>
              </div>
            </div>

            {/* Filtros activos visuales */}
            {activeFiltersCount > 0 && (
              <div className="px-4 mt-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-secondary-600">Filtros activos:</span>
                  
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      🔍 "{searchQuery}"
                      <button onClick={() => {
                        setSearchQuery('')
                        window.history.pushState(null, '', '/#catalogo')
                      }} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {selectedCategories.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                      {cat}
                      <button onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))} className="hover:text-primary-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  {selectedSubcategories.map(sub => (
                    <span key={sub} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                      {sub}
                      <button onClick={() => setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub))} className="hover:text-purple-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  {selectedBrands.map(brand => (
                    <span key={brand} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      {brand}
                      <button onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))} className="hover:text-amber-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  {selectedColors.map(color => (
                    <span key={color} className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                      {color}
                      <button onClick={() => setSelectedColors(selectedColors.filter(c => c !== color))} className="hover:text-pink-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  {sidebarFilters.sizes.map(size => (
                    <span key={size} className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      Talla {size}
                      <button onClick={() => setSidebarFilters({...sidebarFilters, sizes: sidebarFilters.sizes.filter(s => s !== size)})} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  {showNew && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      ✨ Nuevo
                      <button onClick={() => setShowNew(false)} className="hover:text-amber-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {showDiscount && (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                      % Descuentos
                      <button onClick={() => setShowDiscount(false)} className="hover:text-red-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {showCollection && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      🌸 {showCollection}
                      <button onClick={() => setShowCollection(null)} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Panel de filtros completo */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 p-6 bg-secondary-50 rounded-2xl border border-secondary-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      
                      {/* Categoría - Multiselección con checkboxes */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
                            <Tag className="w-4 h-4 text-primary-500" />
                            Categoría {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                          </label>
                          {selectedCategories.length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedCategories([])
                                setSelectedSubcategories([])
                              }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Limpiar
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {categories.filter(c => c !== 'Todos').map((cat) => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategories([...selectedCategories, cat])
                                  } else {
                                    setSelectedCategories(selectedCategories.filter(c => c !== cat))
                                    // Limpiar subcategorías de esta categoría
                                    setSelectedSubcategories([])
                                  }
                                }}
                                className="w-4 h-4 accent-primary-600 rounded"
                              />
                              <span className="text-sm group-hover:text-primary-600 transition-colors">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Subcategorías - Multiselección */}
                      {(selectedCategories.includes('Camisas') || selectedCategories.includes('Pantalones') || selectedCategories.includes('Accesorios')) && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
                              <Filter className="w-4 h-4 text-primary-500" />
                              Subcategoría {selectedSubcategories.length > 0 && `(${selectedSubcategories.length})`}
                            </label>
                            {selectedSubcategories.length > 0 && (
                              <button
                                onClick={() => setSelectedSubcategories([])}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                Limpiar
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {selectedCategories.includes('Camisas') && (
                              <>
                                <p className="text-xs text-gray-500 font-semibold mb-1">Camisas:</p>
                                {[
                                  { label: 'Manga Larga', value: 'manga-larga' },
                                  { label: 'Manga Corta', value: 'manga-corta' },
                                  { label: 'Elegantes', value: 'elegante' },
                                ].map((sub) => (
                                  <label key={sub.value} className="flex items-center gap-2 cursor-pointer group ml-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubcategories.includes(sub.value)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedSubcategories([...selectedSubcategories, sub.value])
                                        } else {
                                          setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub.value))
                                        }
                                      }}
                                      className="w-4 h-4 accent-primary-600 rounded"
                                    />
                                    <span className="text-sm group-hover:text-primary-600 transition-colors">{sub.label}</span>
                                  </label>
                                ))}
                              </>
                            )}
                            {selectedCategories.includes('Pantalones') && (
                              <>
                                <p className="text-xs text-gray-500 font-semibold mb-1 mt-2">Pantalones:</p>
                                {[
                                  { label: 'Oversize', value: 'oversize' },
                                  { label: 'Jeans', value: 'jeans' },
                                  { label: 'Elegantes', value: 'elegante' },
                                ].map((sub) => (
                                  <label key={sub.value} className="flex items-center gap-2 cursor-pointer group ml-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubcategories.includes(sub.value)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedSubcategories([...selectedSubcategories, sub.value])
                                        } else {
                                          setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub.value))
                                        }
                                      }}
                                      className="w-4 h-4 accent-primary-600 rounded"
                                    />
                                    <span className="text-sm group-hover:text-primary-600 transition-colors">{sub.label}</span>
                                  </label>
                                ))}
                              </>
                            )}
                            {selectedCategories.includes('Accesorios') && (
                              <>
                                <p className="text-xs text-gray-500 font-semibold mb-1 mt-2">Accesorios:</p>
                                {[
                                  { label: 'Sombreros', value: 'sombreros' },
                                  { label: 'Gorras', value: 'gorras' },
                                  { label: 'Cinturones', value: 'cinturones' },
                                  { label: 'Billeteras', value: 'billeteras' },
                                ].map((sub) => (
                                  <label key={sub.value} className="flex items-center gap-2 cursor-pointer group ml-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubcategories.includes(sub.value)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedSubcategories([...selectedSubcategories, sub.value])
                                        } else {
                                          setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub.value))
                                        }
                                      }}
                                      className="w-4 h-4 accent-primary-600 rounded"
                                    />
                                    <span className="text-sm group-hover:text-primary-600 transition-colors">{sub.label}</span>
                                  </label>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Filtro por Marca - Multiselección */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
                            <Building2 className="w-4 h-4 text-primary-500" />
                            Marca {selectedBrands.length > 0 && `(${selectedBrands.length})`}
                          </label>
                          {selectedBrands.length > 0 && (
                            <button
                              onClick={() => setSelectedBrands([])}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Limpiar
                            </button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {brands.filter(b => b !== 'Todas').map((brand) => (
                            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBrands([...selectedBrands, brand])
                                  } else {
                                    setSelectedBrands(selectedBrands.filter(b => b !== brand))
                                  }
                                }}
                                className="w-4 h-4 accent-primary-600 rounded"
                              />
                              <span className="text-sm group-hover:text-primary-600 transition-colors">{brand}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Filtro por Color - Multiselección */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
                            <Palette className="w-4 h-4 text-primary-500" />
                            Color {selectedColors.length > 0 && `(${selectedColors.length})`}
                          </label>
                          {selectedColors.length > 0 && (
                            <button
                              onClick={() => setSelectedColors([])}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Limpiar
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {colors.filter(c => c !== 'Todos').map((color) => (
                            <label key={color} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedColors.includes(color)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedColors([...selectedColors, color])
                                  } else {
                                    setSelectedColors(selectedColors.filter(c => c !== color))
                                  }
                                }}
                                className="w-4 h-4 accent-primary-600 rounded"
                              />
                              <span className="text-sm group-hover:text-primary-600 transition-colors">{color}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Filtro por Talla - Solo las tallas especificadas */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-secondary-700 mb-3">
                          <Ruler className="w-4 h-4 text-primary-500" />
                          Talla
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['S', 'M', 'L', 'XL', '38', '40', '42', '44'].map((size) => (
                            <button
                              key={size}
                              onClick={() => {
                                const newSizes = sidebarFilters.sizes.includes(size)
                                  ? sidebarFilters.sizes.filter(s => s !== size)
                                  : [...sidebarFilters.sizes, size]
                                setSidebarFilters({ ...sidebarFilters, sizes: newSizes })
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[40px] ${
                                sidebarFilters.sizes.includes(size)
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-secondary-600 border border-secondary-200 hover:border-primary-300'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filtro por Disponibilidad */}
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

          {/* ── Grid de productos ── */}
          <div>
              {filteredProducts.length === 0 ? (
                /* Estado vacío */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 px-4"
                >
                  <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-12 h-12 text-secondary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-800 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-secondary-500 text-center mb-6 max-w-md">
                    No hay productos que coincidan con los filtros seleccionados. Intenta ajustar tus criterios de búsqueda.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                    Limpiar todos los filtros
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
                {filteredProducts.slice(0, displayLimit).map((product) => {
                const stock = getTotalStock(product)
                const isOutOfStock = stock === 0
                
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-secondary-100 hover:border-primary-300 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 md:hover:-translate-y-1 cursor-pointer"
                  >
                    {/* Wrapper clickeable para toda la card */}
                    <Link href={`/producto/${product.id}`} className="block">
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
                        discount={getDiscount(product) || undefined}
                        lowStock={isOutOfStock ? 0 : stock}
                        isBestSeller={product.is_best_seller}
                        collection={product.collection}
                      />

                      {/* Botón Wishlist */}
                      <WishlistButton 
                        productId={product.id} 
                        productName={product.name}
                      />

                      {/* Botón Vista Rápida - aparece al hover */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <button
                          onClick={(e) => handleQuickView(e, product)}
                          className="bg-white hover:bg-primary-600 text-primary-800 hover:text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-xl border-2 border-primary-600 transition-all duration-300 hover:scale-110 flex items-center gap-2 pointer-events-auto"
                        >
                          <Eye className="w-4 h-4" />
                          Vista Rápida
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

                      {/* Nombre */}
                      <h3 className="text-sm sm:text-base font-bold text-secondary-800 mb-1.5 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>

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
                          {hasDiscount(product) ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-red-600">
                                  Bs {getPriceWithDiscount(product).toFixed(2)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 line-through decoration-red-500 decoration-1">
                                Bs {product.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline">
                              <span className="text-2xl font-black text-primary-600">
                                Bs {product.price.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                            stock === 0 
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                              : stock < 10 
                                ? 'bg-amber-500 text-white shadow-md' 
                                : 'bg-green-500 text-white shadow-md'
                          }`}>
                            {stock === 0 ? '🚫 SIN STOCK' : stock < 10 ? '⚠️ Pocas unidades' : '✓ En stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                    </Link>

                    {/* Botones móvil */}
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 lg:hidden flex gap-2">
                      <Link
                        href={`/producto/${product.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                          isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                            : 'bg-primary-800 hover:bg-primary-900 text-white'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isOutOfStock ? 'Sin Stock' : 'Ver detalles'}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWhatsAppConsult(product)
                        }}
                        className="px-4 py-2.5 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-full transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
                </div>
              )}

              {/* ── Botón Cargar Más ── */}
              {filteredProducts.length > 0 && filteredProducts.length > displayLimit && (
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
        </motion.div>
      </Container>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        getTotalStock={getTotalStock}
        getDiscount={getDiscount}
        getPriceWithDiscount={getPriceWithDiscount}
        hasDiscount={hasDiscount}
      />
    </section>
  )
}
