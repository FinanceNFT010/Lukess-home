'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, ExternalLink, ChevronLeft, ChevronRight, Check, Palette, Ruler, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import toast from 'react-hot-toast'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  getTotalStock: (product: Product) => number
  getDiscount: (product: Product) => number
  getPriceWithDiscount: (product: Product) => number
  hasDiscount: (product: Product) => boolean
}

export function QuickViewModal({ 
  product, 
  isOpen, 
  onClose, 
  getTotalStock, 
  getDiscount, 
  getPriceWithDiscount,
  hasDiscount 
}: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToCart } = useCart()

  // Reset al abrir nuevo producto
  useEffect(() => {
    if (product) {
      setSelectedSize(null)
      setSelectedColor(null)
      setCurrentImageIndex(0)
    }
  }, [product])

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!product) return null

  const stock = getTotalStock(product)
  const isOutOfStock = stock === 0
  const discount = getDiscount(product)
  const priceWithDiscount = getPriceWithDiscount(product)
  
  // Obtener imágenes (máximo 3)
  const images = product.images && product.images.length > 0 
    ? product.images.slice(0, 3) 
    : product.image_url 
      ? [product.image_url] 
      : ['/placeholder.png']

  const handleAddToCart = () => {
    // Validaciones
    if (isOutOfStock) {
      toast.error('Producto sin stock', { position: 'bottom-center' })
      return
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Por favor selecciona una talla', { position: 'bottom-center' })
      return
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Por favor selecciona un color', { position: 'bottom-center' })
      return
    }

    // Agregar al carrito
    addToCart(product, 1, selectedSize || undefined, selectedColor || undefined)
    
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : -20, scale: t.visible ? 1 : 0.9 }}
        className="flex items-center gap-3 bg-white border-2 border-green-200 shadow-xl rounded-xl px-4 py-3"
      >
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">¡Agregado al carrito!</p>
          <p className="text-xs text-gray-500">{product.name}</p>
        </div>
      </motion.div>
    ), { duration: 2000, position: 'bottom-center' })

    // Cerrar modal después de agregar
    setTimeout(onClose, 500)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Vista Rápida</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Galería de imágenes */}
                <div className="space-y-4">
                  {/* Imagen principal */}
                  <div className="relative aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden">
                    <Image
                      src={images[currentImageIndex]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-4"
                      priority
                    />

                    {/* Navegación de galería */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-800" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                          aria-label="Imagen siguiente"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-800" />
                        </button>

                        {/* Indicadores */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImageIndex(i)}
                              className={`h-1.5 rounded-full transition-all ${
                                i === currentImageIndex 
                                  ? 'bg-primary-600 w-6' 
                                  : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                              }`}
                              aria-label={`Ver imagen ${i + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_new && (
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ✨ NUEVO
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          -{discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Miniaturas */}
                  {images.length > 1 && (
                    <div className="flex gap-2">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            i === currentImageIndex 
                              ? 'border-primary-600 scale-105' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} - ${i + 1}`}
                            fill
                            sizes="80px"
                            className="object-contain p-1"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex flex-col">
                  {/* Categoría + Marca */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-primary-600 font-semibold uppercase tracking-wide">
                      {product.categories?.name || 'Sin categoría'}
                    </span>
                    {product.brand && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-semibold">
                          {product.brand}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Nombre */}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                    {product.name}
                  </h2>

                  {/* Descripción */}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  {/* Precio */}
                  <div className="mb-6">
                    {hasDiscount(product) ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl md:text-4xl font-black text-red-600">
                          Bs {priceWithDiscount.toFixed(2)}
                        </span>
                        <span className="text-lg text-gray-400 line-through decoration-red-500">
                          Bs {product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl md:text-4xl font-black text-primary-600">
                        Bs {product.price.toFixed(2)}
                      </span>
                    )}
                    {discount > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        Ahorras Bs {(product.price * (discount / 100)).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm font-bold ${
                        stock === 0 
                          ? 'text-red-600' 
                          : stock < 10 
                            ? 'text-amber-600' 
                            : 'text-green-600'
                      }`}>
                        {stock === 0 ? '🚫 Sin stock' : stock < 10 ? `⚠️ Solo ${stock} unidades` : '✓ Disponible'}
                      </span>
                    </div>
                  </div>

                  {/* Selector de Color */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-6">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                        <Palette className="w-4 h-4 text-primary-600" />
                        Color {product.colors.length > 0 && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            disabled={isOutOfStock}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                              selectedColor === color
                                ? 'border-primary-600 bg-primary-600 text-white shadow-md scale-105'
                                : isOutOfStock
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                            }`}
                          >
                            {color}
                            {selectedColor === color && (
                              <Check className="w-4 h-4 inline ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selector de Talla */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-6">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                        <Ruler className="w-4 h-4 text-primary-600" />
                        Talla {product.sizes.length > 0 && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            disabled={isOutOfStock}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border-2 min-w-[60px] ${
                              selectedSize === size
                                ? 'border-primary-600 bg-primary-600 text-white shadow-md scale-105'
                                : isOutOfStock
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                            }`}
                          >
                            {size}
                            {selectedSize === size && (
                              <Check className="w-4 h-4 inline ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="mt-auto space-y-3">
                    {/* Agregar al carrito */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all duration-300 ${
                        isOutOfStock
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}
                    </button>

                    {/* Ver detalles completos */}
                    <Link
                      href={`/producto/${product.id}`}
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-primary-700 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-400 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver detalles completos
                    </Link>
                  </div>

                  {/* Nota de campos requeridos */}
                  {((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      <span className="text-red-500">*</span> Campos requeridos
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
