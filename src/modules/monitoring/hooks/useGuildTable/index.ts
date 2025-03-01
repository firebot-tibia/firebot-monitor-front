import { useRef, useState, useMemo, useCallback } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'

import type { GuildMemberResponse } from '@/core/types/guild-member.response'

/**
 * Sorting configuration
 */
export interface SortConfig {
  key: keyof GuildMemberResponse
  direction: 'asc' | 'desc'
}

/**
 * Return type for useGuildTable hook
 */
export interface UseGuildTableReturn {
  sortConfig: SortConfig
  handleSort: (key: keyof GuildMemberResponse) => void
  filteredData: GuildMemberResponse[]
  containerRef: React.RefObject<HTMLDivElement>
  virtualizer: ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>
  isVirtualized: boolean
}

interface UseGuildTableProps {
  data: GuildMemberResponse[]
  initialSort?: SortConfig
  rowHeight?: number
  virtualizeThreshold?: number
}

/**
 * Custom hook for managing guild table data with sorting and virtualization
 */
export const useGuildTable = ({
  data,
  initialSort = { key: 'TimeOnline', direction: 'asc' },
  rowHeight = 40,
  virtualizeThreshold = 100,
}: UseGuildTableProps): UseGuildTableReturn => {
  // Refs for virtualization
  const containerRef = useRef<HTMLDivElement>(null)

  // State for sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort)

  // Track if we should use virtualization (based on data size)
  const isVirtualized = useMemo(
    () => Array.isArray(data) && data.length > virtualizeThreshold,
    [data, virtualizeThreshold],
  )

  /**
   * Handle column sorting
   */
  const handleSort = useCallback((key: keyof GuildMemberResponse) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  /**
   * Get comparison function for sorting
   */
  const getCompareFunction = useCallback(
    (key: keyof GuildMemberResponse, direction: 'asc' | 'desc') => {
      return (a: GuildMemberResponse, b: GuildMemberResponse): number => {
        if (!a || !b) return 0

        // Special case for OnlineStatus - always show online members first
        if (key === 'OnlineStatus') {
          const aOnline = Boolean(a.OnlineStatus)
          const bOnline = Boolean(b.OnlineStatus)
          if (aOnline !== bOnline) {
            return direction === 'asc' ? (aOnline ? -1 : 1) : aOnline ? 1 : -1
          }
          // If both have same online status, sort by name
          return direction === 'asc'
            ? String(a.Name || '').localeCompare(String(b.Name || ''))
            : String(b.Name || '').localeCompare(String(a.Name || ''))
        }

        const aValue = a[key]
        const bValue = b[key]

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return direction === 'asc' ? 1 : -1
        if (bValue == null) return direction === 'asc' ? -1 : 1

        // Handle numbers
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle strings (case insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc'
            ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
            : bValue.toLowerCase().localeCompare(aValue.toLowerCase())
        }

        // Handle other types
        const aStr = String(aValue)
        const bStr = String(bValue)
        return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
      }
    },
    [],
  )

  /**
   * Filter and sort the data
   */
  const filteredData = useMemo(() => {
    // Validate input
    if (!Array.isArray(data)) {
      console.warn('Invalid data received in useGuildTable:', data)
      return []
    }

    if (data.length === 0) {
      return []
    }

    // Get sorter function
    const compare = getCompareFunction(sortConfig.key, sortConfig.direction)

    // Sort a shallow copy of the array
    return [...data].sort(compare)
  }, [data, sortConfig, getCompareFunction])

  /**
   * Initialize virtualizer
   */
  const virtualizer = useVirtualizer<HTMLDivElement, Element>({
    count: filteredData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  })

  return {
    sortConfig,
    handleSort,
    filteredData,
    containerRef,
    virtualizer,
    isVirtualized,
  }
}
