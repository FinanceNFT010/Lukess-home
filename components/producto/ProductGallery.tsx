'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const goToNext = () => setCurrentIndex((i) => (i + 1) % images.length)
  const goToPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length)

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden group">
        <Image
          src={images[currentIndex]}
          alt={`${productName} - Imagen ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
          quality={85}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Botón zoom */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-4 right-4 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
          aria-label="Ampliar imagen"
        >
          <ZoomIn className="w-5 h-5 text-gray-800" />
        </button>

        {/* Navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Indicador */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all hover:border-primary-600 ${
                i === currentIndex ? 'border-primary-800' : 'border-gray-200'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                loading="lazy"
                quality={60}
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal zoom fullscreen */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
              onClick={() => setIsZoomed(false)}
              aria-label="Cerrar zoom"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
              <Image
                src={images[currentIndex]}
                alt={productName}
                fill
                className="object-contain"
              />
            </div>

            {/* Navegación en zoom */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Contador de imágenes */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
