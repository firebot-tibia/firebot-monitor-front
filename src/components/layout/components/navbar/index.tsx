'use client'

import { useState } from 'react'

import { VStack, IconButton, Button, Collapse } from '@chakra-ui/react'
import Link from 'next/link'
import { FaBars, FaTools, FaDiscord, FaHome } from 'react-icons/fa'

import LoginButton from './login-button'
import type { NavbarProps } from './types'
import { routes } from '../../../../constants/routes'
import { tools } from '../../../features/editor/constants/toolbar'

const NavContent = ({
  isMobile,
  isExpanded,
  onOpenModal,
  activeTool,
  onToggleExpand,
}: NavbarProps & {
  isMobile: boolean
  isExpanded: boolean
  onOpenModal: () => void
  onToggleExpand: () => void
}) => {
  const [isToolsExpanded, setIsToolsExpanded] = useState(false)

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <IconButton
        icon={<FaBars />}
        variant="ghost"
        color="white"
        onClick={onToggleExpand}
        alignSelf="center"
        aria-label="Toggle menu"
        mb={2}
        _hover={{ bg: 'whiteAlpha.200' }}
      />

      <LoginButton isMobile={isMobile} isExpanded={isExpanded} onOpenModal={onOpenModal} />

      <Button
        as={Link}
        href={routes.home}
        leftIcon={<FaHome />}
        variant="ghost"
        color="gray.300"
        justifyContent="flex-start"
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        {(isMobile || isExpanded) && 'Home'}
      </Button>

      <Button
        leftIcon={<FaTools />}
        onClick={() => setIsToolsExpanded(!isToolsExpanded)}
        variant="ghost"
        color="gray.300"
        justifyContent="flex-start"
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        {(isMobile || isExpanded) && 'Ferramentas'}
      </Button>

      <Collapse in={isToolsExpanded}>
        <VStack align="stretch" pl={4} spacing={2}>
          {tools.map(tool => (
            <Button
              key={tool.id}
              as={Link}
              href={routes.editor}
              leftIcon={<tool.icon />}
              variant="ghost"
              color="gray.300"
              justifyContent="flex-start"
              bg={activeTool === tool.id ? 'whiteAlpha.100' : undefined}
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              {(isMobile || isExpanded) && tool.name}
            </Button>
          ))}
        </VStack>
      </Collapse>

      <Button
        as="a"
        href={routes.discordUrl}
        leftIcon={<FaDiscord />}
        variant="ghost"
        color="gray.300"
        justifyContent="flex-start"
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        {(isMobile || isExpanded) && 'Suporte Discord'}
      </Button>
    </VStack>
  )
}

export default NavContent
