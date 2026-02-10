import { Sparkles, Percent, TrendingUp } from 'lucide-react'

interface ProductBadgesProps {
  isNew?: boolean
  discount?: number
  lowStock?: number
  isBestSeller?: boolean
}

export function ProductBadges({ isNew, discount, lowStock, isBestSeller }: ProductBadgesProps) {
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
      {isNew && (
        <span className="bg-accent-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          NUEVO
        </span>
      )}
      
      {discount && discount > 0 && (
        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Percent className="w-3 h-3" />
          -{discount}%
        </span>
      )}
      
      {lowStock && lowStock > 0 && lowStock < 5 && (
        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
          ¡Últimas {lowStock}!
        </span>
      )}
      
      {isBestSeller && (
        <span className="bg-primary-800 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          MÁS VENDIDO
        </span>
      )}
    </div>
  )
}
