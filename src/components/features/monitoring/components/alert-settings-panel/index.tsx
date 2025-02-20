import { useState, useCallback } from 'react'

import {
  Badge,
  Card,
  CardBody,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  NumberInput,
  NumberInputField,
  Select,
  Switch,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { Bell, Clock, Plus, Trash2, Volume2 } from 'lucide-react'

import { useCharacterTracker } from '../../../guilds-monitoring/hooks/useCharacterTracker'
import { useAlertSettingsStore } from '../../stores/alert-settings-store'
import { useMonitoringSettingsStore } from '../../stores/monitoring-settings-store'
import { useSoundStore } from '../../stores/sounds-permission-store'
import type { AlertCondition } from '../../types/alert.types'
import InputField from '../input-settings'
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
  onToggleAlert: (alertId: string, enabled: boolean) => void
  soundOptions: SoundOption[]
  onTestSound: (sound: AlertCondition['sound']) => void
}

export const AlertSettingsPanel = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onToggleAlert,
  soundOptions,
  onTestSound,
}: AlertSettingsPanelProps) => {
  const { updateAlert } = useAlertSettingsStore()
  const { hasPermission } = useSoundStore()
  const { timeThreshold, memberThreshold, updateSettings } = useMonitoringSettingsStore()

  const { activeCharacterCount } = useCharacterTracker(timeThreshold, memberThreshold)

  const handleTimeThresholdChange = useCallback((value: number) => {
    updateSettings({ timeThreshold: value })
  }, [updateSettings])

  const handleMemberThresholdChange = useCallback((value: number) => {
    updateSettings({ memberThreshold: value })
  }, [updateSettings])

  const handleUpdateAlert = useCallback(
    (alertId: string, field: keyof AlertCondition, value: any) => {
      updateAlert(alertId, field, value)
    },
    [updateAlert],
  )

  const handleTestSound = useCallback(
    (sound: AlertCondition['sound']) => {
      if (!hasPermission) return
      onTestSound(sound)
    },
    [hasPermission, onTestSound],
  )

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent bg="rgba(17, 19, 23, 0.98)">
        <DrawerCloseButton color="whiteAlpha.700" />
        <DrawerHeader borderBottomWidth={1} borderBottomColor="whiteAlpha.100">
          Condições de Alerta
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} align="stretch">
            {!hasPermission && (
              <Card bg="rgba(255, 255, 255, 0.03)" borderColor="whiteAlpha.100" borderWidth={1}>
                <CardBody>
                  <SoundPermission onPermissionGranted={() => {}} />
                </CardBody>
              </Card>
            )}

            <VStack spacing={4} align="stretch">


              <HStack justify="space-between" align="center">
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
              </HStack>
            </VStack>

            <VStack spacing={2} align="stretch">
              {alerts.map(alert => (
                <Card
                  key={alert.id}
                  bg="rgba(255, 255, 255, 0.03)"
                  borderColor={alert.enabled ? 'blue.400' : 'whiteAlpha.100'}
                  borderWidth={1}
                  size="sm"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <CardBody py={3} px={4}>
                    <HStack justify="space-between" align="center" spacing={4}>
                      <HStack spacing={4}>
                        {/* Time Range */}
                        <HStack spacing={1}>
                          <Tooltip label="Intervalo de tempo">
                            <span>
                              <Clock size={14} color="#94A3B8" />
                            </span>
                          </Tooltip>
                          <InputField
                            value={alert.timeRange}
                            onChange={value => handleUpdateAlert(alert.id, 'timeRange', value)}
                            width="45px"
                            suffix="min"
                          />
                        </HStack>

                        {/* Threshold */}
                        <HStack spacing={1}>
                          <Tooltip label="Limite de personagens">
                            <span>
                              <Bell size={14} color="#94A3B8" />
                            </span>
                          </Tooltip>
                          <InputField
                            value={alert.threshold}
                            onChange={value => handleUpdateAlert(alert.id, 'threshold', value)}
                            width="35px"
                          />
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
                            width="130px"
                            bg="rgba(255, 255, 255, 0.06)"
                            borderColor="whiteAlpha.200"
                            _hover={{
                              borderColor: 'whiteAlpha.300',
                            }}
                            value={alert.sound}
                            onChange={e => {
                              handleUpdateAlert(alert.id, 'sound', e.target.value)
                              handleTestSound(e.target.value as any)
                            }}
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
                          onChange={() => onToggleAlert(alert.id, alert.enabled)}
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
              ))}
            </VStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
