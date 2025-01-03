import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { GuildMemberResponse } from '../../../../types/interfaces/guild/guild-member.interface'
import { useAudio, AudioControl } from '../../../../hooks/use-audio'

export const useMonitorToggleSection = (
  guildData: GuildMemberResponse[],
  characterChanges: GuildMemberResponse[],
  setCharacterChanges: React.Dispatch<React.SetStateAction<GuildMemberResponse[]>>,
  isLoading: boolean,
  onStartMonitoring: () => void,
) => {
  const [isClient, setIsClient] = useState(false)
  const [monitoringStarted, setMonitoringStarted] = useState(false)
  const [deathAudio, levelUpAudio] = useAudio([
    '/assets/notification_sound.mp3',
    '/assets/notification_sound2.wav',
  ]) as [AudioControl, AudioControl]

  const toast = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleToggleDeathAudio = useCallback(() => {
    deathAudio.toggleAudio()
    toast({
      title: 'Alerta sonoro de mortes alterado',
      description: 'O estado do alerta sonoro de mortes foi alterado.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [deathAudio, toast])

  const handleToggleLevelUpAudio = useCallback(() => {
    levelUpAudio.toggleAudio()
    toast({
      title: 'Alerta sonoro de level up alterado',
      description: 'O estado do alerta sonoro de level up foi alterado.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [levelUpAudio, toast])

  const testDeathAudio = useCallback(() => {
    deathAudio.playAudio()
  }, [deathAudio])

  const testLevelUpAudio = useCallback(() => {
    levelUpAudio.playAudio()
  }, [levelUpAudio])

  const handleStartMonitoring = useCallback(() => {
    if (!monitoringStarted) {
      setMonitoringStarted(true)
      deathAudio.markUserInteraction()
      levelUpAudio.markUserInteraction()
      onStartMonitoring()
      toast({
        title: 'Monitoramento iniciado',
        description: 'O monitoramento foi iniciado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [monitoringStarted, deathAudio, levelUpAudio, onStartMonitoring, toast])

  return {
    isClient,
    monitoringStarted,
    deathAudio,
    levelUpAudio,
    handleToggleDeathAudio,
    handleToggleLevelUpAudio,
    testDeathAudio,
    testLevelUpAudio,
    handleStartMonitoring,
    guildData,
    characterChanges,
    setCharacterChanges,
    isLoading,
  }
}
