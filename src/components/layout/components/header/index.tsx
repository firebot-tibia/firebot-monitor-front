'use client'

import { Box, Flex, HStack, IconButton, Tooltip, useColorModeValue } from '@chakra-ui/react'
import { Home, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { FaDiscord } from 'react-icons/fa'

import { routes } from '@/constants/routes'

import ModeSelect from './components/mode-select'
import WorldSelect from './components/world-select'
import AlertSettings from '../../components/widgets/alerts-widget'
import MapWidget from '../../components/widgets/map-widget'
import RespawnListWidget from '../../components/widgets/respawn-list-widget'
import StatisticsWidget from '../../components/widgets/statistics-widget'

const Header = () => {
  const router = useRouter()
  const buttonHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200')

  return (
    <Box
      w="full"
      borderBottom="1px solid"
      borderColor="gray.700"
      bg="#1a1b1e"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex justify="space-between" align="center" px={8} py={3} w="full">
        {/* Left side - Navigation Icons */}
        <HStack spacing={3}>
          <Tooltip label="Home" placement="bottom">
            <IconButton
              aria-label="Home"
              icon={<Home size={20} />}
              onClick={() => router.push(routes.guild)}
              bg="transparent"
              _hover={{ bg: buttonHoverBg }}
              size="sm"
            />
          </Tooltip>

          <Tooltip label="Discord" placement="bottom">
            <IconButton
              as="a"
              href={routes.discordUrl}
              target="_blank"
              aria-label="Discord"
              icon={<FaDiscord size={20} />}
              bg="transparent"
              _hover={{ bg: buttonHoverBg }}
              size="sm"
            />
          </Tooltip>

          <Tooltip label="Sair" placement="bottom">
            <IconButton
              aria-label="Logout"
              icon={<LogOut size={20} />}
              onClick={async () =>
                await signOut({
                  callbackUrl: '/',
                  redirect: true,
                })
              }
              bg="transparent"
              _hover={{ bg: buttonHoverBg }}
              size="sm"
            />
          </Tooltip>
        </HStack>

        {/* Center - World and Mode Selection */}
        <HStack spacing={4}>
          <WorldSelect />
          <ModeSelect />
        </HStack>

        {/* Right side - widgets */}
        <HStack spacing={3}>
          <MapWidget />
          <StatisticsWidget />
          <RespawnListWidget />
          <AlertSettings />
        </HStack>
      </Flex>
    </Box>
  )
}

export default Header
