import { useCallback, useEffect, useRef, useState } from 'react'

import type { GuildMemberResponse } from '../../../../../common/types/guild-member.response'

interface UseGuildDataReturn {
  guildData: GuildMemberResponse[]
  setGuildData: (
    value: GuildMemberResponse[] | ((prev: GuildMemberResponse[]) => GuildMemberResponse[]),
  ) => void
  updateMemberData: (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => void
  processNewGuildData: (data: GuildMemberResponse[]) => void
}

export const useGuildData = (): UseGuildDataReturn => {
  // Use ref for current data to avoid re-renders
  const guildDataRef = useRef<GuildMemberResponse[]>([])
  const lastUpdateRef = useRef<number>(Date.now())
  const pendingUpdatesRef = useRef<Set<string>>(new Set())

  const [guildData, setGuildData] = useState<GuildMemberResponse[]>(() => {
    console.debug('Initializing guild data state')
    return []
  })

  // Use Map for O(1) lookups
  const memberMapRef = useRef(new Map<string, GuildMemberResponse>())

  // Batch updates using RAF
  const batchUpdateRef = useRef<number | null>(null)

  // Update member map when guild data changes
  useEffect(() => {
    memberMapRef.current = new Map(guildData.map(member => [member.Name, member]))
    guildDataRef.current = guildData
  }, [guildData])

  const updateMemberData = useCallback(
    (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => {
      const currentMap = memberMapRef.current
      const memberName = member.Name
      const existingMember = currentMap.get(memberName)
      const now = Date.now()

      // Adicionar à lista de atualizações pendentes
      pendingUpdatesRef.current.add(memberName)

      if (!existingMember) {
        currentMap.set(memberName, { ...member, ...changes })
      } else {
        // Verificar se a atualização é necessária
        const hasChanges = Object.entries(changes).some(
          ([key, value]) => existingMember[key as keyof GuildMemberResponse] !== value,
        )

        if (hasChanges) {
          currentMap.set(memberName, { ...existingMember, ...changes })
          lastUpdateRef.current = now
        } else {
          pendingUpdatesRef.current.delete(memberName)
          return // Pular atualização se não houver mudanças
        }
      }

      // Schedule batch update
      if (batchUpdateRef.current) {
        cancelAnimationFrame(batchUpdateRef.current)
      }

      batchUpdateRef.current = requestAnimationFrame(() => {
        batchUpdateRef.current = null
        const newData = Array.from(currentMap.values())

        // Só atualizar se houver mudanças pendentes
        if (pendingUpdatesRef.current.size > 0) {
          console.debug('Batch updating guild data:', {
            updatedMembers: Array.from(pendingUpdatesRef.current),
            totalMembers: newData.length,
            timestamp: new Date().toISOString(),
          })

          setGuildData(newData)
          pendingUpdatesRef.current.clear()
        }
      })
    },
    [],
  )

  const processNewGuildData = useCallback((data: GuildMemberResponse[]) => {
    if (!Array.isArray(data)) {
      console.warn('Invalid guild data received:', data)
      return
    }

    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    // Validar dados recebidos
    const validData = data.filter(member => {
      if (!member?.Name || typeof member.Name !== 'string') {
        console.warn('Invalid member data:', member)
        return false
      }
      return true
    })

    if (validData.length === 0) {
      console.warn('No valid guild data to process')
      return
    }

    // Verificar se há mudanças significativas
    const hasSignificantChanges = validData.some(newMember => {
      const existingMember = memberMapRef.current.get(newMember.Name)
      return !existingMember || JSON.stringify(existingMember) !== JSON.stringify(newMember)
    })

    if (hasSignificantChanges || timeSinceLastUpdate > 30000) {
      // Forçar atualização após 30s
      console.debug('Processing new guild data:', {
        validMembers: validData.length,
        timeSinceLastUpdate: Math.round(timeSinceLastUpdate / 1000) + 's',
        hasChanges: hasSignificantChanges,
      })

      setGuildData(validData)
      lastUpdateRef.current = now
    } else {
      console.debug('Skipping update - no significant changes')
    }

    // Use Map for faster processing
    const newDataMap = new Map(validData.map(member => [member.Name, member]))

    // Quick length and content check
    if (newDataMap.size === memberMapRef.current.size) {
      let hasChanges = false
      // Use Array.from for ES5 compatibility
      const entries = Array.from(newDataMap.keys())
      for (let i = 0; i < entries.length; i++) {
        const name = entries[i]
        const member = newDataMap.get(name)
        const existing = memberMapRef.current.get(name)
        if (!existing || JSON.stringify(existing) !== JSON.stringify(member)) {
          hasChanges = true
          break
        }
      }
      if (!hasChanges) {
        console.debug('No changes detected in guild data')
        return
      }
    }

    // Schedule batch update with debounce
    if (batchUpdateRef.current) {
      cancelAnimationFrame(batchUpdateRef.current)
    }

    const timestamp = Date.now()
    batchUpdateRef.current = requestAnimationFrame(() => {
      console.log('Processing new guild data:', {
        newDataCount: validData.length,
        currentDataCount: guildDataRef.current.length,
        hasChanges: true,
        processTime: Date.now() - timestamp,
      })

      try {
        setGuildData(validData)
      } catch (error) {
        console.error('Error updating guild data:', error)
        // Tentar novamente com um novo RAF
        requestAnimationFrame(() => {
          console.log('Retrying guild data update...')
          setGuildData(validData)
        })
      }
    })
  }, [])

  return {
    guildData,
    setGuildData,
    updateMemberData,
    processNewGuildData,
  }
}
