'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WishlistContextType {
  wishlist: string[] // Array de product IDs
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar wishlist desde localStorage al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lukess-wishlist')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setWishlist(Array.isArray(parsed) ? parsed : [])
        } catch (error) {
          console.error('Error parsing wishlist:', error)
          setWishlist([])
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('lukess-wishlist', JSON.stringify(wishlist))
    }
  }, [wishlist, isLoaded])

  const addToWishlist = (productId: string) => {
    if (!wishlist.includes(productId)) {
      setWishlist([...wishlist, productId])
    }
  }

  const removeFromWishlist = (productId: string) => {
    setWishlist(wishlist.filter(id => id !== productId))
  }

  const isInWishlist = (productId: string): boolean => {
    return wishlist.includes(productId)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  const wishlistCount = wishlist.length

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
