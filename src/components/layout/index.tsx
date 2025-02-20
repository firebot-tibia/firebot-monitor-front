'use client'

import { Box, Flex } from '@chakra-ui/react'

import Header from './components/header'


interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      {/* Main Content */}
      <Flex
        direction="column"
        minH="100vh"
        transition="all 0.3s ease-in-out"
      >
        <Flex flex={1}>
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
          >
            {/* Header */}
            {<Header />}

            {/* Main Content */}
            <Box
              flex={1}
              p={6}
              overflow="hidden"
            >
              {children}
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}

export default DashboardLayout
