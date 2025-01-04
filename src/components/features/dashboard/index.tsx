import { Box, Flex } from "@chakra-ui/react"
import DashboardLayout from "../../layout"
import { BotDescriptions } from "./components"

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

 export default Dashboard;
