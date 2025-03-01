import { useState, useMemo } from 'react'

import { Box, HStack, Table, Tbody, Text } from '@chakra-ui/react'

import type { GuildMemberResponse } from '@/core/types/guild-member.response'

import { TableHeader } from '../table-header'
import { CharacterRow } from '../table-row'

// Types
export interface SortConfig {
  key: keyof GuildMemberResponse
  direction: 'asc' | 'desc'
}

export interface GuildTableProps {
  type: string
  data: GuildMemberResponse[]
  onlineCount: number
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void
  onClassificationChange: (member: GuildMemberResponse, newType: string) => Promise<void>
  showExivaInput?: boolean
  addType: (type: string) => void
  isLoading?: boolean
  types: string[]
}

// Constants
const DEFAULT_SORT_KEY: keyof GuildMemberResponse = 'Level'
const DEFAULT_SORT_DIRECTION = 'desc' as const

// Component for empty or loading states
const TablePlaceholder = ({ message }: { message: string }) => (
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
      {message}
    </Text>
  </Box>
)

/**
 * Custom hook for sorting guild member data
 */
function useGuildDataSort(data: GuildMemberResponse[] = []) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: DEFAULT_SORT_KEY,
    direction: DEFAULT_SORT_DIRECTION,
  })

  const handleSort = (key: keyof GuildMemberResponse) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Sort the data with memoization
  const sortedData = useMemo(() => {
    // Input validation
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    // Create a copy and filter invalid entries
    const validData = data.filter(member => member && typeof member === 'object')

    if (validData.length === 0) {
      return []
    }

    // Sort the data
    return [...validData].sort((a, b) => {
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

  return { sortConfig, handleSort, sortedData }
}

/**
 * GuildTable component for displaying and interacting with guild members
 */
export const GuildTable = ({
  type,
  data,
  onlineCount,
  onLocalChange,
  onClassificationChange,
  showExivaInput = true,
  addType,
  isLoading = false,
  types,
}: GuildTableProps) => {
  const { sortConfig, handleSort, sortedData } = useGuildDataSort(data)

  // Handle loading state
  if (isLoading) {
    return <TablePlaceholder message="Loading guild data..." />
  }

  // Handle empty state
  if (!sortedData || sortedData.length === 0) {
    return <TablePlaceholder message={`No guild data available for ${type}`} />
  }

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
      {/* Table Header Bar */}
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

      {/* Table Content */}
      <Table variant="unstyled" size="xs" layout="fixed" w="full">
        <TableHeader sortConfig={sortConfig} onSort={handleSort} showExivaInput={showExivaInput} />
        <Tbody>
          {sortedData.map((member, index) => (
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
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default GuildTable
