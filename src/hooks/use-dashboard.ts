'use client'
import { useToast } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { usePermission } from './use-permission'
import { Death } from '../types/interfaces/death.interface'
import { GuildMemberResponse } from '../types/interfaces/guild/guild-member.interface'
import { Level } from '../types/interfaces/level.interface'
import { useGlobalStore } from '../stores/death-level-store'
import { useStorage, useStorageStore } from '../stores/storage-store'
import { useTokenStore } from '../stores/token-decoded-store'
import { useCharacterTypes } from '../stores/use-type-store'
import { upsertPlayer } from '../services/guild-stats.service'
import { formatTimeOnline } from '../utils/format-time-online'

export const useHomeLogic = () => {
  const [value, setValue] = useStorage('monitorMode', 'enemy')
  const toast = useToast()
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const guildId = useStorageStore.getState().getItem('selectedGuildId', '')
  const { decodedToken, selectedWorld, initializeSSE, setSelectedWorld, decodeAndSetToken } =
    useTokenStore()
  const checkPermission = usePermission()

  const [characterChanges, setCharacterChanges] = useState<GuildMemberResponse[]>([])

  const { types, addType } = useCharacterTypes(guildData)
  const sseInitialized = useRef(false)

  const {
    deathList,
    levelUpList,
    levelDownList,
    newDeathCount,
    newLevelUpCount,
    newLevelDownCount,
    addDeath,
    addLevelUp,
    addLevelDown,
    resetNewCounts,
  } = useGlobalStore()

  const handleNewDeath = useCallback(
    (newDeath: Death) => {
      addDeath(newDeath)
    },
    [addDeath],
  )

  const handleNewLevel = useCallback(
    (newLevel: Level) => {
      if (newLevel.new_level > newLevel.old_level) {
        addLevelUp(newLevel)
      } else {
        addLevelDown(newLevel)
      }
    },
    [addLevelUp, addLevelDown],
  )

  const updateMemberData = useCallback(
    (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => {
      setGuildData((prevData) =>
        prevData.map((m) => (m.Name === member.Name ? { ...m, ...changes } : m)),
      )
    },
    [],
  )

  const handleMessage = useCallback(
    (data: any) => {
      if (data?.[value]) {
        const newGuildData = data[value].map((member: GuildMemberResponse) => ({
          ...member,
          OnlineSince: member.OnlineStatus ? member.OnlineSince || new Date().toISOString() : null,
          TimeOnline: member.OnlineStatus ? '00:00:00' : null,
        }))
        setGuildData(newGuildData)
      }
      if (data?.[`${value}-changes`]) {
        setGuildData((prevData) => {
          const updatedData = [...prevData]
          const newChanges: GuildMemberResponse[] = []
          Object.entries(data[`${value}-changes`]).forEach(([name, change]: [string, any]) => {
            const index = updatedData.findIndex((member) => member.Name === name)
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
          setCharacterChanges((prev) => [...prev, ...newChanges])
          return updatedData
        })
      }
      if (data?.death) {
        handleNewDeath(data.death)
      }
      if (data?.level) {
        handleNewLevel(data.level)
      }
      setIsLoading(false)
    },
    [value, handleNewDeath, handleNewLevel],
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setGuildData((prevData) =>
        prevData.map((member) => {
          if (member.OnlineStatus && member.OnlineSince) {
            const onlineSince = new Date(member.OnlineSince)
            const now = new Date()
            const diffInMinutes = (now.getTime() - onlineSince.getTime()) / 60000
            return { ...member, TimeOnline: formatTimeOnline(diffInMinutes) }
          }
          return member
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      decodeAndSetToken(session.access_token)
    }
  }, [status, session, decodeAndSetToken])

  useEffect(() => {
    if (session && decodedToken && selectedWorld && !sseInitialized.current) {
      initializeSSE(handleMessage)
      sseInitialized.current = true
    }
  }, [decodedToken, selectedWorld, value, initializeSSE, handleMessage, session])

  useEffect(() => {
    resetNewCounts()
  }, [value, resetNewCounts])

  const handleLocalChange = useCallback(
    async (member: GuildMemberResponse, newLocal: string) => {
      if (!checkPermission()) return
      if (!guildId) return

      try {
        const playerData = {
          guild_id: guildId,
          kind: member.Kind,
          name: member.Name,
          status: member.Status,
          local: newLocal,
        }

        await upsertPlayer(playerData, selectedWorld)
        updateMemberData(member, { Local: newLocal })
      } catch (error) {
        console.error('Failed to update player:', error)
      }
    },
    [guildId, checkPermission, selectedWorld, updateMemberData],
  )

  const handleClassificationChange = useCallback(
    async (member: GuildMemberResponse, newClassification: string) => {
      if (!checkPermission()) return
      if (!guildId) return

      try {
        const playerData = {
          guild_id: guildId,
          kind: newClassification,
          name: member.Name,
          status: member.Status,
          local: member.Local || '',
        }

        await upsertPlayer(playerData, selectedWorld)
        updateMemberData(member, { Kind: newClassification })
        toast({
          title: 'Sucesso',
          description: `${member.Name} classificado como ${newClassification}.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Failed to classify player:', error)
      }
    },
    [guildId, checkPermission, selectedWorld, updateMemberData, toast],
  )

  const groupedData = useMemo(() => {
    const onlineMembers = guildData.filter((member) => member.OnlineStatus && member.TimeOnline)

    const sortedGuildData = onlineMembers.sort((a, b) => {
      const timeA = a.TimeOnline || '00:00:00'
      const timeB = b.TimeOnline || '00:00:00'

      if (timeA === '00:00:00' && timeB !== '00:00:00') return -1
      if (timeA !== '00:00:00' && timeB === '00:00:00') return 1

      return timeA.localeCompare(timeB)
    })

    return types
      .map((type) => ({
        type,
        data: sortedGuildData.filter((member) => member.Kind === type),
        onlineCount: sortedGuildData.filter((member) => member.Kind === type).length,
      }))
      .concat({
        type: 'unclassified',
        data: sortedGuildData.filter((member) => !member.Kind || !types.includes(member.Kind)),
        onlineCount: sortedGuildData.filter(
          (member) => !member.Kind || !types.includes(member.Kind),
        ).length,
      })
      .filter((group) => group.data.length > 0)
  }, [guildData, types])

  return {
    value,
    setValue,
    setSelectedWorld,
    newDeathCount,
    newLevelUpCount,
    newLevelDownCount,
    deathList,
    levelUpList,
    levelDownList,
    guildData,
    isLoading,
    status,
    types,
    addType,
    handleLocalChange,
    handleClassificationChange,
    groupedData,
    characterChanges,
    setCharacterChanges,
  }
}
