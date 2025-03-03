import React from 'react'

import {
  Box,
  Flex,
  HStack,
  Image,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react'

import { tableVocationIcons } from '@/core/utils/table-vocation-icons'
import type { GuildStatsPlayer } from '@/modules/statistics/types/guild-stats-player.interface'

import { StatsCard } from '../shared/StatsCard'

interface ExperienceTableProps {
  data: GuildStatsPlayer[]
  isLoading: boolean
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export const ExperienceTable: React.FC<ExperienceTableProps> = ({
  data,
  isLoading,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" color="blue.400" />
      </Flex>
    )
  }

  const totalExperience = data.reduce((acc, player) => acc + player.experience, 0)
  const averageLevel = Math.round(data.reduce((acc, player) => acc + player.level, 0) / data.length)

  return (
    <Box>
      {/* Summary Cards */}
      <Flex gap={4} mb={6} flexWrap="wrap">
        <StatsCard title="Total de Jogadores" value={data.length.toString()} icon="👥" />
        <StatsCard title="Experiência Total" value={totalExperience.toLocaleString()} icon="⚔️" />
        <StatsCard title="Nível Médio" value={averageLevel.toString()} icon="📊" />
      </Flex>

      {/* Table */}
      <Box overflowX="auto" borderWidth={1} borderColor={borderColor} rounded="lg">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Personagem</Th>
              <Th>Vocação</Th>
              <Th isNumeric>Nível</Th>
              <Th isNumeric>Experiência</Th>
              <Th>Local</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map(player => (
              <Tr key={player.name} _hover={{ bg: hoverBgColor }} cursor="pointer">
                <Td>
                  <Text color={textColor} fontWeight="medium">
                    {player.name}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Image
                      src={tableVocationIcons[player.vocation]}
                      alt={player.vocation}
                      width="20px"
                      height="20px"
                    />
                    <Text>{player.vocation}</Text>
                  </HStack>
                </Td>
                <Td isNumeric>{player.level}</Td>
                <Td isNumeric>{player.experience.toLocaleString()}</Td>
                <Td>{player.local || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Flex justify="space-between" align="center" mt={4}>
        <HStack spacing={2}>
          <Text fontSize="sm">Itens por página:</Text>
          <Select
            size="sm"
            width="70px"
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </HStack>
        <HStack spacing={2}>
          <Text fontSize="sm">
            Página {currentPage} de {totalPages}
          </Text>
          <HStack spacing={1}>
            <Box
              as="button"
              px={2}
              py={1}
              rounded="md"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              opacity={currentPage === 1 ? 0.5 : 1}
              _hover={{ bg: hoverBgColor }}
            >
              ←
            </Box>
            <Box
              as="button"
              px={2}
              py={1}
              rounded="md"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              opacity={currentPage === totalPages ? 0.5 : 1}
              _hover={{ bg: hoverBgColor }}
            >
              →
            </Box>
          </HStack>
        </HStack>
      </Flex>
    </Box>
  )
}
