'use client'
import { useState } from 'react'
import Container from '@/components/ui/Container'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import { ShoppingCart, MessageCircle, Package, TrendingUp, ChevronRight, Home, Percent, Ruler, Truck, Store } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/utils/shipping'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ProductGallery } from './ProductGallery'
import { SizeGuideModal } from './SizeGuideModal'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  const getTotalStock = (p: Product): number => {
    return p.inventory?.reduce(
      (sum, inv) => sum + Math.max(0, inv.quantity - (inv.reserved_qty ?? 0)),
      0
    ) || 0
  }

  const getStockBySize = (p: Product): Record<string, number> => {
    const result: Record<string, number> = {}
    if (!p.inventory) return result
    for (const inv of p.inventory) {
      const size = inv.size ?? ''
      if (!size) continue
      const available = Math.max(0, inv.quantity - (inv.reserved_qty ?? 0))
      result[size] = (result[size] ?? 0) + available
    }
    return result
  }

  // Funciones para descuentos
  const getDiscount = (p: Product): number => {
    return p.discount || p.discount_percentage || 0
  }

  const hasDiscount = (p: Product): boolean => {
    return getDiscount(p) > 0
  }

  const getPriceWithDiscount = (p: Product): number => {
    const discount = getDiscount(p)
    return p.price * (1 - discount / 100)
  }

  const getSavings = (p: Product): number => {
    const discount = getDiscount(p)
    return p.price * (discount / 100)
  }

  const stock = getTotalStock(product)
  const stockBySize = getStockBySize(product)
  const isOutOfStock = stock === 0
  const discount = getDiscount(product)
  const LOW_STOCK_THRESHOLD = 3
  // Un producto necesita talla solo si tiene tallas definidas y no vacías/nulas
  const validSizes = (product.sizes ?? []).filter((s: string) => s && s.trim() !== '')
  const needsSize = validSizes.length > 0
  const selectedSizeStock = needsSize && selectedSize ? (stockBySize[selectedSize] ?? 0) : stock
  const selectedSizeAgotada = needsSize && !!selectedSize && selectedSizeStock === 0
  const addToCartDisabled = isOutOfStock || (needsSize && !selectedSize) || selectedSizeAgotada
  const addToCartLabel = isOutOfStock
    ? 'Sin Stock'
    : needsSize && !selectedSize
      ? 'Selecciona una talla'
      : selectedSizeAgotada
        ? 'Talla agotada'
        : 'Agregar al Carrito'

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Producto sin stock')
      return
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Por favor selecciona una talla')
      return
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Por favor selecciona un color')
      return
    }

    if (selectedSizeAgotada) {
      toast.error('La talla seleccionada está agotada')
      return
    }

    if (quantity > selectedSizeStock) {
      toast.error('No hay suficiente stock disponible para esta talla')
      return
    }

    addToCart(product, quantity, selectedSize, selectedColor)
    toast.success(`${quantity}x ${product.name} agregado al carrito`)
  }

  const handleWhatsApp = () => {
    let message: string
    if (stock === 0) {
      message =
        'Hola! Me interesa este producto 👇\n' +
        `*${product.name}*\n` +
        `💰 Precio: Bs ${product.price.toFixed(2)}\n` +
        '¿Cuándo habrá stock disponible? 🙏'
    } else {
      message =
        'Hola! Me interesa este producto 👇\n' +
        `*${product.name}*\n` +
        `💰 Precio: Bs ${product.price.toFixed(2)}\n` +
        (selectedSize ? `📏 Talla: ${selectedSize}\n` : '') +
        '¿Me pueden dar más información? 🙏'
    }
    window.open(`https://wa.me/59176020369?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <Container>
          <div className="py-4 flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/#catalogo" className="text-gray-600 hover:text-primary-600 transition-colors">
              Catálogo
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold truncate">{product.name}</span>
          </div>
        </Container>
      </div>

      {/* Product Detail */}
      <section className="py-12 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ProductGallery 
                images={product.images && product.images.length > 0 
                  ? product.images 
                  : [product.image_url || '/placeholder.png']
                }
                productName={product.name}
              />
              {isOutOfStock && (
                <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                  <span className="text-red-600 font-bold text-lg">
                    Sin Stock
                  </span>
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Category */}
              <div>
                <span className="inline-block bg-primary-100 text-primary-700 px-4 py-1 rounded-full text-sm font-semibold">
                  {product.categories?.name || 'Sin categoría'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Price */}
              <div className="space-y-2">
                {hasDiscount(product) ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-5xl font-bold text-red-600">
                        Bs {getPriceWithDiscount(product).toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                        <Percent className="w-4 h-4" />
                        -{discount}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-gray-400 line-through decoration-red-500 decoration-2">
                        Bs {product.price.toFixed(2)}
                      </span>
                      <span className="text-green-600 font-semibold text-lg">
                        Ahorras: Bs {getSavings(product).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-5xl font-bold text-primary-600">
                    Bs {product.price.toFixed(2)}
                  </span>
                )}
              </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-600" />
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                stock === 0
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-green-100 text-green-700'
              }`}>
                {stock === 0 ? 'Sin stock' : 'En stock'}
              </span>
            </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-700 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Brand */}
              {product.brand && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">
                    Marca: <span className="font-semibold">{product.brand}</span>
                  </span>
                </div>
              )}

              {/* Sizes — solo si el producto tiene tallas válidas (no vacías) */}
              {needsSize && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Selecciona una talla:
                    </label>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      <Ruler className="w-4 h-4" />
                      Guía de tallas
                    </button>
                  </div>
                  {isOutOfStock && (
                    <span className="inline-block mb-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                      ❌ Sin stock actualmente
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {validSizes.map((size: string) => {
                      const sizeStock = stockBySize[size] ?? 0
                      const sizeAgotada = sizeStock === 0
                      const sizeBaja = !sizeAgotada && sizeStock <= LOW_STOCK_THRESHOLD
                      const isSelected = selectedSize === size
                      return (
                        <div key={size} className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => {
                              if (!sizeAgotada) {
                                setSelectedSize(size)
                                setQuantity(1)
                              }
                            }}
                            disabled={sizeAgotada}
                            title={sizeAgotada ? 'Agotado' : undefined}
                            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                              sizeAgotada
                                ? 'opacity-40 cursor-not-allowed line-through bg-gray-100 text-gray-400'
                                : isSelected
                                  ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {size}
                          </button>
                          <span className={`text-xs font-medium ${
                            sizeAgotada
                              ? 'text-red-400'
                              : sizeBaja
                                ? 'text-amber-600'
                                : 'text-gray-500'
                          }`}>
                            {sizeAgotada
                              ? 'Agotado'
                              : sizeBaja
                                ? `⚠️ Últimas ${sizeStock}`
                                : `(${sizeStock})`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {isOutOfStock && (
                    <p className="text-red-400 text-xs mt-1">
                      ❌ Sin stock — puedes consultar por WhatsApp cuándo vuelve
                    </p>
                  )}
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Selecciona un color:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                          selectedColor === color
                            ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {!isOutOfStock && !selectedSizeAgotada && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Cantidad:
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={needsSize && !selectedSize}
                      className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))}
                      disabled={needsSize && !selectedSize}
                      className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  {needsSize && selectedSize && (
                    <p className="text-xs text-gray-400 mt-2">
                      Máx. {selectedSizeStock} unidades disponibles en talla {selectedSize}
                    </p>
                  )}
                  {!needsSize && (
                    <p className="text-xs text-gray-400 mt-2">
                      Máx. {stock} unidades disponibles
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addToCartDisabled}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    addToCartDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 shadow-lg'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addToCartLabel}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="px-6 py-4 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar
                </button>
              </div>

              {/* Shipping info banner */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#c89b6e] flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-700">Envíos en Santa Cruz</span>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  · Gratis en pedidos mayores a Bs {FREE_SHIPPING_THRESHOLD}
                </p>
                <p className="text-xs text-gray-500 ml-6">
                  · Desde Bs 5 según distancia GPS
                </p>
                <p className="text-xs text-gray-500 ml-6">
                  · Envío nacional próximamente
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Store className="w-4 h-4 text-[#c89b6e] flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Retiro en tienda gratis</span>{' '}
                    · Mercado Mutualista
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Productos Relacionados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => {
                  const relatedStock = getTotalStock(p)
                  return (
                    <Link
                      key={p.id}
                      href={`/producto/${p.id}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-primary-300"
                    >
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          src={p.image_url || '/placeholder.png'}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {relatedStock === 0 && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            Sin Stock
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-primary-600 text-sm font-semibold mb-1">
                          {p.categories?.name}
                        </p>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
                          {p.name}
                        </h3>
                        <div className="flex flex-col gap-1">
                          {hasDiscount(p) ? (
                            <>
                              <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-red-600">
                                  Bs {getPriceWithDiscount(p).toFixed(2)}
                                </p>
                                <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                  -{getDiscount(p)}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 line-through">
                                Bs {p.price.toFixed(2)}
                              </p>
                            </>
                          ) : (
                            <p className="text-xl font-bold text-primary-600">
                              Bs {p.price.toFixed(2)}
                            </p>
                          )}
                          <span className="text-xs text-gray-500">
                            Stock: {relatedStock}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.categories?.name}
      />
    </>
  )
}
