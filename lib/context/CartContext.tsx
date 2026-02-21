'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'
import { CartItem, Product } from '@/lib/types'

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('lukess-cart')
    if (saved) {
      try {
        setCart(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lukess-cart', JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const getAvailableStock = (product: Product, size?: string): number => {
    if (!product.inventory || product.inventory.length === 0) return 0
    if (size) {
      return product.inventory
        .filter(inv => inv.size === size)
        .reduce((sum, inv) => sum + Math.max(0, inv.quantity - (inv.reserved_qty ?? 0)), 0)
    }
    // Sin talla (accesorios): sumar todo el inventario
    return product.inventory
      .reduce((sum, inv) => sum + Math.max(0, inv.quantity - (inv.reserved_qty ?? 0)), 0)
  }

  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    const itemId = `${product.id}-${size || 'nosize'}-${color || 'nocolor'}`
    const existingItem = cart.find(item => item.id === itemId)
    const currentQtyInCart = existingItem?.quantity ?? 0
    const availableStock = getAvailableStock(product, size)

    if (availableStock === 0) {
      toast.error('Producto sin stock disponible', { position: 'bottom-center' })
      return
    }

    if (currentQtyInCart + quantity > availableStock) {
      toast.error(`Solo hay ${availableStock} unidad${availableStock !== 1 ? 'es' : ''} disponible${availableStock !== 1 ? 's' : ''}`, {
        position: 'bottom-center',
      })
      return
    }

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, { 
        id: itemId,
        product, 
        quantity, 
        size, 
        color 
      }])
    }
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ))
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      total, 
      itemCount 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
