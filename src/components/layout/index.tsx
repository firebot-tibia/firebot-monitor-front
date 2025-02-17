'use client'
import { Box, Flex } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'

import { Footer } from './components'
import Header from './components/header'
import UnauthenticatedSidebar from './components/sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  return (
    <Flex direction="column" minH="100vh">
      <Flex flex={1}>
        {!isAuthenticated && !isLoading && <UnauthenticatedSidebar />}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          ml={!isLoading && !isAuthenticated ? '60px' : 0}
        >
          {/* Header */}
          {isAuthenticated && <Header />}

          {/* Main Content */}
          <Box flex={1} p={6}>
            {children}
          </Box>
        </Box>
      </Flex>

      {!isAuthenticated && !isLoading && <Footer />}
    </Flex>
  )
}

export default DashboardLayout
