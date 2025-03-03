import React from 'react'

import { Box, Flex, Image, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'

import { formatExp } from '../../../../core/utils/format-exp'
import { tableVocationIcons } from '../../../../core/utils/table-vocation-icons'
import type { GuildData } from '../../types/guild-stats.interface'
import ExpStats from '../exp-stats'

interface GuildTableProps {
  guildType: 'allyGain' | 'allyLoss' | 'enemyGain' | 'enemyLoss'
  guildData: GuildData
  filter: string
  onCharacterClick: (characterName: string) => void
  isLoading: boolean
}

const GuildTableStats: React.FC<GuildTableProps> = ({
  guildType,
  guildData,
  filter,
  onCharacterClick,
  isLoading,
}) => {
  const bgColor = 'black.800'
  const borderColor = 'black.700'
  const hoverBgColor = 'red.700'
  const textColor = 'white.100'
  const headerColor = 'red.400'

  const tableTitle = `${guildType.includes('ally') ? 'Aliados' : 'Inimigos'} - ${guildType.includes('Gain') ? 'Ganho' : 'Perda'} de XP`

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" color="red.400" />
      </Flex>
    )
  }

  return (
    <Box
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      boxShadow="lg"
      style={{ zoom: `${100}%` }}
    >
      <Box p={4} borderBottom="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" color={headerColor}>
          {tableTitle}
        </Text>
        <ExpStats totalExp={guildData.totalExp} avgExp={guildData.avgExp} filter={filter} />
      </Box>
      <Box overflowX="auto">
        <Table variant="unstyled" size="sm">
          <Thead>
            <Tr>
              <Th color={headerColor}>EXP</Th>
              <Th color={headerColor}>VOC</Th>
              <Th color={headerColor}>NOME</Th>
              <Th isNumeric color={headerColor}>
                LVL
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {guildData.data.map(item => (
              <Tr
                key={item.name}
                _hover={{ bg: hoverBgColor, cursor: 'pointer' }}
                onClick={() => onCharacterClick(item.name)}
              >
                <Td color={textColor}>{formatExp(item.experience)}</Td>
                <Td>
                  <Image
                    src={tableVocationIcons[item.vocation]}
                    alt={item.vocation}
                    boxSize="24px"
                  />
                </Td>
                <Td color={textColor}>{item.name}</Td>
                <Td isNumeric color={textColor}>
                  {item.level}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default GuildTableStats
