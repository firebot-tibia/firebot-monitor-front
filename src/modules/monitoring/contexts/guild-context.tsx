import type { ReactNode } from 'react'
import { createContext, useContext, useCallback, useState, useEffect, useMemo, useRef } from 'react'

import { useToast } from '@chakra-ui/react'

import { FIREBOT_SSE_URL } from '@/core/constants/env'
import { useStorageStore } from '@/core/store/storage-store'
import type { GuildMemberResponse } from '@/core/types/guild-member.response'
import { formatTimeOnline } from '@/core/utils/format-time-online'
import { useTokenStore } from '@/modules/auth/store/token-decoded-store'
import { upsertPlayer } from '@/modules/statistics/services'

type Mode = 'ally' | 'enemy'

import { useCharacterTypes } from '../hooks/useCharacterTypes'
import { useSSE } from '../hooks/useSSE'
import type { DeathEvent } from '../types/death'
import type { LevelEvent } from '../types/level'

interface GuildContextData {
  isLoading: boolean
  status: string
  types: string[]
  addType: (type: string) => void
  handleLocalChange: (member: GuildMemberResponse, newLocal: string) => Promise<void>
  handleClassificationChange: (
    member: GuildMemberResponse,
    newClassification: string,
  ) => Promise<void>
  groupedData: Array<{ type: string; data: GuildMemberResponse[]; onlineCount: number }>
  guildData: GuildMemberResponse[]
  recentDeaths: DeathEvent[]
  recentLevels: LevelEvent[]
  selectedMode: Mode
  setSelectedMode: (mode: Mode) => void
  selectedWorld: string
}

const GuildContext = createContext<GuildContextData | undefined>(undefined)

// Create a member map for O(1) lookups
type MemberMap = Map<string, GuildMemberResponse>

