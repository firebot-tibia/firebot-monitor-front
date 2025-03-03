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
      localStorage.setItem('sound-permission', String(hasPermission))
    }
  },
  playSound: async (sound: AlertCondition['sound']) => {
    const { hasPermission } = get()
    console.log('Attempting to play sound:', sound, 'Permission:', hasPermission)
    if (!hasPermission || typeof window === 'undefined') {
      console.debug('Sound permission not granted or not in browser, skipping sound')
      return
    }

    // Set user interaction flag if not already set
    if (!document.documentElement.hasAttribute('data-user-interacted')) {
      document.documentElement.setAttribute('data-user-interacted', 'true')
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
      console.log('Attempting to play sound from:', audioPath)

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
            console.log('Audio loaded successfully:', audioPath)
            resolve(true)
          },
          { once: true },
        )
        audio.addEventListener(
          'error',
          e => {
            clearTimeout(timeoutId)
            console.error('Error loading audio:', e)
            reject(new Error(`Failed to load audio: ${audioPath}`))
          },
          { once: true },
        )
      })

      // Load and play the audio
      try {
        await loadPromise
        await audio.play()
        console.log('Audio played successfully:', audioPath)

        // Clean up after playback
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
        console.error('Error playing audio:', error)
        source.disconnect()
        audioContext.close()
        audio.remove()
        throw error
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
