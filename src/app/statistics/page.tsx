import { Box, Heading } from '@chakra-ui/react'

import GuildStatsContainer from '@/components/features/statistics/guild-stats-container'

import DashboardLayout from '../../components/layout'

const GuildStats = () => {
  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mt={10} textAlign="center">
          Estatísticas da Guilda
        </Heading>
        <GuildStatsContainer />
      </Box>
    </DashboardLayout>
  )
}

export default GuildStats
