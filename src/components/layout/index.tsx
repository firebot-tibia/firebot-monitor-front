'use client'
import { Box, Flex } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'

import { Footer } from './components'
import AuthSidebar from './components/sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <Flex direction="column" minH="100vh">
      <Flex flex={1}>
        <AuthSidebar />
        <Box ml="60px" flex={1} p={6}>
          {children}
        </Box>
      </Flex>

      {isAuthenticated ? null : <Footer />}
    </Flex>
  )
}

export default DashboardLayout
