import { Box, Heading } from '@chakra-ui/react'
import DashboardLayout from '../../components/layout'
import GuildStatsContainer from '../../components/guild/guild-stats/container'

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
