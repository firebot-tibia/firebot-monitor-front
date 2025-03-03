import { useEffect, useState, useCallback, useRef } from 'react'

import { HStack, Badge, Tooltip, useDisclosure, Text } from '@chakra-ui/react'
import { Bell } from 'lucide-react'

import type { GuildMemberResponse } from '@/core/types/guild-member.response'

import { AlertSettingsPanel } from './alert-settings-panel'
import { soundOptions } from '../../constants/sounds'
import { useGuildContext } from '../../contexts/guild-context'
import { useAlertSound } from '../../hooks/useAlertSound/useAlertSound'
import { useAlertSettingsStore } from '../../stores/alert-settings-store'

const RECENT_LOGIN_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds
const MAX_ALERT_TRIGGERS = 5 // Maximum number of times to trigger alert in a minute
const ALERT_RESET_INTERVAL = 60 * 1000 // 1 minute in milliseconds

const AlertSettings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlertSettingsStore()
  const { debouncedPlaySound: playSound } = useAlertSound()
  const { guildData } = useGuildContext()
  const [recentLogins, setRecentLogins] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Track alert triggers
  const alertTriggersRef = useRef<number>(0)
  const lastAlertTimeRef = useRef<number>(0)
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkAndTriggerAlerts = useCallback(
    (members: GuildMemberResponse[]) => {
      const now = new Date()
      let reachedThreshold = false
      let triggeredAlert = null

      // Count recent logins
      const recentLoginCount = members.filter(member => {
        if (!member.OnlineSince || !member.OnlineStatus) return false
        const loginTime = new Date(member.OnlineSince)
        return now.getTime() - loginTime.getTime() <= RECENT_LOGIN_THRESHOLD
      }).length

      setRecentLogins(recentLoginCount)

      // Check each alert condition
      for (const alert of alerts) {
        if (!alert.enabled) continue

        const matchingMembers = members.filter(member => {
          if (!member.OnlineSince || !member.OnlineStatus) return false
          const loginTime = new Date(member.OnlineSince)
          return now.getTime() - loginTime.getTime() <= RECENT_LOGIN_THRESHOLD
        })

        if (matchingMembers.length >= alert.threshold) {
          reachedThreshold = true
          triggeredAlert = alert
          break
        }
      }

      return { reachedThreshold, alert: triggeredAlert }
    },
    [alerts],
  )

  // Reset alert triggers and counter after time period
  const resetAlerts = useCallback(() => {
    alertTriggersRef.current = 0
    setRecentLogins(0)
    setTimeRemaining(0)
    resetTimeoutRef.current = null
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  // Monitor guild data changes for alerts
  useEffect(() => {
    const onlineMembers = guildData.filter(member => member.OnlineStatus)
    if (onlineMembers.length > 0) {
      const result = checkAndTriggerAlerts(onlineMembers)

      const now = Date.now()
      // Check if we should reset alert triggers
      if (now - lastAlertTimeRef.current >= ALERT_RESET_INTERVAL) {
        alertTriggersRef.current = 0
      }

      if (result.reachedThreshold && result.alert) {
        // Only play sound if we haven't exceeded max triggers
        if (alertTriggersRef.current < MAX_ALERT_TRIGGERS) {
          playSound(result.alert.sound)
          alertTriggersRef.current++
          lastAlertTimeRef.current = now

          // Set timeout to reset alerts if not already set
          if (!resetTimeoutRef.current) {
            resetTimeoutRef.current = setTimeout(resetAlerts, RECENT_LOGIN_THRESHOLD)
            
            // Start countdown timer
            setTimeRemaining(Math.floor(RECENT_LOGIN_THRESHOLD / 1000))
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
            }
            countdownIntervalRef.current = setInterval(() => {
              setTimeRemaining(prev => {
                if (prev <= 1) {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current)
                    countdownIntervalRef.current = null
                  }
                  return 0
                }
                return prev - 1
              })
            }, 1000)
          }
        }
      }
    }
  }, [guildData, checkAndTriggerAlerts, playSound, resetAlerts])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

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
          <HStack spacing={1}>
            <Badge 
              colorScheme={recentLogins > 0 ? 'red' : 'gray'} 
              variant="solid" 
              borderRadius="md"
            >
              {recentLogins} personagens detectados
            </Badge>
            {timeRemaining > 0 && (
              <Badge 
                colorScheme="yellow" 
                variant="solid" 
                borderRadius="md"
                fontSize="xs"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Text>Resetando em</Text>
                <Text fontWeight="bold">{timeRemaining}s</Text>
              </Badge>
            )}
          </HStack>
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
