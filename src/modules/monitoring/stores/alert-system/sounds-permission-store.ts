import { create } from 'zustand'

import type { AlertCondition } from '../../types/alert'

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('sound-permission', String(hasPermission))
      }
    }
  },
  playSound: async (sound: AlertCondition['sound']) => {
    const { hasPermission } = get()

    if (!hasPermission || typeof window === 'undefined') {
      return
    }

    // Set user interaction flag if not already set
    if (!document.documentElement.hasAttribute('data-user-interacted')) {
      document.documentElement.setAttribute('data-user-interacted', 'true')
    }

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

    // Create a new AudioContext for this playback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    await audioContext.resume()

    // Create audio element
    const audio = new Audio(audioPath)
    audio.volume = 0.7
    audio.preload = 'auto'

    // Create audio source node
    const source = audioContext.createMediaElementSource(audio)
    source.connect(audioContext.destination)

    // Create a promise that resolves when the audio is loaded
    const loadPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('Audio load timeout')), 5000)
      audio.addEventListener(
        'canplaythrough',
        () => {
          clearTimeout(timeoutId)

          resolve(true)
        },
        { once: true },
      )
      audio.addEventListener(
        'error',
        e => {
          clearTimeout(timeoutId)

          reject(new Error(`Failed to load audio: ${audioPath}`))
        },
        { once: true },
      )
    })

    try {
      await loadPromise
      await audio.play()
      audio.addEventListener(
        'ended',
        () => {
          source.disconnect()
          audioContext.close()
          audio.remove()
        },
        { once: true },
      )
    } catch (error) {
      source.disconnect()
      audioContext.close()
      audio.remove()
      throw error
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
