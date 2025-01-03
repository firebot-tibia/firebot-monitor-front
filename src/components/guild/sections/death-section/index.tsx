import React from 'react'
import { Box, Flex, Heading } from '@chakra-ui/react'
import { Death } from '../../../../types/interfaces/death.interface'
import DeathTable from '../../../lists/death-list'

interface DeathSectionProps {
  deathList: Death[]
  playAudio: () => void
  audioEnabled: boolean
}

export const DeathSection: React.FC<DeathSectionProps> = ({
  deathList,
  playAudio,
  audioEnabled,
}) => {
  return (
    <Box>
      <Flex align="center" justify="center" mb={4}>
        <Heading as="h2" size="md">
          Mortes Recentes
        </Heading>
      </Flex>
      <DeathTable deathList={deathList} audioEnabled={audioEnabled} />
    </Box>
  )
}
