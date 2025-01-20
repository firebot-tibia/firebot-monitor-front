import { useMemo, useCallback } from 'react'

import { useColorModeValue } from '@chakra-ui/react'

import type { UseCharacterRowProps } from './types'

export const useCharacterRow = ({
  member,
  onLocalChange,
  onClassificationChange,
}: UseCharacterRowProps) => {
  // Color hooks
  const defaultColor = useColorModeValue('gray.600', 'gray.300')
  const vocationColor = useColorModeValue('gray.500', 'gray.400')

  // Level color based on thresholds
  const levelColor = useMemo(() => {
    if (member.Level >= 1000) return 'purple.400'
    if (member.Level >= 500) return 'blue.400'
    return defaultColor
  }, [member.Level, defaultColor])

  // Online status color and content
  const statusColor = useMemo(() => {
    return member.OnlineStatus ? 'green.400' : 'red.400'
  }, [member.OnlineStatus])

  // Time online formatting
  const formattedTimeOnline = useMemo(() => {
    if (!member.TimeOnline) return ''
    return member.TimeOnline
  }, [member.TimeOnline])

  // Tooltip content with time information
  const tooltipContent = useMemo(() => {
    if (!member.OnlineStatus) return 'Offline'
    if (member.TimeOnline) return `Online: ${member.TimeOnline}`
    if (member.OnlineSince) {
      const onlineTime = new Date(member.OnlineSince)
      const timeString = onlineTime.toLocaleTimeString()
      return `Online since ${timeString}`
    }
    return 'Online'
  }, [member.OnlineStatus, member.TimeOnline, member.OnlineSince])

  // Change handlers with debounce
  const handleLocalChange = useCallback(
    (newLocal: string) => {
      onLocalChange(member, newLocal)
    },
    [member, onLocalChange],
  )

  const handleClassificationChange = useCallback(
    (newClassification: string) => {
      onClassificationChange(member, newClassification)
    },
    [member, onClassificationChange],
  )

  // Last login formatting
  const formattedLastLogin = useMemo(() => {
    if (!member.LastLogin) return ''
    const lastLogin = new Date(member.LastLogin)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - lastLogin.getTime()) / 36e5

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    }
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }, [member.LastLogin])

  // Status indicators
  const statusIndicators = useMemo(() => {
    return {
      isOnline: member.OnlineStatus,
      hasLocation: Boolean(member.Local),
      hasType: Boolean(member.Kind),
      timeOnline: formattedTimeOnline,
      lastSeen: formattedLastLogin,
    }
  }, [member.OnlineStatus, member.Local, member.Kind, formattedTimeOnline, formattedLastLogin])

  return {
    // Colors
    vocationColor,
    levelColor,
    statusColor,
    defaultColor,

    // Formatted values
    formattedTimeOnline,
    formattedLastLogin,

    // Status and content
    tooltipContent,
    statusIndicators,

    // Event handlers
    handleLocalChange,
    handleClassificationChange,
  }
}
