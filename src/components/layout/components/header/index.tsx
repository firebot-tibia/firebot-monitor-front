'use client'

import { Badge, Box, Flex, HStack, IconButton, Tooltip, useColorModeValue } from '@chakra-ui/react'
import { Home, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { FaDiscord } from 'react-icons/fa'

import { useCharacterTracker } from '@/components/features/guilds-monitoring/hooks/useCharacterTracker'
import AlertSettings from '@/components/features/monitoring/components'
import { useMonitoringSettingsStore } from '@/components/features/monitoring/stores/monitoring-settings-store'
import RespawnListWidget from '@/components/features/reservations/components/respawn-list-widget'
import StatisticsWidget from '@/components/features/statistics/components/statistics-widget'
import MapWidget from '@/components/features/tibia-map/map-widget'
import { routes } from '@/common/constants/routes'

import ModeSelect from './components/mode-select'
import WorldSelect from './components/world-select'

const Header = () => {
  const router = useRouter()
  const { timeThreshold, memberThreshold, updateSettings } = useMonitoringSettingsStore()
  const { activeCharacterCount } = useCharacterTracker(timeThreshold, memberThreshold)

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1}
      bg={useColorModeValue('white', 'black.800')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      px={4}
      py={2}
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <Tooltip label="Voltar para o início">
            <IconButton
              variant="ghost"
              aria-label="Home"
              icon={<Home size={20} />}
              onClick={() => router.push('/')}
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
              _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
              size="sm"
            />
          </Tooltip>

          <WorldSelect />
          <ModeSelect />
        </HStack>

        <HStack spacing={4}>
          <RespawnListWidget />
          <StatisticsWidget />
          <MapWidget />
          <AlertSettings />

          <Badge colorScheme={activeCharacterCount >= memberThreshold ? 'red' : 'gray'} fontSize="sm">
            {activeCharacterCount} personagens detectados
          </Badge>

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
              size="sm"
            />
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  )
}

export default Header
