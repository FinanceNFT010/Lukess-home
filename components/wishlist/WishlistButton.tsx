'use client'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWishlist } from '@/lib/context/WishlistContext'
import toast from 'react-hot-toast'

interface WishlistButtonProps {
  productId: string
  productName: string
}

export function WishlistButton({ productId, productName }: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const isFavorite = isInWishlist(productId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isFavorite) {
      removeFromWishlist(productId)
      toast.success('Eliminado de favoritos', {
        position: 'bottom-center',
        duration: 1500,
        icon: '💔',
      })
    } else {
      addToWishlist(productId)
      toast.success('Agregado a favoritos', {
        position: 'bottom-center',
        duration: 1500,
        icon: '❤️',
      })
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
        isFavorite
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-md'
      }`}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <motion.div
        animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
          strokeWidth={2}
        />
      </motion.div>
    </motion.button>
  )
}
