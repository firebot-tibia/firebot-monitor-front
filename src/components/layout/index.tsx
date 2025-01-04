'use client'
import { Box, Flex } from '@chakra-ui/react'
import { Sidebar } from '../ui'
import { Footer } from './components'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh">
      <Flex flex={1}>
        <Sidebar />
        <Box ml="60px" flex={1} p={6}>
          {children}
        </Box>
      </Flex>

      <Footer />
    </Flex>
  )
}

export default DashboardLayout
