import { useEffect, useCallback, useRef } from 'react'
import { useToast } from '@chakra-ui/react'
import { GuildMemberResponse } from '../../../../types/interfaces/guild/guild-member.interface'
import { useMonitoringStore } from '../../../../stores/monitoring-store'

export const useCharacterMonitoring = (characters: GuildMemberResponse[], types: string[]) => {
  const { threshold, timeWindow, monitoredLists, setThreshold, setTimeWindow, setMonitoredLists } =
    useMonitoringStore()
  const toast = useToast()
  const lastAlertTimeRef = useRef<number>(0)
  const recentLoginsRef = useRef<Set<string>>(new Set())

  const speakMessage = useCallback((msg: string) => {
    const utterance = new SpeechSynthesisUtterance(msg)
    utterance.lang = 'pt-BR'
    const voices = speechSynthesis.getVoices()

    const brVoice = voices.find((voice) => voice.lang === 'pt-BR')
    if (brVoice) {
      utterance.voice = brVoice
    }

    utterance.pitch = 0.7
    utterance.rate = 0.9
    utterance.volume = 1.2

    utterance.onstart = () => console.log('Speech started')
    utterance.onend = () => console.log('Speech ended')
    utterance.onerror = (event) => console.error('Speech error:', event)

    speechSynthesis.speak(utterance)
  }, [])

  const checkThreshold = useCallback(() => {
    const now = Date.now()
    if (now - lastAlertTimeRef.current < 60000) return

    const recentLogins = Array.from(recentLoginsRef.current)
    const filteredCharacters = characters.filter(
      (char) => monitoredLists.includes(char.Kind) && recentLogins.includes(char.Name),
    )
    const totalRecentCount = filteredCharacters.length

    if (totalRecentCount >= threshold) {
      lastAlertTimeRef.current = now
      const recentCounts = monitoredLists.reduce(
        (acc, list) => {
          acc[list] = filteredCharacters.filter((char) => char.Kind === list).length
          return acc
        },
        {} as Record<string, number>,
      )

      const msg = `Alerta! Total de ${totalRecentCount} personagens logaram nos últimos ${timeWindow} segundos! Detalhes: ${Object.entries(
        recentCounts,
      )
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => `${count} ${type}`)
        .join(', ')}`

      toast({
        title: 'Alerta de Personagens!',
        description: msg,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      })

      speakMessage(msg)

      recentLoginsRef.current.clear()
    }
  }, [characters, threshold, timeWindow, toast, monitoredLists, speakMessage])

  useEffect(() => {
    const timer = setInterval(checkThreshold, 10000)
    return () => clearInterval(timer)
  }, [checkThreshold])

  useEffect(() => {
    setMonitoredLists(monitoredLists.filter((type) => types.includes(type)))
  }, [types, setMonitoredLists])

  const handleCheckboxChange = useCallback(
    (type: string, isChecked: boolean) => {
      setMonitoredLists(
        isChecked ? [...monitoredLists, type] : monitoredLists.filter((t) => t !== type),
      )
    },
    [monitoredLists, setMonitoredLists],
  )

  const handleStatusChange = useCallback(
    (member: GuildMemberResponse, changeType: string) => {
      if (changeType === 'logged-in') {
        recentLoginsRef.current.add(member.Name)
        setTimeout(() => {
          recentLoginsRef.current.delete(member.Name)
        }, timeWindow * 1000)
        checkThreshold()
      }
    },
    [timeWindow, checkThreshold],
  )

  return {
    threshold,
    setThreshold,
    timeWindow,
    setTimeWindow,
    monitoredLists,
    handleCheckboxChange,
    handleStatusChange,
  }
}
