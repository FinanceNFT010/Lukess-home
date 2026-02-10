'use client'
import { useState } from 'react'
import Container from '@/components/ui/Container'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import { ShoppingCart, MessageCircle, Package, TrendingUp, ChevronRight, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ProductGallery } from './ProductGallery'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  const getTotalStock = (p: Product): number => {
    return p.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
  }

  const stock = getTotalStock(product)
  const isOutOfStock = stock === 0

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

    if (quantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`)
      return
    }

    addToCart(product, quantity, selectedSize, selectedColor)
    toast.success(`${quantity}x ${product.name} agregado al carrito`)
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola! Estoy interesado en:\n\n` +
      `📦 ${product.name}\n` +
      `💰 Precio: Bs ${product.price.toFixed(2)}\n` +
      `📏 Talla: ${selectedSize || 'A consultar'}\n` +
      `🎨 Color: ${selectedColor || 'A consultar'}\n\n` +
      `¿Tienen disponible?`
    )
    window.open(`https://wa.me/59176020369?text=${message}`, '_blank')
  }

  const margin = product.cost > 0 ? ((product.price - product.cost) / product.cost * 100).toFixed(1) : '0'

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
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-primary-600">
                  Bs {product.price.toFixed(2)}
                </span>
                {product.cost > 0 && (
                  <span className="text-lg text-gray-500">
                    ({margin}% ganancia)
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">
                  Stock disponible: 
                  <span className={`font-bold ml-2 ${stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {stock} unidades
                  </span>
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

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Selecciona una talla:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                          selectedSize === size
                            ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
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
              {!isOutOfStock && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Cantidad:
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="px-6 py-4 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar
                </button>
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
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-primary-600">
                            Bs {p.price.toFixed(2)}
                          </p>
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
    </>
  )
}
