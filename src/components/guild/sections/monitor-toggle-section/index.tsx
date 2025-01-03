import React, { useCallback } from 'react'
import { Switch, Flex, Text, Box, useColorModeValue, VStack, Button } from '@chakra-ui/react'
import { GuildMemberResponse } from '../../../../types/interfaces/guild/guild-member.interface'
import { BombaMakerMonitor } from '../../guild-table/character-monitor'
import { useMonitorToggleSection } from '../hooks/useMonitorToggle'

interface MonitorToggleSectionProps {
  guildData: GuildMemberResponse[]
  characterChanges: GuildMemberResponse[]
  setCharacterChanges: React.Dispatch<React.SetStateAction<GuildMemberResponse[]>>
  isLoading: boolean
  onStartMonitoring: () => void
}

const MonitorToggleSection: React.FC<MonitorToggleSectionProps> = (props) => {
  const {
    isClient,
    monitoringStarted,
    deathAudio,
    levelUpAudio,
    handleToggleDeathAudio,
    handleToggleLevelUpAudio,
    testDeathAudio,
    testLevelUpAudio,
    handleStartMonitoring,
    guildData,
    characterChanges,
    setCharacterChanges,
    isLoading,
  } = useMonitorToggleSection(
    props.guildData,
    props.characterChanges,
    props.setCharacterChanges,
    props.isLoading,
    props.onStartMonitoring,
  )

  const bgColor = useColorModeValue('black.900', 'black.900')
  const textColor = useColorModeValue('gray.100', 'gray.200')

  const handleCharacterChangesProcessed = useCallback(() => {
    setCharacterChanges([])
  }, [setCharacterChanges])

  if (!isClient) {
    return null
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" width="100%">
      <VStack spacing={6} align="stretch" width="100%">
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="md" fontWeight="semibold" color={textColor}>
            Alerta sonoro de mortes
          </Text>
          <Flex alignItems="center">
            <Switch
              isChecked={deathAudio.audioEnabled}
              onChange={handleToggleDeathAudio}
              colorScheme="red"
              size="lg"
              mr={4}
            />
            <Button onClick={testDeathAudio} colorScheme="red" size="sm">
              Testar
            </Button>
          </Flex>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="md" fontWeight="semibold" color={textColor}>
            Alerta sonoro de level up
          </Text>
          <Flex alignItems="center">
            <Switch
              isChecked={levelUpAudio.audioEnabled}
              onChange={handleToggleLevelUpAudio}
              colorScheme="green"
              size="lg"
              mr={4}
            />
            <Button onClick={testLevelUpAudio} colorScheme="green" size="sm">
              Testar
            </Button>
          </Flex>
        </Flex>
        <Button
          onClick={handleStartMonitoring}
          colorScheme="blue"
          size="lg"
          isDisabled={monitoringStarted}
        >
          {monitoringStarted ? 'Monitoramento Ativo' : 'Iniciar Monitoramento'}
        </Button>
        <BombaMakerMonitor characters={guildData} />
      </VStack>
    </Box>
  )
}

MonitorToggleSection.displayName = 'MonitorToggleSection'
export default MonitorToggleSection
