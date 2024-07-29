'use client';

import { Box, Flex } from "@chakra-ui/react";
import { FC } from "react";
import Navbar from "./navbar";


const DashboardLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Flex>
      <Navbar />
      <Box ml={{ base: 0, md: 60 }} p={4} w="full">
        {children}
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
