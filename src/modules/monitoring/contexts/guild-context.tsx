import type { ReactNode } from 'react'
import { createContext, useContext, useCallback, useState, useEffect } from 'react'

import { FIREBOT_SSE_URL } from '@/core/constants/env'
import { useStorage } from '@/core/store/storage-store'
import type { GuildMemberResponse } from '@/core/types/guild-member.response'
import { formatTimeOnline } from '@/core/utils/format-time-online'

import { useCharacterTypes } from '../hooks/useCharacterTypes'
import { useSSE } from '../hooks/useSSE'

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
}

const GuildContext = createContext<GuildContextData | undefined>(undefined)

export function GuildProvider({ children }: { children: ReactNode }) {
  const [value] = useStorage('monitorMode', 'enemy')
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [characterChanges, setCharacterChanges] = useState<GuildMemberResponse[]>([])
  const { types, addType } = useCharacterTypes(guildData)

  // Function to update time online for all characters
  const updateTimeOnline = useCallback(() => {
    setGuildData(prevData => {
      const now = new Date()
      return prevData.map(member => {
        if (member.OnlineStatus && member.OnlineSince) {
          const onlineSince = new Date(member.OnlineSince)
          const timeOnline = formatTimeOnline(onlineSince, now)
          return { ...member, TimeOnline: timeOnline }
        }
        return member
      })
    })
  }, [])

  // Update time online every second
  useEffect(() => {
    // Initial update
    updateTimeOnline()

    // Update every second
    const interval = setInterval(updateTimeOnline, 1000)
    return () => clearInterval(interval)
  }, [updateTimeOnline])

  const handleMessage = useCallback(
    (data: any) => {
      if (data?.[value]) {
        const now = new Date()
        const newGuildData = data[value].map((member: GuildMemberResponse) => {
          const onlineSince = member.OnlineStatus
            ? member.OnlineSince || now.toISOString()
            : '00:00:00'
          const timeOnline =
            member.OnlineStatus && onlineSince
              ? formatTimeOnline(new Date(onlineSince), now)
              : '00:00:00'
          return {
            ...member,
            OnlineSince: onlineSince,
            TimeOnline: timeOnline,
          }
        })
        setGuildData(newGuildData)
      }

      if (data?.[`${value}-changes`]) {
        setGuildData(prevData => {
          const updatedData = [...prevData]
          const newChanges: GuildMemberResponse[] = []
          Object.entries(data[`${value}-changes`]).forEach(([name, change]: [string, any]) => {
            const index = updatedData.findIndex(member => member.Name === name)
            if (index !== -1) {
              if (change.ChangeType === 'logged-in') {
                updatedData[index] = {
                  ...updatedData[index],
                  ...change.Member,
                  OnlineStatus: true,
                  OnlineSince: new Date().toISOString(),
                  TimeOnline: '00:00:00',
                }
                newChanges.push(updatedData[index])
              } else if (change.ChangeType === 'logged-out') {
                updatedData[index] = {
                  ...updatedData[index],
                  ...change.Member,
                  OnlineStatus: false,
                  OnlineSince: null,
                  TimeOnline: null,
                }
              } else {
                updatedData[index] = { ...updatedData[index], ...change.Member }
              }
            }
          })
          setCharacterChanges(prev => [...prev, ...newChanges])
          return updatedData
        })
      }
      setIsLoading(false)
    },
    [value],
  )

  const { status } = useSSE({
    endpoint: `${FIREBOT_SSE_URL}${value}/`,
    onMessage: handleMessage,
  })

  const handleLocalChange = useCallback(async (member: GuildMemberResponse, newLocal: string) => {
    setGuildData(prevData => {
      const newData = [...prevData]
      const index = newData.findIndex(m => m.Name === member.Name)
      if (index !== -1) {
        newData[index] = { ...newData[index], Local: newLocal }
      }
      return newData
    })
  }, [])

  const handleClassificationChange = useCallback(
    async (member: GuildMemberResponse, newClassification: string) => {
      setGuildData(prevData => {
        const newData = [...prevData]
        const index = newData.findIndex(m => m.Name === member.Name)
        if (index !== -1) {
          newData[index] = { ...newData[index], Kind: newClassification }
        }
        return newData
      })
    },
    [],
  )

  const groupedData = guildData.reduce<
    Array<{ type: string; data: GuildMemberResponse[]; onlineCount: number }>
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
