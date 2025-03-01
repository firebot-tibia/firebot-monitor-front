'use client'

import { Box, Flex } from '@chakra-ui/react'

import Header from './header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      <Flex direction="column" minH="100vh" transition="all 0.3s ease-in-out">
        <Flex flex={1}>
          <Box flex={1} display="flex" flexDirection="column">
            <Header />
            <Box flex={1} p={6} overflow="hidden">
              {children}
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}

export default DashboardLayout