export function GuildProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const { selectedWorld } = useTokenStore()
  const storedMode = useStorageStore.getState().getItem('monitorMode', 'enemy') as Mode
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [characterChanges, setCharacterChanges] = useState<GuildMemberResponse[]>([])
  const [selectedMode, setSelectedMode] = useState<Mode>(storedMode)

  const [recentDeaths, setRecentDeaths] = useState<DeathEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentDeaths')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [recentLevels, setRecentLevels] = useState<LevelEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentLevels')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const { types, addType } = useCharacterTypes(guildData)

  // Use a ref for memberMap to avoid recreating it on every render
  const memberMapRef = useRef<MemberMap>(new Map())

  // Timestamping-related refs to avoid unnecessary renders
  const lastUpdateRef = useRef(Date.now())
  const frameIdRef = useRef<number | null>(null)

  // Handle SSE messages efficiently
  const handleMessage = useCallback(
    (data: any) => {
      // Handle death events
      if (data?.death && typeof data.death === 'object' && data.death.name && data.death.text) {
        const deathEvent = {
          death: {
            ...data.death,
            world: selectedWorld,
            isAlly: selectedMode === 'ally',
            date: new Date().toISOString(), // Ensure we have the current timestamp
          },
        } as DeathEvent
        setRecentDeaths(prev => {
          const updated = [deathEvent, ...prev].slice(0, 10) // Keep last 10 deaths
          localStorage.setItem('recentDeaths', JSON.stringify(updated))
          return updated
        })
      }

      // Handle level events
      if (data?.level && typeof data.level === 'object' && data.level.player && data.level.new_level) {
        const levelEvent = {
          level: {
            ...data.level,
            world: selectedWorld,
            isAlly: selectedMode === 'ally',
            timestamp: new Date().toISOString(), // Add timestamp to level events
          },
        } as LevelEvent
        setRecentLevels(prev => {
          // Remove any existing events for the same player within 5 seconds
          const now = new Date()
          const filtered = prev.filter(event => {
            const eventTime = new Date(event.level.timestamp || '')
            const timeDiff = now.getTime() - eventTime.getTime()
            return timeDiff > 5000 || event.level.player !== data.level.player
          })
          const updated = [levelEvent, ...filtered].slice(0, 10) // Keep last 10 level changes
          localStorage.setItem('recentLevels', JSON.stringify(updated))
          return updated
        })
      }

      if (data?.[storedMode]) {
        const now = new Date()
        // Use a single transform on the incoming data
        const processedData = data[storedMode].map((member: GuildMemberResponse) => {
          if (!member.OnlineStatus) {
            return { ...member, OnlineSince: null, TimeOnline: null }
          }

          const onlineSince = member.OnlineSince || now.toISOString()
          return {
            ...member,
            OnlineSince: onlineSince,
            TimeOnline: formatTimeOnline(new Date(onlineSince), now),
          }
        })

        // Update the data and rebuild the member map
        setGuildData(processedData)

        // Update our reference map for O(1) lookups
        const newMemberMap = new Map()
        processedData.forEach((member: { Name: any }) => {
          newMemberMap.set(member.Name, member)
        })
        memberMapRef.current = newMemberMap
      }

      if (data?.[`${storedMode}-changes`]) {
        // Use batch updates for changes
        setGuildData(prevData => {
          const newChanges: GuildMemberResponse[] = []
          const updatedData = prevData.map(member => {
            const change = data[`${storedMode}-changes`][member.Name]
            if (!change) return member

            const now = new Date()
            let updatedMember = { ...member }

            if (change.ChangeType === 'logged-in') {
              updatedMember = {
                ...updatedMember,
                ...change.Member,
                OnlineStatus: true,
                OnlineSince: now.toISOString(),
                TimeOnline: '00:00:00',
              }
              newChanges.push(updatedMember)
            } else if (change.ChangeType === 'logged-out') {
              updatedMember = {
                ...updatedMember,
                ...change.Member,
                OnlineStatus: false,
                OnlineSince: null,
                TimeOnline: null,
              }
            } else {
              updatedMember = { ...updatedMember, ...change.Member }
            }

            // Update our reference map
            memberMapRef.current.set(updatedMember.Name, updatedMember)
            return updatedMember
          })

          if (newChanges.length > 0) {
            setCharacterChanges(prev => [...prev, ...newChanges])
          }

          return updatedData
        })
      }

      setIsLoading(false)
    },
    [storedMode, selectedWorld, selectedMode],
  )

  // Single efficient time update mechanism using requestAnimationFrame
  useEffect(() => {
    const updateTimes = () => {
      const now = Date.now()
      // Only update if sufficient time has passed (throttle updates)
      if (now - lastUpdateRef.current >= 1000) {
        lastUpdateRef.current = now
        const nowDate = new Date(now)

        // Using a functional update to ensure we have the latest state
        setGuildData(prevData => {
          // Only update if we have online members
          const hasOnlineMembers = prevData.some(m => m.OnlineStatus)
          if (!hasOnlineMembers) return prevData

          return prevData.map(member => {
            if (!member.OnlineStatus || !member.OnlineSince) return member

            return {
              ...member,
              TimeOnline: formatTimeOnline(new Date(member.OnlineSince), nowDate),
            }
          })
        })
      }

      frameIdRef.current = requestAnimationFrame(updateTimes)
    }

    frameIdRef.current = requestAnimationFrame(updateTimes)

    // Cleanup on unmount
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [])

  // Reconnect SSE every 5 minutes to refresh data
  const { status, reconnect } = useSSE({
    endpoint: `${FIREBOT_SSE_URL}${storedMode}/`,
    onMessage: handleMessage,
    reconnectInterval: 5, // Faster reconnection
  })

  // Force refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(
      () => {
        // Refreshing guild data
        reconnect() // This will close and reopen the SSE connection
      },
      5 * 60 * 1000,
    ) // 5 minutes in milliseconds

    return () => clearInterval(refreshInterval)
  }, [reconnect])

  // Memoize expensive operations
  const groupedData = useMemo(() => {
    return guildData.reduce<
      Array<{
        type: string
        data: GuildMemberResponse[]
        onlineCount: number
      }>
    >((acc, member) => {
      const type = member.Kind || 'sem classificação'
      const existingGroup = acc.find(group => group.type === type)

      if (existingGroup) {
        existingGroup.data.push(member)
        if (member.OnlineStatus) {
          existingGroup.onlineCount++
        }
      } else {
        acc.push({
          type,
          data: [member],
          onlineCount: member.OnlineStatus ? 1 : 0,
        })
      }

      return acc
    }, [])
  }, [guildData])

  // Optimize member updates with O(1) lookups
  const handleLocalChange = useCallback(
    async (member: GuildMemberResponse, newLocal: string) => {
      try {
        if (!selectedWorld) {
          toast({
            title: 'Erro ao atualizar localização',
            description:
              'Por favor, selecione um mundo antes de atualizar a localização do personagem.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          return
        }

        await upsertPlayer(
          {
            name: member.Name,
            kind: member.Kind || 'sem classificação',
            local: newLocal,
          },
          selectedWorld,
        )

        // Update local state only after successful API call
        setGuildData(prevData => {
          // Use map for O(1) lookups instead of findIndex (O(n))
          const targetMember = memberMapRef.current.get(member.Name)
          if (!targetMember) return prevData

          // Update the map
          memberMapRef.current.set(member.Name, { ...targetMember, Local: newLocal })

          // Return new array with updated member
          return prevData.map(m => (m.Name === member.Name ? { ...m, Local: newLocal } : m))
        })

        toast({
          title: 'Localização atualizada',
          description: `A localização de ${member.Name} foi atualizada para ${newLocal}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Error updating player location:', error)
        toast({
          title: 'Erro ao atualizar localização',
          description: 'Não foi possível atualizar a localização do personagem. Tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    },
    [selectedWorld, toast],
  )

  const handleClassificationChange = useCallback(
    async (member: GuildMemberResponse, newClassification: string) => {
      try {
        if (!selectedWorld) {
          toast({
            title: 'Erro ao atualizar tipo',
            description: 'Por favor, selecione um mundo antes de atualizar o tipo do personagem.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          return
        }

        await upsertPlayer(
          {
            name: member.Name,
            kind: newClassification,
            local: member.Local || '',
          },
          selectedWorld,
        )

        // Update local state only after successful API call
        setGuildData(prevData => {
          // Use map for O(1) lookups
          const targetMember = memberMapRef.current.get(member.Name)
          if (!targetMember) return prevData

          // Update the map
          memberMapRef.current.set(member.Name, { ...targetMember, Kind: newClassification })

          // Return new array with updated member
          return prevData.map(m => (m.Name === member.Name ? { ...m, Kind: newClassification } : m))
        })
      } catch (error) {
        toast({
          title: 'Erro ao atualizar tipo',
          description: 'Não foi possível atualizar o tipo do personagem. Tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    },
    [selectedWorld, toast],
  )

  return (
    <GuildContext.Provider
      value={{
        isLoading,
        status,
        types,
        addType,
        handleLocalChange,
        handleClassificationChange,
        groupedData,
        guildData,
        recentDeaths,
        recentLevels,
        selectedMode,
        setSelectedMode,
        selectedWorld,
      }}
    >
      {children}
    </GuildContext.Provider>
  )
}

export function useGuildContext() {
  const context = useContext(GuildContext)
  if (!context) {
    throw new Error('useGuildContext must be used within a GuildProvider')
  }
  return context
}
