import { useEffect, useState, useCallback, useRef, useMemo } from 'react'

import { HStack, Badge, Box, useDisclosure, Text, Tooltip } from '@chakra-ui/react'
import { Bell } from 'lucide-react'

import type { GuildMemberResponse } from '@/core/types/guild-member.response'
import { Countdown } from '@/modules/monitoring/components/alert-settings/countdown'
import { DetectedCharactersTooltip } from '@/modules/monitoring/components/alert-settings/detected-characters-tooltip'

import { AlertSettingsPanel } from './alert-settings-panel'
import { soundOptions } from '../../constants/sounds'
import { useGuildContext } from '../../contexts/guild-context'
import { useAlertSound } from '../../hooks/useAlertSound'
import { useAlertSettingsStore } from '../../stores/alert-system/alert-settings-store'
import type { AlertCondition } from '../../types/alert'

// Constants
const MAX_ALERT_TRIGGERS = 3 // Maximum number of times to trigger alert in a minute
const ALERT_RESET_INTERVAL = 60 * 1000 // 1 minute in milliseconds

const AlertSettings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure() // Panel disclosure
  const { isOpen: isTooltipOpen, onOpen: onTooltipOpen, onClose: onTooltipClose } = useDisclosure() // Tooltip disclosure
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlertSettingsStore()
  const { debouncedPlaySound: playSound } = useAlertSound()
  const { guildData, lastDetectionTime } = useGuildContext()

  // Get excluded vocations from store
  const { excludedVocations } = useAlertSettingsStore()

  // Track previous detected characters for new character alert
  const prevDetectedRef = useRef<Set<string>>(new Set())

  // Calculate detected characters based on alert timeRange
  const detectedCharacters = useMemo(() => {
    const now = new Date()
    // Use the first enabled alert's timeRange
    const activeAlert = alerts.find(a => a.enabled)
    if (!activeAlert) return 0

    const timeRangeMs = activeAlert.timeRange * 60 * 1000
    const filteredMembers = guildData.filter(member => {
      if (!member.OnlineSince || !member.OnlineStatus) return false
      if (excludedVocations.includes(member.Vocation)) return false
      const loginTime = new Date(member.OnlineSince)
      return now.getTime() - loginTime.getTime() <= timeRangeMs
    })

    // Check for new characters above threshold
    const currentDetected = new Set(filteredMembers.map(m => m.Name))
    const prevCount = prevDetectedRef.current.size
    if (prevCount >= activeAlert.threshold) {
      const newCharacters = filteredMembers.filter(m => !prevDetectedRef.current.has(m.Name))
      if (newCharacters.length > 0) {
        playSound(activeAlert.sound)
      }
    }
    prevDetectedRef.current = currentDetected

    return filteredMembers.length
  }, [guildData, alerts, excludedVocations, playSound])
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [alertDismissed, setAlertDismissed] = useState<boolean>(false)
  const [currentAlert, setCurrentAlert] = useState<AlertCondition | null>(null)
  const alertStartTimeRef = useRef<number | null>(null)

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

      // Check each alert condition
      for (const alert of alerts) {
        if (!alert.enabled) continue

        // Count characters that logged in within the alert's time range
        const timeRangeMs = alert.timeRange * 60 * 1000 // Convert minutes to milliseconds
        const matchingMembers = members.filter(member => {
          if (!member.OnlineSince || !member.OnlineStatus) return false
          const loginTime = new Date(member.OnlineSince)
          return now.getTime() - loginTime.getTime() <= timeRangeMs
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
    setTimeRemaining(0)
    setAlertDismissed(false)
    setCurrentAlert(null)
    alertStartTimeRef.current = null
    resetTimeoutRef.current = null
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  const dismissCurrentAlert = useCallback(() => {
    setAlertDismissed(true)
    alertTriggersRef.current = MAX_ALERT_TRIGGERS // Prevent further sounds
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
            alertStartTimeRef.current = Date.now()
            const timeRangeMs = result.alert.timeRange * 60 * 1000 // Convert minutes to milliseconds
            resetTimeoutRef.current = setTimeout(resetAlerts, timeRangeMs)

            // Set current alert
            setCurrentAlert(result.alert)

            // Start countdown timer based on alert's timeRange
            const timeRangeSeconds = result.alert.timeRange * 60 // Convert minutes to seconds
            setTimeRemaining(timeRangeSeconds)
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
            }
            countdownIntervalRef.current = setInterval(() => {
              if (alertStartTimeRef.current) {
                const elapsed = Math.floor((Date.now() - alertStartTimeRef.current) / 1000)
                const remaining = Math.max(timeRangeSeconds - elapsed, 0)
                setTimeRemaining(remaining)

                if (remaining === 0) {
                  resetAlerts()
                }
              }
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
          <Tooltip
            label={`Última atividade: ${lastDetectionTime ? new Date(lastDetectionTime).toLocaleTimeString() : 'Nenhuma'}`}
          >
            <Bell size={18} color="blue.400" />
          </Tooltip>
          <Badge colorScheme="red" variant="solid" borderRadius="md">
            {alerts.filter(a => a.enabled).length} ALERTA DE ATAQUE
          </Badge>
          <HStack spacing={1}>
            <Box position="relative" onMouseEnter={onTooltipOpen} onMouseLeave={onTooltipClose}>
              <Box
                position="fixed"
                visibility={isTooltipOpen ? 'visible' : 'hidden'}
                opacity={isTooltipOpen ? 1 : 0}
                transform={`translateY(${isTooltipOpen ? '0' : '-10px'})`}
                transition="all 0.2s"
                zIndex={1000}
                ref={node => {
                  if (node && isTooltipOpen) {
                    // Wait for next frame to ensure tooltip is rendered
                    requestAnimationFrame(() => {
                      const trigger = node.previousElementSibling
                      if (trigger) {
                        const rect = trigger.getBoundingClientRect()
                        const viewportWidth = window.innerWidth
                        const viewportHeight = window.innerHeight
                        const nodeRect = node.getBoundingClientRect()
                        const tooltipHeight = nodeRect.height || 350 // Increased fallback height
                        const tooltipWidth = nodeRect.width || 350 // Increased fallback width
                        
                        // Calculate available space
                        const spaceBelow = viewportHeight - rect.bottom
                        const spaceAbove = rect.top
                        const spaceRight = viewportWidth - rect.left
                        
                        // Default position (below)
                        let top = rect.bottom + 10
                        let left = rect.left

                        // Adjust vertical position
                        if (spaceBelow < tooltipHeight + 20) {
                          if (spaceAbove > tooltipHeight + 20) {
                            // Position above if there's space
                            top = rect.top - tooltipHeight - 10
                          } else {
                            // Center vertically if neither top nor bottom has enough space
                            top = Math.max(10, (viewportHeight - tooltipHeight) / 2)
                          }
                        }

                        // Adjust horizontal position
                        if (viewportWidth <= 480) {
                          // Center on mobile
                          left = (viewportWidth - tooltipWidth) / 2
                        } else if (spaceRight < tooltipWidth + 20) {
                          // Align to right edge with padding
                          left = viewportWidth - tooltipWidth - 10
                        }

                        // Ensure minimum spacing from edges
                        left = Math.max(10, Math.min(left, viewportWidth - tooltipWidth - 10))
                        top = Math.max(10, Math.min(top, viewportHeight - tooltipHeight - 10))

                        // Apply position
                        node.style.setProperty('top', `${top}px`)
                        node.style.setProperty('left', `${left}px`)
                      }
                    })
                  }
                }}
              >
                <DetectedCharactersTooltip
                  characters={guildData
                    .filter(member => {
                      if (!member.OnlineSince || !member.OnlineStatus) return false
                      if (excludedVocations.includes(member.Vocation)) return false
                      const now = new Date()
                      const loginTime = new Date(member.OnlineSince)
                      const activeAlert = alerts.find(a => a.enabled)
                      if (!activeAlert) return false
                      return (
                        now.getTime() - loginTime.getTime() <= activeAlert.timeRange * 60 * 1000
                      )
                    })
                    .sort(
                      (a, b) =>
                        new Date(b.OnlineSince!).getTime() - new Date(a.OnlineSince!).getTime(),
                    )}
                  alerts={alerts}
                />
              </Box>
              <Badge
                colorScheme={detectedCharacters > 0 ? 'red' : 'gray'}
                variant="solid"
                borderRadius="md"
                cursor="pointer"
              >
                {detectedCharacters} personagens detectados
              </Badge>
            </Box>
            {timeRemaining > 0 && alertStartTimeRef.current && currentAlert && (
              <HStack spacing={1}>
                <Badge
                  colorScheme="yellow"
                  variant="solid"
                  borderRadius="md"
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Text>Próximo reset em</Text>
                  <Text fontWeight="bold">
                    <Countdown
                      targetTime={
                        new Date(alertStartTimeRef.current + currentAlert.timeRange * 60 * 1000)
                      }
                      onComplete={resetAlerts}
                    />
                  </Text>
                </Badge>
                {
                  <Badge
                    colorScheme="red"
                    variant={alertDismissed ? 'solid' : 'outline'}
                    borderRadius="md"
                    fontSize="xs"
                    cursor="pointer"
                    onClick={e => {
                      e.stopPropagation()
                      if (alertDismissed) {
                        setAlertDismissed(false)
                      } else {
                        dismissCurrentAlert()
                      }
                    }}
                  >
                    {alertDismissed ? 'Ativar Som' : 'Silenciar'}
                  </Badge>
                }
              </HStack>
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
