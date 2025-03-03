import type { ReactNode } from 'react'
import { createContext, useContext, useCallback, useState, useEffect, useMemo, useRef } from 'react'

import { useToast } from '@chakra-ui/react'

import { BACKEND_URL, FIREBOT_SSE_URL } from '@/core/constants/env'
import { upsertPlayer } from '@/modules/statistics/services'
import { useStorage } from '@/core/store/storage-store'
import type { GuildMemberResponse } from '@/core/types/guild-member.response'
import { formatTimeOnline } from '@/core/utils/format-time-online'

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
  selectedMode: 'ally' | 'enemy'
  setSelectedMode: (mode: 'ally' | 'enemy') => void
  selectedWorld: string
  setSelectedWorld: (world: string) => void
}

const GuildContext = createContext<GuildContextData | undefined>(undefined)

// Create a member map for O(1) lookups
type MemberMap = Map<string, GuildMemberResponse>

export function GuildProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [value] = useStorage('monitorMode', 'enemy')
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [characterChanges, setCharacterChanges] = useState<GuildMemberResponse[]>([])
  const [selectedMode, setSelectedMode] = useState<'ally' | 'enemy'>('ally')
  const [selectedWorld, setSelectedWorld] = useState<string>('')
  const { types, addType } = useCharacterTypes()

  const memberMapRef = useRef<MemberMap>(new Map())
  const frameIdRef = useRef<number>()
  const lastUpdateRef = useRef(0)

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentDeaths', JSON.stringify(recentDeaths))
    }
  }, [recentDeaths])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentLevels', JSON.stringify(recentLevels))
    }
  }, [recentLevels])

  const handleMessage = useCallback(
    (data: any) => {
      if (data?.death) {
        const deathEvent = {
          death: {
            ...data.death,
            world: selectedWorld,
            isAlly: selectedMode === 'ally',
            date: new Date().toISOString(), // Ensure we have the current timestamp
          },
        } as DeathEvent
        setRecentDeaths(prev => [deathEvent, ...prev].slice(0, 10))
      }
      if (data?.level) {
        const levelEvent = {
          level: {
            ...data.level,
            world: selectedWorld,
            isAlly: selectedMode === 'ally',
            timestamp: new Date().toISOString(), // Add timestamp to level events
          },
        } as LevelEvent
        setRecentLevels(prev => [levelEvent, ...prev].slice(0, 10))
      }

      if (data?.[value]) {
        const now = new Date()
        // Use a single transform on the incoming data
        const processedData = data[value].map((member: GuildMemberResponse) => {
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

      if (data?.[`${value}-changes`]) {
        // Use batch updates for changes
        setGuildData(prevData => {
          const newChanges: GuildMemberResponse[] = []
          const updatedData = prevData.map(member => {
            const change = data[`${value}-changes`][member.Name]
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
    [value, selectedWorld, selectedMode],
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
    endpoint: `${FIREBOT_SSE_URL}${value}/`,
    onMessage: handleMessage,
    bufferSize: 0, // Disable buffering for real-time updates
    throttle: 50, // Fast updates (milliseconds)
    reconnectInterval: 5, // Faster reconnection
  })

  // Force refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(
      () => {
        // Refreshing guild data
        reconnect() // This will close and reopen the SSE connection
      },
      5 * 60 * 500,
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
  const handleLocalChange = useCallback(async (member: GuildMemberResponse, newLocal: string) => {
    setGuildData(prevData => {
      // Use map for O(1) lookups instead of findIndex (O(n))
      const targetMember = memberMapRef.current.get(member.Name)
      if (!targetMember) return prevData

      // Update the map
      memberMapRef.current.set(member.Name, { ...targetMember, Local: newLocal })

      // Return new array with updated member
      return prevData.map(m => (m.Name === member.Name ? { ...m, Local: newLocal } : m))
    })
  }, [])

  const handleClassificationChange = useCallback(
    async (member: GuildMemberResponse, newClassification: string) => {
      try {
        await upsertPlayer(
          {
            name: member.Name,
            vocation: member.Vocation,
            level: member.Level,
            kind: newClassification,
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

        toast({
          title: 'Tipo atualizado',
          description: `O tipo de ${member.Name} foi atualizado para ${newClassification}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Error updating player classification:', error)
        toast({
          title: 'Erro ao atualizar tipo do personagem',
          description: 'Não foi possível atualizar o tipo do personagem. Tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    },
    [selectedWorld],
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
        setSelectedWorld,
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
