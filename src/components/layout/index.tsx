"use client"
import dynamic from 'next/dynamic'
import { Box, Flex } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import SideNavbar from './components/side-navbar';
import { FC } from 'react';

const UnauthenticatedTopbar = dynamic(
  () => import('../unauthenticated'),
  { ssr: false }
);

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <Flex>
      {isAuthenticated ? (
        <SideNavbar />
      ) : (
        <UnauthenticatedTopbar />
      )}
      <Box
        ml={isAuthenticated ? { base: '70px', md: '240px' } : 0}
        w="full"
        minH="100vh"
        p={6}
        transition="all 0.3s"
      >
        {children}
      </Box>
    </Flex>
  );
};

export default DashboardLayout;