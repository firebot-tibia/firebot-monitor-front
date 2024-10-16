'use client';

import { Box, Flex } from "@chakra-ui/react";
import { FC } from "react";
import Topbar from "./topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Flex direction="column" h="100vh">
      <Topbar />
      <Flex flex="1">
        <Box
          p={10}
          w={"100%"}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;