import { Sparkles, Percent, TrendingUp, Leaf } from 'lucide-react'

interface ProductBadgesProps {
  isNew?: boolean
  discount?: number
  lowStock?: number
  isBestSeller?: boolean
  collection?: string | null
}

export function ProductBadges({ isNew, discount, lowStock, isBestSeller, collection }: ProductBadgesProps) {
  return (
    <>
      {/* Badge NUEVO - Círculo en la parte inferior izquierda */}
      {isNew && (
        <div className="absolute bottom-2 left-2 z-20">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <div className="text-center">
                <Sparkles className="w-3 h-3 text-white mx-auto mb-0.5" />
                <span className="text-white text-[9px] font-black tracking-tight">NUEVO</span>
              </div>
            </div>
            {/* Efecto de brillo */}
            <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-white/30 to-transparent rounded-full" />
          </div>
        </div>
      )}

      {/* Badges en la esquina superior izquierda */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        {/* Badge de colección Primavera */}
        {collection === 'primavera' && !isNew && (
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            PRIMAVERA
          </span>
        )}
        
        {discount && discount > 0 && (
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Percent className="w-3 h-3" />
            -{discount}%
          </span>
        )}
        
        {isBestSeller && (
          <span className="bg-primary-800 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            MÁS VENDIDO
          </span>
        )}
      </div>
    </>
  )
}
