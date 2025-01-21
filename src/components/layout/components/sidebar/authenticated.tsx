'use client'
import { useState } from 'react'

import {
  Flex,
  IconButton,
  VStack,
  Tooltip,
  useColorModeValue,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Portal,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import NextLink from 'next/link'
import { signOut } from 'next-auth/react'
import { FaSignOutAlt, FaBars, FaDiscord, FaCog } from 'react-icons/fa'

import { routes, routesArray } from '../../../../constants/routes'
import ModeSelect from '../mode-select'
import WorldSelect from '../world-select'

const AuthenticatedSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const bgColor = useColorModeValue('gray.900', 'black')
  const textColor = useColorModeValue('white', 'gray.100')

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <motion.div
      initial={{ width: '60px' }}
      animate={{ width: isExpanded ? '240px' : '60px' }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: bgColor,
        zIndex: 1000,
        borderRight: '1px solid',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <Flex direction="column" h="100%" color={textColor}>
        <IconButton
          aria-label="Toggle menu"
          icon={<FaBars />}
          variant="ghost"
          color={textColor}
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          m={2}
        />

        <VStack spacing={1} align="stretch" flex={1} pt={4}>
          {routesArray.map(item => (
            <Tooltip key={item.href} label={!isExpanded ? item.name : ''} placement="right">
              <Flex
                as={NextLink}
                href={item.href}
                align="center"
                px={4}
                py={3}
                cursor="pointer"
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                <Icon as={item.icon} fontSize="20px" />
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ marginLeft: '12px' }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </Flex>
            </Tooltip>
          ))}
        </VStack>

        <VStack spacing={2} p={2} align="stretch">
          <Popover placement="right">
            <PopoverTrigger>
              <IconButton
                aria-label="Settings"
                icon={<FaCog />}
                variant="ghost"
                color={textColor}
                size="sm"
                isRound
              />
            </PopoverTrigger>
            <Portal>
              <PopoverContent bg={bgColor} borderColor="whiteAlpha.200" w="200px">
                <VStack p={2} spacing={2}>
                  <WorldSelect />
                  <ModeSelect />
                </VStack>
              </PopoverContent>
            </Portal>
          </Popover>

          <IconButton
            as={Link}
            href={routes.discordUrl}
            isExternal
            aria-label="Discord"
            icon={<FaDiscord />}
            variant="ghost"
            color={textColor}
            size="sm"
            isRound
          />

          <IconButton
            aria-label="Logout"
            icon={<FaSignOutAlt />}
            onClick={handleLogout}
            variant="ghost"
            color={textColor}
            size="sm"
            isRound
          />
        </VStack>
      </Flex>
    </motion.div>
  )
}

export default AuthenticatedSidebar
