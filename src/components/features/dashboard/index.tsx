import { Box, Flex } from '@chakra-ui/react'

import { BotDescriptions } from './components'
import DashboardLayout from '../../layout'


const Dashboard = () => {
  return (
    <DashboardLayout>
      <Flex>
        <Box ml="60px" flex={1} p={6}>
          <BotDescriptions />
        </Box>
      </Flex>
    </DashboardLayout>
  )
}

export default Dashboard
