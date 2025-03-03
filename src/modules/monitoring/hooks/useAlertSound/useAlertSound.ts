import { useCallback, useRef } from 'react'

import { useSoundStore } from '../../stores/alert-system/sounds-permission-store'
import type { AlertCondition } from '../../types/alert'

export const useAlertSound = () => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const { playSound: playSoundFromStore, hasPermission } = useSoundStore()

  const playSound = useCallback(
    async (sound: AlertCondition['sound']) => {
      if (!hasPermission) {
        console.log('Sound permission not granted, skipping sound')
        return
      }
      try {
        await playSoundFromStore(sound)
        console.log('Sound played successfully:', sound)
      } catch (error) {
        console.error('Failed to play sound:', error)
      }
    },
    [playSoundFromStore, hasPermission],
  )

  const debouncedPlaySound = useCallback(
    (sound: AlertCondition['sound']) => {
      if (!hasPermission) return

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        playSound(sound)
      }, 500)
    },
    [playSound, hasPermission],
  )

  return {
    playSound,
    debouncedPlaySound,
  }
}
