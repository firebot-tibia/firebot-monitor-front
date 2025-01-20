import { memo } from 'react'

import { Thead, Tr, Th } from '@chakra-ui/react'

import type { TableHeaderProps } from './types'

export const TableHeader = memo(function TableHeader({
  sortConfig,
  onSort,
  showExivaInput,
}: TableHeaderProps) {
  return (
    <Thead>
      <Tr borderBottomWidth="1px" borderColor="white.800">
        <Th p={0} pl={1} fontSize="11px" color="white.600" w="6%">
          #
        </Th>

        <Th
          p={0}
          pl={1}
          fontSize="11px"
          color="white.600"
          w="6%"
          cursor="pointer"
          onClick={() => onSort('Level')}
        >
          LVL
        </Th>

        <Th
          p={0}
          pl={1}
          fontSize="11px"
          color="white.600"
          w="8%"
          onClick={() => onSort('Vocation')}
        >
          VOC
        </Th>

        <Th
          p={0}
          pl={1}
          fontSize="11px"
          color="white.600"
          w="17%"
          cursor="pointer"
          onClick={() => onSort('Name')}
        >
          NAME
        </Th>

        <Th p={0} pl={1} fontSize="11px" color="white.600" w="19%" cursor="pointer">
          TYPE
        </Th>

        <Th
          p={0}
          pl={1}
          fontSize="11px"
          color="white.600"
          w="16%"
          onClick={() => onSort('TimeOnline')}
        >
          TIME
        </Th>

        {showExivaInput && (
          <Th p={0} pl={1} fontSize="11px" color="white.600" w="30%">
            EXIVA
          </Th>
        )}
      </Tr>
    </Thead>
  )
})
