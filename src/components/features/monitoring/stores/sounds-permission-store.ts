import { create } from 'zustand'

import type { AlertCondition } from '../types/alert.types'

interface SoundState {
  hasPermission: boolean
  setHasPermission: (hasPermission: boolean) => void
  playSound: (sound: AlertCondition['sound']) => Promise<void>
}

export const useSoundStore = create<SoundState>((set, get) => ({
  hasPermission: false, // Always start with no permission until explicitly granted
  setHasPermission: (hasPermission: boolean) => {
    set({ hasPermission })
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound-permission', String(hasPermission))
    }
  },
  playSound: async (sound: AlertCondition['sound']) => {
    const { hasPermission } = get()
    if (!hasPermission || typeof window === 'undefined') {
      console.debug('Sound permission not granted or not in browser, skipping sound')
      return
    }

    try {
      if (sound.startsWith('google_voice_')) {
        const msg = new SpeechSynthesisUtterance(getVoiceMessage(sound))
        msg.lang = 'pt-BR'
        msg.volume = 1.0
        msg.rate = 1.1
        msg.pitch = 1.0

        // Check if speech synthesis is available and not speaking
        if (window.speechSynthesis && !window.speechSynthesis.speaking) {
          window.speechSynthesis.speak(msg)
        }
        return
      }

      const audioPath = `/sounds/${sound}`
      const audio = new Audio(audioPath)
      audio.volume = 0.7
      audio.preload = 'auto'

      // Create a promise that resolves when the audio is loaded
      const loadPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
      })

      // Load the audio
      await loadPromise

      // Try to play only if the document has been interacted with
      if (document.documentElement.hasAttribute('data-user-interacted')) {
        await audio.play()
      } else {
        console.debug('Waiting for user interaction before playing sound')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.debug('Sound playback requires user interaction first')
      } else {
        console.error('Error playing sound:', error)
      }
    }
  },
}))

const getVoiceMessage = (sound: AlertCondition['sound']) => {
  switch (sound) {
    case 'google_voice_alert':
      return 'Atenção! Possível ameaça detectada!'
    case 'google_voice_warning':
      return 'Aviso! Atividade suspeita detectada na área!'
    case 'google_voice_enemy':
      return 'Alerta vermelho! Inimigo detectado nas proximidades!'
    default:
      return ''
  }
}
