import { useRef, useState, useMemo } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'

import type { GuildMemberResponse } from '@/types/guild-member.response'

import type { SortConfig } from './types'

export const useGuildTable = (data: GuildMemberResponse[]) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'TimeOnline',
    direction: 'asc',
  })

  const handleSort = (key: keyof GuildMemberResponse) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const filteredData = useMemo(() => {
    console.log('Sorting guild data:', { dataLength: data.length, sortKey: sortConfig.key })

    // First ensure we have valid data
    if (!Array.isArray(data)) {
      console.warn('Invalid data received in useGuildTable:', data)
      return []
    }

    // Create a new array to avoid mutation
    return [...data].sort((a, b) => {
      if (!a || !b) return 0

      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle strings and other types
      const aStr = String(aValue)
      const bStr = String(bValue)
      return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, sortConfig])

  const virtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 40,
    overscan: 5,
  })

  return {
    sortConfig,
    handleSort,
    filteredData,
    containerRef,
    virtualizer,
  }
}
