import { useState, useMemo } from 'react'

import { Box, HStack, Table, Tbody, Text } from '@chakra-ui/react'

import type { GuildMemberResponse } from '@/common/types/guild-member.response'

import { TableHeader } from './table-header'
import { CharacterRow } from './table-row'
import { useCharacterTypesView } from '../../hooks/useType'

// Define SortConfig type if not already defined
export interface SortConfig {
  key: keyof GuildMemberResponse
  direction: 'asc' | 'desc'
}

// Simple hook to handle sorting without any complex dependencies
function useSimpleSort(data: GuildMemberResponse[] = []) {
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

  // Simple sorting logic with basic error handling
  const sortedData = useMemo(() => {
    // Ensure we have valid data
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    // Simple sort with fallbacks for undefined/null values
    return [...data].sort((a, b) => {
      if (!a || !b) return 0

      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Convert to strings for comparison
      const aStr = String(aValue || '')
      const bStr = String(bValue || '')
      return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, sortConfig])

  return { sortConfig, handleSort, filteredData: sortedData }
}

// Guild table props
export interface GuildTableProps {
  type: string
  data: GuildMemberResponse[]
  onlineCount: number
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void
  onClassificationChange: (member: GuildMemberResponse, newType: string) => Promise<void>
  showExivaInput?: boolean
  addType: (type: string) => void
  isLoading?: boolean
}

// Simplified GuildTable with minimal dependencies
export const GuildTable = ({
  type,
  data,
  onlineCount,
  onLocalChange,
  onClassificationChange,
  showExivaInput = true,
  addType,
  isLoading = false,
}: GuildTableProps) => {
  // Use simple sorting without complex hooks
  const { sortConfig, handleSort, filteredData } = useSimpleSort(data)
  const types = useCharacterTypesView(data)

  // Debug logging to help diagnose rendering issues
  console.log('[GuildTable] Rendering:', {
    type,
    dataPresent: !!data,
    dataLength: data?.length || 0,
    filteredLength: filteredData?.length || 0,
    onlineCount,
    isLoading,
  })

  // Show loading state
  if (isLoading) {
    return (
      <Box
        bg="#0D0D0D"
        borderColor="#141414"
        borderWidth="1px"
        w="full"
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500" fontSize="sm">
          Loading guild data...
        </Text>
      </Box>
    )
  }

  // Show empty state
  if (!data || data.length === 0) {
    return (
      <Box
        bg="#0D0D0D"
        borderColor="#141414"
        borderWidth="1px"
        w="full"
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500" fontSize="sm">
          No guild data available for {type}
        </Text>
      </Box>
    )
  }

  // Main table rendering
  return (
    <Box
      bg="#0D0D0D"
      borderColor="#141414"
      borderWidth="1px"
      w="full"
      maxH="calc(100vh - 50px)"
      overflow="auto"
      position="relative"
    >
      {/* Header */}
      <HStack
        bg="#0F0F0F"
        px={2}
        h="5"
        borderBottomWidth="1px"
        borderColor="#141414"
        justify="space-between"
      >
        <HStack spacing={1}>
          <Text fontSize="9px" color="white.400">
            {type.toUpperCase()}
          </Text>
          <Text fontSize="11px" color="green.500">
            {onlineCount} Online
          </Text>
        </HStack>
      </HStack>

      {/* Table */}
      <Table variant="unstyled" size="xs" layout="fixed" w="full">
        <TableHeader sortConfig={sortConfig} onSort={handleSort} showExivaInput={showExivaInput} />
        <Tbody>
          {filteredData.length > 0 ? (
            filteredData.map((member, index) => (
              <CharacterRow
                key={`${member.Name || 'unknown'}-${index}`}
                member={member}
                onLocalChange={onLocalChange}
                onClassificationChange={onClassificationChange}
                showExivaInput={showExivaInput}
                types={types}
                addType={addType}
                index={index + 1}
              />
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <Box p={4} textAlign="center">
                  <Text color="gray.500" fontSize="sm">
                    No characters match the current filters
                  </Text>
                </Box>
              </td>
            </tr>
          )}
        </Tbody>
      </Table>
    </Box>
  )
}

export default GuildTable
