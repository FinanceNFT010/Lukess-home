'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cerrar al clickear fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar productos
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    
    const searchProducts = async () => {
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          inventory(quantity)
        `)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,brand.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(5)

      setResults(data || [])
      setIsOpen(true)
      setIsLoading(false)
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleProductClick = (productId: string) => {
    router.push(`/producto/${productId}`)
    setQuery('')
    setIsOpen(false)
  }

  const getTotalStock = (product: Product): number => {
    return product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-lg focus:bg-white focus:border-white focus:text-gray-900 text-white placeholder:text-white/60 focus:outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown de Resultados */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-50 max-h-96 overflow-y-auto"
          >
            {results.map((product) => {
              const stock = getTotalStock(product)
              return (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {/* Image */}
                  <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={product.image_url || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-primary-600 font-bold">
                        Bs {product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        • Stock: {stock}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border-2 border-gray-100 p-4 text-center text-gray-500"
        >
          No se encontraron productos
        </motion.div>
      )}
    </div>
  )
}
