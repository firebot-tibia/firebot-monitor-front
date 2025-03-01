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

  return (
    <Flex direction="column" minH="100vh">
      <Flex flex={1}>
        {!isAuthenticated && <UnauthenticatedSidebar />}
        <Box flex={1} display="flex" flexDirection="column" ml={isAuthenticated ? 0 : '60px'}>
          {/* Header */}
          {isAuthenticated && <Header />}

          {/* Main Content */}
          <Box flex={1} p={6}>
            {children}
          </Box>
        </Box>
      </Flex>

      {!isAuthenticated && <Footer />}
    </Flex>
  )
}

export default DashboardLayout
