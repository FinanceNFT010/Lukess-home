'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiProps {
  isActive: boolean
  duration?: number
}

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  delay: number
  type: 'circle' | 'square' | 'star'
}

const colors = [
  '#21808D', // primary
  '#D4AF37', // accent gold
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
]

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    type: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star',
  }))
}

export function Confetti({ isActive, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isActive) {
      setParticles(generateParticles(50))
      setShow(true)
      
      // Reproducir sonido de celebración
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Sonido de "ding" de éxito
        const playSuccessSound = () => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
        }
        
        playSuccessSound()
        
        // Segundo sonido más agudo
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator()
          const gainNode2 = audioContext.createGain()
          
          oscillator2.connect(gainNode2)
          gainNode2.connect(audioContext.destination)
          
          oscillator2.frequency.setValueAtTime(1046.50, audioContext.currentTime) // C6
          gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime)
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          
          oscillator2.start(audioContext.currentTime)
          oscillator2.stop(audioContext.currentTime + 0.3)
        }, 200)
        
      } catch (e) {
        // Audio no disponible, continuar sin sonido
        console.log('Audio not available')
      }
      
      const timer = setTimeout(() => {
        setShow(false)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isActive, duration])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: `${particle.x}vw`,
                y: '-5vh',
                rotate: 0,
                scale: particle.scale,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: particle.rotation + 720,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: particle.delay,
                ease: 'easeIn',
              }}
              style={{
                position: 'absolute',
                width: particle.type === 'star' ? 20 : 12,
                height: particle.type === 'star' ? 20 : 12,
              }}
            >
              {particle.type === 'circle' && (
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: particle.color }}
                />
              )}
              {particle.type === 'square' && (
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: particle.color }}
                />
              )}
              {particle.type === 'star' && (
                <svg viewBox="0 0 24 24" fill={particle.color}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </motion.div>
          ))}
          
          {/* Explosión central de luz */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 2], opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-radial from-accent-400/50 to-transparent"
          />
        </div>
      )}
    </AnimatePresence>
  )
}

// Componente de estrellas brillantes
export function SparkleEffect({ isActive }: { isActive: boolean }) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])

  useEffect(() => {
    if (isActive) {
      setSparkles(
        Array.from({ length: 20 }, (_, i) => ({
          id: i,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          size: 4 + Math.random() * 8,
          delay: Math.random() * 0.5,
        }))
      )
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: sparkle.delay,
            repeat: 2,
            repeatDelay: 0.3,
          }}
          className="absolute pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
        >
          <svg viewBox="0 0 24 24" fill="#D4AF37" className="w-full h-full">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
