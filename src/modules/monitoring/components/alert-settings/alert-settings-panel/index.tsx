import { useCallback, useMemo, memo } from 'react'

import {
  Box,
  Button,
  Card,
  CardBody,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Switch,
  Tag,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Bell, Clock, Plus, Trash2, Volume2 } from 'lucide-react'

import { useCharacterTracker } from '../../../hooks/useCharacterTracker'
import { useAlertSettingsStore } from '../../../stores/alert-settings-store'
import { useMonitoringSettingsStore } from '../../../stores/monitoring-settings-store'
import { useSoundStore } from '../../../stores/sounds-permission-store'
import type { AlertCondition } from '../../../types/alert.types'
import { SoundPermission } from '../sound-permission'

interface SoundOption {
  value: AlertCondition['sound']
  label: string
}

interface AlertSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  alerts: AlertCondition[]
  onAddAlert: () => void
  onRemoveAlert: (alertId: string) => void
  onToggleAlert: (alertId: string) => void
  soundOptions: SoundOption[]
  onTestSound: (sound: AlertCondition['sound']) => void
}

// Memoized alert card component to prevent unnecessary re-renders
const AlertCard = memo(function AlertCard({
  alert,
  onToggleAlert,
  onRemoveAlert,
  onUpdateAlert,
  onTestSound,
  soundOptions,
  isEnabled,
  bgColor,
  borderColor,
}: {
  alert: AlertCondition
  onToggleAlert: (id: string) => void
  onRemoveAlert: (id: string) => void
  onUpdateAlert: (id: string, field: keyof AlertCondition, value: any) => void
  onTestSound: (sound: AlertCondition['sound']) => void
  soundOptions: SoundOption[]
  isEnabled: boolean
  bgColor: string
  borderColor: string
}) {
  const handleTimeRangeChange = useCallback(
    (value: string) => {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue) && numValue > 0) {
        onUpdateAlert(alert.id, 'timeRange', numValue)
      }
    },
    [alert.id, onUpdateAlert]
  )

  const handleThresholdChange = useCallback(
    (value: string) => {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue) && numValue > 0) {
        onUpdateAlert(alert.id, 'threshold', numValue)
      }
    },
    [alert.id, onUpdateAlert]
  )

  const handleSoundChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdateAlert(alert.id, 'sound', e.target.value)
      onTestSound(e.target.value as any)
    },
    [alert.id, onUpdateAlert, onTestSound]
  )

  return (
    <Card
      bg={bgColor}
      borderColor={alert.enabled ? 'blue.400' : borderColor}
      borderWidth={1}
      size="sm"
      _hover={{
        bg: 'rgba(255, 255, 255, 0.05)',
      }}
      transition="all 0.2s"
    >
      <CardBody py={3} px={4}>
        <HStack justify="space-between" align="center" spacing={4}>
          <HStack spacing={4} flexWrap="wrap">
            {/* Time Range */}
            <HStack spacing={1}>
              <Tooltip label="Intervalo de tempo (minutos)">
                <span>
                  <Clock size={14} color="#94A3B8" />
                </span>
              </Tooltip>
              <NumberInput
                size="xs"
                value={alert.timeRange}
                onChange={handleTimeRangeChange}
                min={1}
                max={60}
                maxW={20}
              >
                <NumberInputField
                  bg="rgba(255, 255, 255, 0.06)"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    borderColor: "whiteAlpha.300",
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="gray.400">min</Text>
            </HStack>

            {/* Threshold */}
            <HStack spacing={1}>
              <Tooltip label="Limite de personagens">
                <span>
                  <Bell size={14} color="#94A3B8" />
                </span>
              </Tooltip>
              <NumberInput
                size="xs"
                value={alert.threshold}
                onChange={handleThresholdChange}
                min={1}
                max={20}
                maxW={16}
              >
                <NumberInputField
                  bg="rgba(255, 255, 255, 0.06)"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    borderColor: "whiteAlpha.300",
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>

            {/* Sound */}
            <HStack spacing={1}>
              <Tooltip label="Som do alerta">
                <span>
                  <Volume2 size={14} color="#94A3B8" />
                </span>
              </Tooltip>
              <Select
                size="xs"
                width="160px"
                bg="rgba(255, 255, 255, 0.06)"
                borderColor="whiteAlpha.200"
                _hover={{
                  borderColor: "whiteAlpha.300",
                }}
                value={alert.sound}
                onChange={handleSoundChange}
              >
                {soundOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </HStack>
          </HStack>

          <HStack spacing={2}>
            <Switch
              size="sm"
              isChecked={alert.enabled}
              onChange={() => onToggleAlert(alert.id)}
              colorScheme="blue"
            />
            <IconButton
              aria-label="Remover alerta"
              icon={<Trash2 size={14} />}
              onClick={() => onRemoveAlert(alert.id)}
              size="xs"
              variant="ghost"
              colorScheme="red"
            />
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  )
})

