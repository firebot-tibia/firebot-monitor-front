import { Box, HStack, Table, Tbody, Text } from '@chakra-ui/react'

import { TableHeader } from './table-header'
import { CharacterRow } from './table-row'
import type { GuildTableProps } from './types'
import { useGuildTable } from '../../hooks/useGuildTable'
import { useCharacterTypesView } from '../../hooks/useType'

export const GuildTable = ({
  type,
  data,
  onlineCount,
  onLocalChange,
  onClassificationChange,
  showExivaInput,
  addType,
  isLoading,
}: GuildTableProps) => {
  const { sortConfig, handleSort, filteredData } = useGuildTable(data)
  const types = useCharacterTypesView(data)

  return (
    <Box
      bg="#0D0D0D"
      borderColor="#141414"
      borderWidth="1px"
      w="full"
      maxH="calc(100vh - 50px)"
      overflow="auto"
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
          {filteredData.map((member, index) => (
            <CharacterRow
              key={member.Name}
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
