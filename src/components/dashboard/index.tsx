'use client';

import { Box, Flex } from "@chakra-ui/react";
import { FC, useState } from "react";
import Topbar from "./topbar";
import { Navbar } from "./navbar";

const DashboardLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Flex direction="column" h="100vh">
      <Topbar onToggleMenu={handleToggle} />
      
      <Flex flex="1">
        <Navbar isOpen={isOpen} onToggle={handleToggle} />
        <Box 
          ml={isOpen ? "240px" : "60px"} 
          p={12} 
          w={`calc(100% - ${isOpen ? "240px" : "60px"})`}
          transition="margin-left 0.3s ease, width 0.3s ease"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;
