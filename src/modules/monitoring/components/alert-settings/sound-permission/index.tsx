import { useCallback, useEffect, useState } from 'react'

import { Button, Text, useToast } from '@chakra-ui/react'
import { Bell } from 'lucide-react'

import { useSoundStore } from '../../../stores/alert-system/sounds-permission-store'

interface SoundPermissionProps {
  onPermissionGranted: () => void
}

export const SoundPermission = ({ onPermissionGranted }: SoundPermissionProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [shouldShow, setShouldShow] = useState(true)
  const { hasPermission, setHasPermission } = useSoundStore()
  const toast = useToast()

  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Always try to initialize audio context first
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        await audioContext.resume()

        const persistedPermission =
          typeof window !== 'undefined'
            ? localStorage.getItem('sound-permission') === 'true'
            : false
        if (persistedPermission) {
          // Verify if we can actually play sounds
          const testAudio = new Audio('/sounds/notification_sound.mp3')
          testAudio.volume = 0.01 // Very quiet test

          await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error('Audio load timeout')), 5000)
            testAudio.addEventListener(
              'canplaythrough',
              () => {
                clearTimeout(timeoutId)
                resolve(true)
              },
              { once: true },
            )
            testAudio.addEventListener(
              'error',
              e => {
                clearTimeout(timeoutId)
                reject(e)
              },
              { once: true },
            )
          })

          // Try a quick play test
          await testAudio.play()
          await new Promise(resolve => setTimeout(resolve, 50))
          testAudio.pause()
          testAudio.remove()

          setHasPermission(true)
          onPermissionGranted()
          setShouldShow(false)
        }
      } catch (error) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sound-permission')
        }
        setHasPermission(false)
      }
    }

    // Run the check immediately
    checkPermission()

    // Also run when the window gains focus
    const handleFocus = () => checkPermission()
    window.addEventListener('focus', handleFocus)

    return () => window.removeEventListener('focus', handleFocus)
  }, [onPermissionGranted, setHasPermission])

  const handlePermission = useCallback(async () => {
    if (hasPermission) return
    setIsLoading(true)

    try {
      // Initialize audio context first
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      await audioContext.resume()

      // Test audio playback with a real sound file
      const testAudio = new Audio('/sounds/notification_sound.mp3')
      testAudio.volume = 0.1 // Very low volume for testing

      // Wait for the audio to load with timeout
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Audio load timeout')), 5000)
        testAudio.addEventListener(
          'canplaythrough',
          () => {
            clearTimeout(timeoutId)
            resolve(true)
          },
          { once: true },
        )
        testAudio.addEventListener(
          'error',
          e => {
            clearTimeout(timeoutId)
            reject(e)
          },
          { once: true },
        )
      })

      // Try to play the test sound
      await testAudio.play()
      await new Promise(resolve => setTimeout(resolve, 50))
      testAudio.pause()
      testAudio.remove()

      setHasPermission(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('sound-permission', 'true')
      }
      onPermissionGranted()
      setShouldShow(false)
      toast({
        title: 'Sons habilitados',
        description: 'Você receberá notificações sonoras quando houver novos membros.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao habilitar sons',
        description: 'Verifique se seu navegador permite notificações sonoras.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [hasPermission, onPermissionGranted, toast, setHasPermission])

  if (hasPermission || !shouldShow) return null

  return (
    <div className="rounded-xl border border-white/10 bg-black/95 px-4 py-3 shadow-xl backdrop-blur-lg">
      <div className="mb-3 space-y-1">
        <Text fontSize="sm" fontWeight="medium" className="text-gray-200">
          Notificações Sonoras
        </Text>
        <Text fontSize="xs" className="text-gray-400">
          Habilite os sons para receber alertas quando novos membros entrarem.
        </Text>
      </div>
      <Button
        size="sm"
        width="full"
        onClick={handlePermission}
        colorScheme="blue"
        leftIcon={<Bell size={14} />}
        isLoading={isLoading}
        loadingText="Habilitando..."
        _hover={{ transform: 'translateY(-1px)' }}
        _active={{ transform: 'translateY(0px)' }}
        transition="all 0.2s"
      >
        Habilitar Sons
      </Button>
    </div>
  )
}
