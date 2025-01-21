'use client'
import { useEffect, useState } from 'react'

import {
  useBreakpointValue,
  Box,
  IconButton,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  Skeleton,
  VStack,
} from '@chakra-ui/react'
import { FaBars } from 'react-icons/fa'

import LoginModal from '../../../features/auth/components/auth-modal'
import type { ToolType } from '../../../features/editor/types/tools.types'
import NavContent from '../navbar'

const SidebarSkeleton = () => (
  <VStack spacing={4} p={4} width="240px">
    <Skeleton height="40px" width="100%" />
    <Skeleton height="40px" width="100%" />
    <Skeleton height="40px" width="100%" />
    <Skeleton height="40px" width="100%" />
  </VStack>
)

const UnauthenticatedSidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTool, setActiveTool] = useState<ToolType | null>(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const desktopSidebar = (
    <Box
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      width="240px"
      bg="rgba(0,0,0,0.95)"
      transition="width 0.3s"
      zIndex={20}
      borderRight="1px solid rgba(255,255,255,0.1)"
    >
      {isLoading ? (
        <SidebarSkeleton />
      ) : (
        <NavContent
          isMobile={false}
          isExpanded={true}
          onOpenModal={() => setIsModalOpen(true)}
          activeTool={activeTool}
          onToggleExpand={() => {}}
        />
      )}
    </Box>
  )

  const mobileSidebar = (
    <>
      <IconButton
        icon={<FaBars />}
        position="fixed"
        top={4}
        left={4}
        zIndex={30}
        color="white"
        variant="ghost"
        onClick={onOpen}
        aria-label="Menu"
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="240px" bg="rgba(0,0,0,0.95)">
          {isLoading ? (
            <SidebarSkeleton />
          ) : (
            <NavContent
              isMobile={true}
              isExpanded={true}
              onOpenModal={() => setIsModalOpen(true)}
              activeTool={activeTool}
              onToggleExpand={onClose}
            />
          )}
        </DrawerContent>
      </Drawer>
    </>
  )

  return (
    <>
      {isMobile ? mobileSidebar : desktopSidebar}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default UnauthenticatedSidebar
