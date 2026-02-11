'use client'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useWishlist } from '@/lib/context/WishlistContext'
import { motion, AnimatePresence } from 'framer-motion'

export function WishlistIcon() {
  const { wishlistCount } = useWishlist()

  return (
    <Link
      href="/wishlist"
      className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all duration-300 group"
      aria-label={`Lista de deseos (${wishlistCount} productos)`}
    >
      <Heart className="w-5 h-5 text-gray-700 group-hover:text-red-500 transition-colors" />
      
      {/* Badge contador */}
      <AnimatePresence>
        {wishlistCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg"
          >
            {wishlistCount > 9 ? '9+' : wishlistCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
