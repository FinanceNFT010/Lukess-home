'use client'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'

interface CartButtonProps {
  onClick: () => void
}

export function CartButton({ onClick }: CartButtonProps) {
  const { itemCount } = useCart()

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      aria-label="Carrito de compras"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
          {itemCount}
        </span>
      )}
    </button>
  )
}
