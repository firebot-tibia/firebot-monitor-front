import { Box, Flex } from '@chakra-ui/react'

import DashboardLayout from '../../layout'
import DescriptionEditor from './components/description'

const Editor = () => {
  return (
    <DashboardLayout>
      <Flex>
        <Box ml="60px" flex={1} p={6}>
          <DescriptionEditor />
        </Box>
      </Flex>
    </DashboardLayout>
  )
}

export default Editor
