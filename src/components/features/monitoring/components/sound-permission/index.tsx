import { useCallback, useEffect, useState } from 'react'

import { Button, Text, useToast } from '@chakra-ui/react'
import { Bell } from 'lucide-react'

import { Logger } from '@/middlewares/useLogger'

import { useSoundStore } from '../../stores/sounds-permission-store'

interface SoundPermissionProps {
  onPermissionGranted: () => void
}

export const SoundPermission = ({ onPermissionGranted }: SoundPermissionProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [shouldShow, setShouldShow] = useState(true)
  const { hasPermission, setHasPermission } = useSoundStore()
  const toast = useToast()
  const logger = Logger.getInstance()

  useEffect(() => {
    const persistedPermission = localStorage.getItem('sound-permission') === 'true'
    if (persistedPermission) {
      setHasPermission(true)
      onPermissionGranted()
      setShouldShow(false)
    }
  }, [onPermissionGranted, setHasPermission])

  const handlePermission = useCallback(async () => {
    if (hasPermission) return
    setIsLoading(true)

    try {
      // First try with a silent audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      oscillator.connect(audioContext.destination)
      oscillator.frequency.setValueAtTime(0, audioContext.currentTime) // Silent
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.001) // Extremely short duration

      setHasPermission(true)
      localStorage.setItem('sound-permission', 'true')
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
      logger.error('[Sound] Erro ao solicitar permissão:', error)
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
  }, [hasPermission, onPermissionGranted, toast, logger, setHasPermission])

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
