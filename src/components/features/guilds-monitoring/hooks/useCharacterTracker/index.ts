import { useCallback, useEffect, useRef, useState } from 'react'

interface TrackedCharacter {
  name: string
  timestamp: number
}

interface UseCharacterTrackerReturn {
  activeCharacterCount: number
  addCharacter: (name: string) => void
  resetTracker: () => void
}

export const useCharacterTracker = (
  windowMinutes: number = 5,
  threshold: number = 2,
): UseCharacterTrackerReturn => {
  // Store tracked characters with timestamps
  const [trackedCharacters, setTrackedCharacters] = useState<TrackedCharacter[]>([])
  const [activeCharacterCount, setActiveCharacterCount] = useState(0)

  // Use ref for cleanup interval
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup old entries
  const cleanupOldEntries = useCallback(() => {
    const now = Date.now()
    const windowMs = windowMinutes * 60 * 1000
    const cutoffTime = now - windowMs

    setTrackedCharacters(prev => {
      const filtered = prev.filter(char => char.timestamp > cutoffTime)

      // Log cleanup results
      if (prev.length !== filtered.length) {
        console.log('Character tracker cleanup:', {
          before: prev.length,
          after: filtered.length,
          removed: prev.length - filtered.length,
          windowMinutes,
          cutoffTime: new Date(cutoffTime).toISOString(),
        })
      }

      return filtered
    })
  }, [windowMinutes])

  // Update active count
  const updateActiveCount = useCallback(() => {
    const now = Date.now()
    const windowMs = windowMinutes * 60 * 1000
    const cutoffTime = now - windowMs

    const activeCount = trackedCharacters.filter(char => char.timestamp > cutoffTime).length

    setActiveCharacterCount(activeCount)

    // Se atingiu o limite, resetar o contador
    if (activeCount >= threshold) {
      console.log('Character threshold reached, resetting tracker')
      setTrackedCharacters([])
      setActiveCharacterCount(0)
    }
  }, [trackedCharacters, windowMinutes, threshold])

  // Add new character
  const addCharacter = useCallback(
    (name: string) => {
      const now = Date.now()

      setTrackedCharacters(prev => {
        // Check if character is already tracked in the window
        const exists = prev.some(
          char => char.name === name && char.timestamp > now - windowMinutes * 60 * 1000,
        )

        if (exists) {
          console.log('Character already tracked:', { name, windowMinutes })
          return prev
        }

        console.log('Adding new character to tracker:', {
          name,
          timestamp: new Date(now).toISOString(),
          currentCount: prev.length,
        })

        const newCharacters = [...prev, { name, timestamp: now }]

        // Atualizar contador imediatamente
        const activeCount = newCharacters.filter(
          char => char.timestamp > now - windowMinutes * 60 * 1000,
        ).length

        setActiveCharacterCount(activeCount)

        return newCharacters
      })
    },
    [windowMinutes],
  )

  // Reset tracker
  const resetTracker = useCallback(() => {
    console.log('Resetting character tracker')
    setTrackedCharacters([])
    setActiveCharacterCount(0)
  }, [])

  // Setup cleanup interval
  useEffect(() => {
    // Atualizar contador inicial
    updateActiveCount()

    // Executar limpeza e atualização a cada 10 segundos
    cleanupIntervalRef.current = setInterval(() => {
      cleanupOldEntries()
      updateActiveCount()
    }, 10 * 1000) // A cada 10 segundos

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [cleanupOldEntries, updateActiveCount])

  // Update count when characters change
  useEffect(() => {
    updateActiveCount()
  }, [trackedCharacters, updateActiveCount])

  return {
    activeCharacterCount,
    addCharacter,
    resetTracker,
  }
}
