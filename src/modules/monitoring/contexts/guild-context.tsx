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

  // Function to update time online for all characters with optimizations
  const updateTimeOnline = useCallback(() => {
    setGuildData(prevData => {
      const now = new Date()
      const nowTime = now.getTime()
      
      // Pre-calculate dates for better performance
      const memberDates = new Map<string, Date>()
      prevData.forEach(member => {
        if (member.OnlineStatus && member.OnlineSince) {
          memberDates.set(member.Name, new Date(member.OnlineSince))
        }
      })

      return prevData.map(member => {
        if (member.OnlineStatus && member.OnlineSince) {
          const memberDate = memberDates.get(member.Name)
          if (!memberDate) return member
          
          const timeOnline = formatTimeOnline(memberDate, now)
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

  const processGuildData = useCallback((members: GuildMemberResponse[]) => {
    const now = new Date()
    const nowTime = now.getTime()
    
    // Pre-calculate dates to avoid repeated creation
    const memberDates = new Map<string, Date>()
    members.forEach(member => {
      if (member.OnlineSince) {
        memberDates.set(member.Name, new Date(member.OnlineSince))
      }
    })

    return members.map((member: GuildMemberResponse) => {
      if (!member.OnlineStatus) {
        return {
          ...member,
          OnlineSince: null,
          TimeOnline: null,
        }
      }

      const onlineSince = member.OnlineSince || now.toISOString()
      const memberDate = memberDates.get(member.Name) || new Date(onlineSince)
      const timeOnline = formatTimeOnline(memberDate, now)

      return {
        ...member,
        OnlineSince: onlineSince,
        TimeOnline: timeOnline,
      }
    })
  }, [])

  // Update time display for online characters
  useEffect(() => {
    let frameId: number
    let lastUpdate = Date.now()
    
    const updateTimes = () => {
      const now = Date.now()
      // Only update if more than 500ms has passed
      if (now - lastUpdate >= 500) {
        lastUpdate = now
        const nowDate = new Date(now)
        
        setGuildData(prevData => {
          // Pre-calculate dates
          const memberDates = new Map<string, Date>()
          prevData.forEach(member => {
            if (member.OnlineSince) {
              memberDates.set(member.Name, new Date(member.OnlineSince))
            }
          })
          
          return prevData.map(member => {
            if (!member.OnlineStatus || !member.OnlineSince) return member
            const memberDate = memberDates.get(member.Name)
            if (!memberDate) return member
            
            return {
              ...member,
              TimeOnline: formatTimeOnline(memberDate, nowDate)
            }
          })
        })
      }
      
      frameId = requestAnimationFrame(updateTimes)
    }
    
    frameId = requestAnimationFrame(updateTimes)
    return () => cancelAnimationFrame(frameId)
  }, [])

  const handleMessage = useCallback(
    (data: any) => {
      if (data?.[value]) {
        // Process data immediately without animation frame to reduce delay
        const processedData = data[value].map((member: GuildMemberResponse) => {
          const now = new Date()
          if (!member.OnlineStatus) {
            return { ...member, OnlineSince: null, TimeOnline: null }
          }
          const onlineSince = member.OnlineSince || now.toISOString()
          return {
            ...member,
            OnlineSince: onlineSince,
            TimeOnline: formatTimeOnline(new Date(onlineSince), now)
          }
        })
        setGuildData(processedData)
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