// Memoized settings panel to improve performance
export const AlertSettingsPanel = memo(function AlertSettingsPanel({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onToggleAlert,
  soundOptions,
  onTestSound,
}: AlertSettingsPanelProps) {
  const { updateAlert } = useAlertSettingsStore()
  const { hasPermission } = useSoundStore()
  const { timeThreshold, memberThreshold, updateSettings } = useMonitoringSettingsStore()
  const { activeCharacterCount } = useCharacterTracker(timeThreshold, memberThreshold)

  // Memoize colors to avoid recalculations
  const bgColor = useColorModeValue('rgba(17, 19, 23, 0.98)', 'rgba(17, 19, 23, 0.98)')
  const cardBgColor = useColorModeValue('rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.03)')
  const borderColor = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100')

  // Memoize array of enabled alerts for stable rendering
  const enabledAlerts = useMemo(() =>
    alerts.filter(a => a.enabled).length,
    [alerts]
  )

  const handleTimeThresholdChange = useCallback(
    (value: number) => {
      updateSettings({ timeThreshold: value })
    },
    [updateSettings]
  )

  const handleMemberThresholdChange = useCallback(
    (value: number) => {
      updateSettings({ memberThreshold: value })
    },
    [updateSettings]
  )

  const handleUpdateAlert = useCallback(
    (alertId: string, field: keyof AlertCondition, value: any) => {
      updateAlert(alertId, field, value)
    },
    [updateAlert]
  )

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
      blockScrollOnMount={false}
    >
      <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <DrawerContent
        bg={bgColor}
        boxShadow="dark-lg"
      >
        <DrawerCloseButton color="whiteAlpha.700" />
        <DrawerHeader
          borderBottomWidth={1}
          borderBottomColor={borderColor}
        >
          Condições de Alerta
          {enabledAlerts > 0 && (
            <Tag
              size="sm"
              colorScheme="blue"
              ml={2}
              borderRadius="full"
            >
              {enabledAlerts} ativo{enabledAlerts > 1 ? 's' : ''}
            </Tag>
          )}
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} align="stretch">
            {!hasPermission && (
              <Card bg={cardBgColor} borderColor={borderColor} borderWidth={1}>
                <CardBody>
                  <SoundPermission onPermissionGranted={() => {}} />
                </CardBody>
              </Card>
            )}

            {/* Alert Conditions */}
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium" fontSize="sm">
                  Condições de Alerta
                </Text>

                <Tooltip label="Adicionar novo alerta">
                  <IconButton
                    aria-label="Adicionar alerta"
                    icon={<Plus size={16} />}
                    onClick={onAddAlert}
                    size="xs"
                    colorScheme="blue"
                  />
                </Tooltip>
              </Flex>
            </VStack>

            {/* Alert List */}
            <VStack spacing={2} align="stretch">
              {alerts.length === 0 ? (
                <Box
                  p={4}
                  borderRadius="md"
                  bg={cardBgColor}
                  borderColor={borderColor}
                  borderWidth={1}
                  textAlign="center"
                >
                  <Text fontSize="sm" color="gray.400">
                    Nenhum alerta configurado. Clique no botão &quot;+&quot; para adicionar.
                  </Text>
                </Box>
              ) : (
                alerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onToggleAlert={onToggleAlert}
                    onRemoveAlert={onRemoveAlert}
                    onUpdateAlert={handleUpdateAlert}
                    onTestSound={onTestSound}
                    soundOptions={soundOptions}
                    isEnabled={alert.enabled}
                    bgColor={cardBgColor}
                    borderColor={borderColor}
                  />
                ))
              )}
            </VStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
})
