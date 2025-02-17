import { useCallback, useRef } from 'react'

import { useSoundStore } from '../stores/sounds-permission-store'
import type { AlertCondition } from '../types/alert.types'

export const useAlertSound = () => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const { playSound: playSoundFromStore } = useSoundStore()

  const playSound = useCallback(
    async (sound: AlertCondition['sound']) => {
      await playSoundFromStore(sound)
    },
    [playSoundFromStore],
  )

  const debouncedPlaySound = useCallback(
    (sound: AlertCondition['sound']) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        playSound(sound)
      }, 500)
    },
    [playSound],
  )

  return {
    playSound,
    debouncedPlaySound,
  }
}
