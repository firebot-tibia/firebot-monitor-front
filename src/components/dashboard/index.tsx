'use client';

import { Box, Flex } from "@chakra-ui/react";
import { FC } from "react";
import Navbar from "./navbar";
import Topbar from "./topbar";

const DashboardLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Flex direction="column" h="100vh">
      <Topbar />
      <Flex flex="1">
        <Navbar />
        <Box ml={{ base: 0, md: 60 }} p={4} w="full">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;
