'use client';
import { Box, Flex, Skeleton } from "@chakra-ui/react";
import { FC } from "react";
import Topbar from "./topbar";
import { useSession } from "next-auth/react";
import UnauthenticatedTopbar from "../unauthenticated/topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const TopbarLoader = () => (
  <Skeleton
    height="64px"
    width="100%"
    startColor="red.900"
    endColor="red.700"
    position="fixed"
    top={0}
    left={0}
    right={0}
    zIndex={1000}
  />
);

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const { status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return (
    <Flex direction="column" h="100vh">
      {isLoading ? (
        <TopbarLoader />
      ) : (
        isAuthenticated ? <Topbar /> : <UnauthenticatedTopbar />
      )}
      <Flex
        flex="1"
        mt={isLoading ? "64px" : 0}
      >
        <Box
          p={10}
          w="100%"
          opacity={isLoading ? 0.7 : 1}
          transition="opacity 0.3s"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;