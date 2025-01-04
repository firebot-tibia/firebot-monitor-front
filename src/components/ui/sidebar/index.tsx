'use client'
import { Box } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import AuthenticatedSidebar from './authenticated'
import UnauthenticatedSidebar from './unauthenticated'

export const Sidebar = () => {
 const { status } = useSession()
 const isAuthenticated = status === 'authenticated'

 return (
   <Box>
     {isAuthenticated ? <AuthenticatedSidebar /> : <UnauthenticatedSidebar />}
   </Box>
 )
}

export default Sidebar;
