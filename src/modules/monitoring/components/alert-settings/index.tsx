import { useState, useEffect } from 'react'

import { HStack, Badge, Tooltip, useDisclosure } from '@chakra-ui/react'
import { Bell } from 'lucide-react'

import { AlertSettingsPanel } from './alert-settings-panel'
import { soundOptions } from '../../constants/sounds'
import { useAlertSound } from '../../hooks/useAlertSound/useAlertSound'
import { useGuilds } from '../../hooks/useGuilds'
import { useAlertSettingsStore } from '../../stores/alert-settings-store'

const AlertSettings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { alerts, addAlert, removeAlert, toggleAlert } = useAlertSettingsStore()

  const { debouncedPlaySound: playSound } = useAlertSound()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  useGuilds(
    isInitialized
      ? { playSound: () => playSound('notification_sound.mp3') }
      : { playSound: () => console.debug('Sound not initialized yet') }
  )

  const handleAddAlert = () => {
    addAlert({
      timeRange: 5,
      threshold: 5,
      enabled: true,
      sound: 'notification_sound.mp3',
    })
  }

  return (
    <>
      <Tooltip label="Abrir configurações de monitoramento" placement="right">
        <HStack onClick={onOpen} cursor="pointer" spacing={3}>
          <Bell size={18} color="blue.400" />
          <Badge colorScheme="red" variant="solid" borderRadius="md">
            {alerts.filter(a => a.enabled).length} ALERTA DE ATAQUE
          </Badge>
        </HStack>
      </Tooltip>

      <AlertSettingsPanel
        isOpen={isOpen}
        onClose={onClose}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onRemoveAlert={removeAlert}
        onToggleAlert={toggleAlert}
        soundOptions={soundOptions}
        onTestSound={playSound}
      />
    </>
  )
}

export default AlertSettings
