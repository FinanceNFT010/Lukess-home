'use client'
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  targetDate: Date
  message?: string
}

export function CountdownTimer({ targetDate, message = 'Oferta termina en' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-accent-600 to-accent-400 text-white px-4 py-3 rounded-lg shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">{message}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-accent-600 to-accent-400 text-white px-4 py-3 rounded-lg shadow-lg mb-12">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Clock className="w-5 h-5" />
        <span className="font-semibold">{message}:</span>
        <div className="flex gap-2">
          {timeLeft.days > 0 && (
            <TimeUnit value={timeLeft.days} label="días" />
          )}
          <TimeUnit value={timeLeft.hours} label="h" />
          <TimeUnit value={timeLeft.minutes} label="m" />
          <TimeUnit value={timeLeft.seconds} label="s" />
        </div>
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-sm opacity-90">{label}</span>
    </div>
  )
}
