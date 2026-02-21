'use client'
import { useMemo, useState } from 'react'
import { useWishlist } from '@/lib/context/WishlistContext'
import { useAuth } from '@/lib/context/AuthContext'
import { Product } from '@/lib/types'
import Container from '@/components/ui/Container'
import { Heart, ShoppingCart, Trash2, ExternalLink, MessageCircle, Share2, Check, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/context/CartContext'
import toast from 'react-hot-toast'
import { ProductBadges } from '@/components/catalogo/ProductBadges'
import { AuthModal } from '@/components/auth/AuthModal'

interface WishlistClientProps {
  allProducts: Product[]
}

export function WishlistClient({ allProducts }: WishlistClientProps) {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const { isLoggedIn, customerName } = useAuth()
  const { addToCart } = useCart()
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Filtrar productos que están en la wishlist
  const wishlistProducts = useMemo(() => {
    return allProducts.filter(p => wishlist.includes(p.id))
  }, [allProducts, wishlist])

  const getTotalStock = (product: Product): number => {
    return product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
  }

  const getDiscount = (product: Product): number => {
    return product.discount || product.discount_percentage || 0
  }

  const getPriceWithDiscount = (product: Product): number => {
    const discount = getDiscount(product)
    return product.price * (1 - discount / 100)
  }

  const hasDiscount = (product: Product): boolean => {
    return !!(product.discount && product.discount > 0) || !!(product.discount_percentage && product.discount_percentage > 0)
  }

  const handleAddToCart = (product: Product) => {
    const stock = getTotalStock(product)
    if (stock === 0) {
      toast.error('Producto sin stock', { position: 'bottom-center' })
      return
    }

    // Tallas válidas = excluir 'Unitalla'
    const validSizes = (product.sizes ?? []).filter(s => s !== 'Unitalla')

    if (validSizes.length > 1) {
      // Múltiples tallas → el cliente debe elegir desde la página de detalle
      toast('Selecciona una talla para este producto', {
        position: 'bottom-center',
        icon: '👕',
      })
      router.push(`/producto/${product.id}`)
      return
    }

    // 0 tallas válidas (accesorio/Unitalla) o exactamente 1 → añadir directo
    const sizeToAdd = validSizes.length === 1 ? validSizes[0] : undefined

    addToCart(product, 1, sizeToAdd)
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
          <p className="font-semibold text-gray-900 text-sm">Agregado al carrito</p>
          <p className="text-xs text-gray-500 truncate max-w-[180px]">{product.name}</p>
        </div>
      </motion.div>
    ), { duration: 1500, position: 'bottom-center' })
  }

  const handleWhatsAppConsult = (product: Product) => {
    const message = encodeURIComponent(
      `Hola! Estoy interesado en:\n\n` +
      `📦 ${product.name}\n` +
      `💰 Precio: Bs ${product.price.toFixed(2)}\n` +
      `${product.brand ? `🏷️ Marca: ${product.brand}\n` : ''}` +
      `\n¿Tienen disponible?`
    )
    window.open(`https://wa.me/59176020369?text=${message}`, '_blank')
  }

  const handleShareWishlist = () => {
    if (wishlist.length === 0) {
      toast.error('Tu lista está vacía', { position: 'bottom-center' })
      return
    }

    const url = `${window.location.origin}/wishlist?ids=${wishlist.join(',')}`
    navigator.clipboard.writeText(url)
    toast.success('¡Link copiado al portapapeles!', {
      position: 'bottom-center',
      icon: '🔗',
    })
  }

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de eliminar todos tus favoritos?')) {
      clearWishlist()
      toast.success('Lista de deseos limpiada', {
        position: 'bottom-center',
        icon: '🗑️',
      })
    }
  }

  return (
    <section className="min-h-screen py-24 bg-gray-50">
      <Container>
        {/* Banner de estado de sesión */}
        <div className="mb-6">
          {isLoggedIn ? (
            <div className="flex items-start gap-3 bg-[#1a1a1a] border border-[#c89b6e]/30 rounded-xl px-5 py-4">
              <Heart className="w-5 h-5 text-[#c89b6e] fill-current mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Tus favoritos guardados en tu cuenta
                  {customerName && (
                    <span className="text-[#c89b6e]"> · {customerName}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Se sincronizan en todos tus dispositivos
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 bg-[#1a1a1a] border border-gray-700 rounded-xl px-5 py-4">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-red-400 fill-current mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Tus favoritos (sesión actual)
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Inicia sesión para guardarlos permanentemente
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#c89b6e] hover:bg-[#b8895e] text-white text-xs font-semibold rounded-full transition-all shrink-0 hover:scale-105"
              >
                <LogIn className="w-3.5 h-3.5" />
                Iniciar sesión
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                Mi Lista de Deseos
              </h1>
              <p className="text-gray-600">
                {wishlistProducts.length === 0 
                  ? 'No tienes productos guardados aún' 
                  : `${wishlistProducts.length} producto${wishlistProducts.length !== 1 ? 's' : ''} guardado${wishlistProducts.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>

            {wishlistProducts.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleShareWishlist}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir lista
                </button>
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar todo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid de productos o estado vacío */}
        {wishlistProducts.length === 0 ? (
          /* Estado vacío */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl shadow-sm"
          >
            <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-16 h-16 text-red-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tu lista está vacía
            </h2>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Guarda tus productos favoritos haciendo click en el ❤️ de cada producto
            </p>
            <Link
              href="/#catalogo"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              Explorar productos
            </Link>
          </motion.div>
        ) : (
          /* Grid de productos */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {wishlistProducts.map((product) => {
              const stock = getTotalStock(product)
              const isOutOfStock = stock === 0
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-primary-300 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 relative"
                >
                  {/* Botón eliminar */}
                  <button
                    onClick={() => {
                      removeFromWishlist(product.id)
                      toast.success('Eliminado de favoritos', {
                        position: 'bottom-center',
                        icon: '💔',
                      })
                    }}
                    className="absolute top-3 right-3 z-20 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all hover:scale-110 shadow-lg"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

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

                      {/* Badges */}
                      <ProductBadges
                        isNew={product.is_new}
                        discount={getDiscount(product) || undefined}
                        lowStock={isOutOfStock ? 0 : stock}
                        isBestSeller={product.is_best_seller}
                        collection={product.collection}
                      />
                    </div>

                    {/* Info */}
                    <div className="p-4 sm:p-5">
                      {/* Categoría + Marca */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">
                          {product.categories?.name || 'Sin categoría'}
                        </span>
                        {product.brand && (
                          <span className="text-[10px] bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-semibold">
                            {product.brand}
                          </span>
                        )}
                      </div>

                      {/* Nombre */}
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      {/* Precio + Stock */}
                      <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                        <div>
                          {hasDiscount(product) ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-2xl font-black text-red-600">
                                Bs {getPriceWithDiscount(product).toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                Bs {product.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-black text-primary-600">
                              Bs {product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                          stock === 0 
                            ? 'bg-red-600 text-white shadow-lg' 
                            : stock < 10 
                              ? 'bg-amber-500 text-white shadow-md' 
                              : 'bg-green-500 text-white shadow-md'
                        }`}>
                          {stock === 0 ? '🚫 Sin stock' : stock < 10 ? `⚠️ ${stock}` : '✓ Stock'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Botones de acción */}
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all ${
                        isOutOfStock
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isOutOfStock ? 'Sin Stock' : 'Agregar'}
                    </button>
                    <button
                      onClick={() => handleWhatsAppConsult(product)}
                      className="px-4 py-2.5 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-full transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </Container>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode="login"
      />
    </section>
  )
}
