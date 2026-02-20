'use client'
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { wishlistService } from '@/lib/services/wishlistService'

interface WishlistContextType {
  wishlist: string[]
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
  wishlistCount: number
}

const WISHLIST_KEY = 'lukess-wishlist'

const getLocalWishlist = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]')
  } catch {
    return []
  }
}

const saveLocalWishlist = (ids: string[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids))
}

const clearLocalWishlist = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(WISHLIST_KEY)
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth()
  const [wishlist, setWishlist] = useState<string[]>([])
  const prevUserIdRef = useRef<string | null>(null)

  // Sync wishlist when auth state changes
  useEffect(() => {
    const currentUserId = user?.id ?? null

    if (isLoggedIn && user) {
      if (prevUserIdRef.current !== currentUserId) {
        // New login: merge localStorage into Supabase
        const localIds = getLocalWishlist()
        wishlistService
          .mergeLocalWishlist(user.id, localIds)
          .then((mergedIds) => {
            setWishlist(mergedIds)
            clearLocalWishlist()
          })
          .catch((err) => {
            console.error('Error merging wishlist:', err)
            // Fall back to local items if Supabase fails
            setWishlist(localIds)
          })
      }
    } else {
      // Guest or logged out: use localStorage
      if (prevUserIdRef.current !== null) {
        // Just logged out — clear in-memory wishlist
        setWishlist([])
      } else {
        // Initial load as guest
        setWishlist(getLocalWishlist())
      }
    }

    prevUserIdRef.current = currentUserId
  }, [isLoggedIn, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const addToWishlist = async (productId: string) => {
    if (wishlist.includes(productId)) return

    if (isLoggedIn && user) {
      setWishlist((prev) => [...prev, productId])
      try {
        await wishlistService.addToWishlist(user.id, productId)
      } catch (err) {
        console.error('Error adding to wishlist:', err)
        setWishlist((prev) => prev.filter((id) => id !== productId))
      }
    } else {
      const updated = [...wishlist, productId]
      setWishlist(updated)
      saveLocalWishlist(updated)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (isLoggedIn && user) {
      setWishlist((prev) => prev.filter((id) => id !== productId))
      try {
        await wishlistService.removeFromWishlist(user.id, productId)
      } catch (err) {
        console.error('Error removing from wishlist:', err)
        setWishlist((prev) => [...prev, productId])
      }
    } else {
      const updated = wishlist.filter((id) => id !== productId)
      setWishlist(updated)
      saveLocalWishlist(updated)
    }
  }

  const clearWishlist = async () => {
    if (isLoggedIn && user) {
      setWishlist([])
      try {
        await wishlistService.clearWishlist(user.id)
      } catch (err) {
        console.error('Error clearing wishlist:', err)
      }
    } else {
      setWishlist([])
      clearLocalWishlist()
    }
  }

  const isInWishlist = (productId: string): boolean => wishlist.includes(productId)

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
