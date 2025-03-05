'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetTime: Date
  onComplete?: () => void
}

export function Countdown({ targetTime, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = targetTime.getTime() - now.getTime()

      if (difference <= 0) {
        onComplete?.()
        return '00:00'
      }

      const seconds = Math.floor((difference / 1000) % 60)
      return `${seconds.toString().padStart(2, '0')}s`
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft === '00:00') {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetTime, onComplete])

  return timeLeft
}
