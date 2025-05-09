import React from 'react'

import { Box, Heading } from '@chakra-ui/react'

import DashboardLayout from '@/modules/layout/components'

import CharacterStatsPage from '../../../modules/statistics/components/player-modal'

const CharacterPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mt={10} textAlign="center">
          Estatísticas da Guilda
        </Heading>
        <CharacterStatsPage />
      </Box>
    </DashboardLayout>
  )
}

export default CharacterPage
