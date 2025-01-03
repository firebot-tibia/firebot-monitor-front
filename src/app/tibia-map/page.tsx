import { Box } from '@chakra-ui/react'
import DashboardLayout from '../../components/layout'
import Maps from '../../components/features/tibia-map'

const TibiaMaps = () => {
  return (
    <DashboardLayout>
      <Box p={4}>
        <Maps />
      </Box>
    </DashboardLayout>
  )
}

export default TibiaMaps
