import { useRef, useState, useMemo } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'

import type { GuildMemberResponse } from '@/types/guild-member.response'

import type { SortConfig } from './types'

export const useGuildTable = (data: GuildMemberResponse[]) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'Level',
    direction: 'desc',
  })

  const handleSort = (key: keyof GuildMemberResponse) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const filteredData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
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
