'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

import {
  Box,
  FormControl,
  Input,
  VStack,
  Text,
  HStack,
  useToast,
  IconButton,
  Collapse,
  Select,
  FormLabel,
  Button,
  Tag,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
  Card,
  CardBody,
  Switch,
} from '@chakra-ui/react'
import { Settings, Clock, Bell, Plus, X, Volume2, AlertTriangle, Eye, EyeOff } from 'lucide-react'

import type { AlertCondition } from '@/components/features/monitoring/types/alert.types'
import { typeColors } from '@/constants/types'

import { useGuilds } from '../../../guilds-monitoring/hooks/useGuilds'
import { useCharacterTypesView } from '../../../guilds-monitoring/hooks/useType'
import { useAlertSettingsStore, checkAlertCondition } from '../../stores/alert-settings-store'

const AlertSettings = () => {
  // Refs and hooks
  const audioRef = useRef<HTMLAudioElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const types = useCharacterTypesView([])
  const { characterChanges } = useGuilds()

  // Theme constants
  const bgColor = 'rgba(17, 17, 17, 0.95)'
  const cardBgColor = 'rgba(26, 26, 26, 0.95)'
  const borderColor = 'whiteAlpha.200'
  const activeColor = 'blue.400'

  // Store state
  const {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    monitoredLists,
    addMonitoredList,
    removeMonitoredList,
    toggleMonitoredList,
  } = useAlertSettingsStore()

  // Local state
  const [isCreatingAlert, setIsCreatingAlert] = useState(false)
  const [newAlert, setNewAlert] = useState<AlertCondition>({
    timeRange: 5,
    threshold: 5,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    enabled: true,
    sound: 'notification_sound.mp3' as const,
  })

  // Sound options
  const soundOptions = [
    { value: 'notification_sound.mp3' as const, label: 'Som de Notificação 1' },
    { value: 'notification_sound2.wav' as const, label: 'Som de Notificação 2' },
    { value: 'google_voice' as const, label: 'Voz do Google' },
  ] as const

  // Sound handling
  const playSound = useCallback(async (sound: AlertCondition['sound']) => {
    try {
      if (sound === 'google_voice') {
        const msg = new SpeechSynthesisUtterance('Atenção! Possível ameaça detectada!')
        msg.lang = 'pt-BR'
        window.speechSynthesis.speak(msg)
      } else if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.src = `/assets/${sound}`
        await audioRef.current.load()
        await audioRef.current.play()
      }
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }, [])

  // Debounced sound playing
  const debouncedPlaySound = useCallback(
    (sound: AlertCondition['sound']) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        playSound(sound)
      }, 2000)
    },
    [playSound],
  )

  // Effects
  useEffect(() => {
    const checkAlertConditions = () => {
      alerts.forEach(alert => {
        if (alert.enabled) {
          const enabledLists = monitoredLists.filter(list => list.enabled)
          const listTypes = enabledLists.map(list => list.type)

          // Check for characters that are relogging
          const { triggered, reloggedChars } = checkAlertCondition(
            characterChanges,
            listTypes,
            alert,
          )

          if (triggered) {
            // Create a descriptive message
            const message =
              `Alerta: ${reloggedChars.length} personagens relogando nos últimos ${alert.timeRange} minutos:\n` +
              reloggedChars
                .map(char => `- ${char.Name} (${char.Kind}) - Online: ${char.TimeOnline}`)
                .join('\n')

            // Log to console for debugging
            console.log(message)

            // Show toast notification
            toast({
              title: 'Alerta de Monitoramento',
              description: message.replace(/\n/g, ' '),
              status: 'warning',
              duration: 5000,
              isClosable: true,
            })

            // Play alert sound
            debouncedPlaySound(alert.sound)
          }
        }
      })
    }

    checkAlertConditions()
    const intervalId = setInterval(checkAlertConditions, 60000)
    return () => clearInterval(intervalId)
  }, [alerts, monitoredLists, debouncedPlaySound, toast])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ''
      }
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = 0.7
      audio.preload = 'auto'
    }
  }, [])

  // Handlers

  const handleSoundChange = (value: AlertCondition['sound']) => {
    setNewAlert({ ...newAlert, sound: value })
    playSound(value)
  }

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault()
    const alert: AlertCondition = {
      ...newAlert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      enabled: true,
    }
    addAlert(alert)
    setIsCreatingAlert(false)
    setNewAlert({
      timeRange: 5,
      threshold: 5,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      enabled: true,
      sound: 'notification_sound.mp3' as const,
    })
    toast({
      title: 'Alerta Criado',
      description: 'Nova condição de alerta foi configurada',
      status: 'success',
      duration: 3000,
    })
  }

  // Component functions
  interface TypeTagProps {
    type: string
    isMonitored: boolean
    isEnabled: boolean
    onToggle: () => void
    onRemove?: () => void
  }

  const TypeTag = ({ type, isMonitored, isEnabled, onToggle, onRemove }: TypeTagProps) => (
    <Tag
      size="md"
      variant={isEnabled ? 'solid' : 'subtle'}
      bg={isEnabled ? typeColors[type.toLowerCase()] : 'transparent'}
      color={isEnabled ? 'gray.900' : 'gray.300'}
      borderRadius="lg"
      cursor="pointer"
      borderWidth="1px"
      borderColor={isEnabled ? typeColors[type.toLowerCase()] : borderColor}
      py={2}
      px={3}
      onClick={() => {
        if (!isMonitored) {
          onToggle()
        }
      }}
    >
      <HStack spacing={2}>
        <Box
          w="3px"
          h="18px"
          bg={typeColors[type.toLowerCase()]}
          borderRadius="full"
          opacity={isEnabled ? 1 : 0.6}
        />
        <Text fontWeight="medium">{type}</Text>
        {isMonitored && (
          <IconButton
            aria-label={isEnabled ? 'Disable' : 'Enable'}
            icon={isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
            size="xs"
            variant="ghost"
            onClick={e => {
              e.stopPropagation()
              onToggle()
            }}
          />
        )}
        {isMonitored && (
          <IconButton
            aria-label="Remove"
            icon={<X size={14} />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={e => {
              e.stopPropagation()
              onRemove?.()
            }}
          />
        )}
      </HStack>
    </Tag>
  )

  const MonitoringWidget = () => (
    <Tooltip label="Abrir configurações de monitoramento" placement="right">
      <HStack onClick={onOpen} cursor="pointer" spacing={3}>
        <Bell size={18} color={activeColor} />
        <Badge colorScheme="blue" variant="solid" borderRadius="md">
          {alerts.filter(a => a.enabled).length} Monitoramento
        </Badge>
      </HStack>
    </Tooltip>
  )

  const AlertCard = ({ alert }: { alert: AlertCondition }) => (
    <Card
      bg={cardBgColor}
      borderRadius="lg"
      borderLeft="3px solid"
      borderLeftColor={alert.enabled ? activeColor : 'transparent'}
    >
      <CardBody>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={3}>
            <HStack>
              <Badge colorScheme={alert.enabled ? 'blue' : 'gray'} borderRadius="md" px={2} py={1}>
                <HStack spacing={2}>
                  <AlertTriangle size={12} />
                  <Text>Limite: {alert.threshold}</Text>
                </HStack>
              </Badge>
            </HStack>
            <HStack spacing={3}>
              <HStack spacing={2}>
                <Clock size={14} />
                <Text fontSize="sm" color="gray.400">
                  {alert.timeRange} minutos
                </Text>
              </HStack>
              <Tooltip label="Testar som">
                <IconButton
                  aria-label="Test sound"
                  icon={<Volume2 size={14} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => playSound(alert.sound)}
                />
              </Tooltip>
            </HStack>
          </VStack>
          <HStack spacing={3}>
            <Switch
              isChecked={alert.enabled}
              onChange={() => toggleAlert(alert.id)}
              colorScheme="blue"
            />
            <IconButton
              aria-label="Delete alert"
              icon={<X size={14} />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => removeAlert(alert.id)}
            />
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  )

  return (
    <>
      <audio ref={audioRef} />
      <MonitoringWidget />

      <Drawer isOpen={isOpen} onClose={onClose} size="md">
        <DrawerOverlay backdropFilter="blur(8px)" />
        <DrawerContent bg={bgColor} backdropFilter="blur(12px)">
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack spacing={3}>
              <Settings size={20} color={activeColor} />
              <Text>Configurações de Monitoramento</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody py={6}>
            <Tabs variant="soft-rounded" colorScheme="blue">
              <TabList mb={4}>
                <Tab>Tipos</Tab>
                <Tab>Alertas</Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={3}>
                        Tipos Monitorados
                      </Text>
                      <Box mb={6}>
                        <HStack spacing={2} flexWrap="wrap" gap={2}>
                          {monitoredLists.map(list => (
                            <TypeTag
                              key={list.id}
                              type={list.type}
                              isMonitored={true}
                              isEnabled={list.enabled}
                              onToggle={() => toggleMonitoredList(list.id)}
                              onRemove={() => removeMonitoredList(list.id)}
                            />
                          ))}
                        </HStack>
                      </Box>

                      <Text fontSize="sm" fontWeight="semibold" mb={3}>
                        Tipos Disponíveis
                      </Text>
                      <HStack spacing={2} flexWrap="wrap" gap={2}>
                        {types.map(type => {
                          const isMonitored = monitoredLists.some(list => list.type === type)
                          if (isMonitored) return null
                          return (
                            <TypeTag
                              key={type}
                              type={type}
                              isMonitored={false}
                              isEnabled={false}
                              onToggle={() => addMonitoredList(type)}
                            />
                          )
                        })}
                      </HStack>
                    </Box>
                  </VStack>
                </TabPanel>

                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Condições de Alerta
                      </Text>
                      <Button
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => setIsCreatingAlert(true)}
                        colorScheme="blue"
                      >
                        Novo Alerta
                      </Button>
                    </HStack>

                    <Collapse in={isCreatingAlert}>
                      <Box mb={4}>
                        <Card bg={cardBgColor} borderRadius="lg" p={4}>
                          <form onSubmit={handleCreateAlert}>
                            <VStack spacing={4}>
                              <FormControl>
                                <FormLabel fontSize="sm">Intervalo de Tempo</FormLabel>
                                <HStack>
                                  <Input
                                    type="number"
                                    value={newAlert.timeRange}
                                    onChange={e =>
                                      setNewAlert({
                                        ...newAlert,
                                        timeRange: Number(e.target.value),
                                      })
                                    }
                                    min={1}
                                    max={60}
                                  />
                                  <Text fontSize="sm" color="gray.400">
                                    minutos
                                  </Text>
                                </HStack>
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="sm">Limite de Personagens</FormLabel>
                                <Input
                                  type="number"
                                  value={newAlert.threshold}
                                  onChange={e =>
                                    setNewAlert({
                                      ...newAlert,
                                      threshold: Number(e.target.value),
                                    })
                                  }
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel fontSize="sm">Som do Alerta</FormLabel>
                                <Select
                                  value={newAlert.sound}
                                  onChange={e =>
                                    handleSoundChange(e.target.value as AlertCondition['sound'])
                                  }
                                >
                                  {soundOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </Select>
                              </FormControl>

                              <HStack spacing={3} width="100%" pt={2}>
                                <Button
                                  type="submit"
                                  colorScheme="blue"
                                  leftIcon={<Plus size={14} />}
                                  flex={1}
                                >
                                  Criar Alerta
                                </Button>
                                <Button variant="ghost" onClick={() => setIsCreatingAlert(false)}>
                                  Cancelar
                                </Button>
                              </HStack>
                            </VStack>
                          </form>
                        </Card>
                      </Box>
                    </Collapse>

                    <VStack spacing={3}>
                      {alerts.map(alert => (
                        <AlertCard key={alert.id} alert={alert} />
                      ))}
                      {alerts.length === 0 && !isCreatingAlert && (
                        <Box
                          p={6}
                          textAlign="center"
                          color="gray.500"
                          bg={cardBgColor}
                          borderRadius="lg"
                        >
                          <VStack spacing={3}>
                            <Bell size={24} />
                            <Text>Nenhum alerta configurado</Text>
                            <Button
                              size="sm"
                              leftIcon={<Plus size={14} />}
                              onClick={() => setIsCreatingAlert(true)}
                              variant="outline"
                            >
                              Criar Primeiro Alerta
                            </Button>
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AlertSettings
