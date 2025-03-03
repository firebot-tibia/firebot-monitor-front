import { act, renderHook } from '@testing-library/react'

import type { AlertCondition } from '../../../types/alert'
import { useAlertSettingsStore } from '../alert-settings-store'

describe('alert-settings-store', () => {
  beforeEach(() => {
    useAlertSettingsStore.setState({ alerts: [], isWidgetCollapsed: true })
    jest.clearAllMocks()
  })

  const createMockAlert = (
    overrides: Partial<AlertCondition> = {},
  ): Omit<AlertCondition, 'id' | 'createdAt'> => ({
    enabled: true,
    timeRange: 5,
    threshold: 2,
    sound: 'notification_sound.mp3',
    ...overrides,
  })

  it('should add a new alert', () => {
    const { result } = renderHook(() => useAlertSettingsStore())

    act(() => {
      result.current.addAlert(createMockAlert())
    })

    expect(result.current.alerts).toHaveLength(1)
    expect(result.current.alerts[0]).toMatchObject(createMockAlert())
    expect(result.current.alerts[0].id).toBeDefined()
    expect(result.current.alerts[0].createdAt).toBeDefined()
  })

  it('should remove an alert', () => {
    const { result } = renderHook(() => useAlertSettingsStore())

    act(() => {
      result.current.addAlert(createMockAlert())
    })

    const alertId = result.current.alerts[0].id

    act(() => {
      result.current.removeAlert(alertId)
    })

    expect(result.current.alerts).toHaveLength(0)
  })

  it('should toggle alert enabled state', () => {
    const { result } = renderHook(() => useAlertSettingsStore())

    act(() => {
      result.current.addAlert(createMockAlert())
    })

    const alertId = result.current.alerts[0].id

    act(() => {
      result.current.toggleAlert(alertId)
    })

    expect(result.current.alerts[0].enabled).toBe(false)
  })

  it('should update alert fields', () => {
    const { result } = renderHook(() => useAlertSettingsStore())

    act(() => {
      result.current.addAlert(createMockAlert())
    })

    const alertId = result.current.alerts[0].id

    act(() => {
      result.current.updateAlert(alertId, 'timeRange', 10)
      result.current.updateAlert(alertId, 'threshold', 3)
      result.current.updateAlert(alertId, 'sound', 'google_voice_alert')
    })

    expect(result.current.alerts[0].timeRange).toBe(10)
    expect(result.current.alerts[0].threshold).toBe(3)
    expect(result.current.alerts[0].sound).toBe('google_voice_alert')
  })

  it('should validate number inputs', () => {
    const { result } = renderHook(() => useAlertSettingsStore())

    act(() => {
      result.current.addAlert(createMockAlert())
    })

    const alertId = result.current.alerts[0].id

    act(() => {
      result.current.updateAlert(alertId, 'timeRange', '0')
    })
    expect(result.current.alerts[0].timeRange).toBe(5)

    act(() => {
      result.current.updateAlert(alertId, 'threshold', '-1')
    })
    expect(result.current.alerts[0].threshold).toBe(2)

    act(() => {
      result.current.updateAlert(alertId, 'timeRange', '10')
      result.current.updateAlert(alertId, 'threshold', '3')
    })
    expect(result.current.alerts[0].timeRange).toBe(10)
    expect(result.current.alerts[0].threshold).toBe(3)
  })

  it('should toggle widget collapse state', () => {
    const { result } = renderHook(() => useAlertSettingsStore())

    expect(result.current.isWidgetCollapsed).toBe(true)

    act(() => {
      result.current.toggleWidget()
    })

    expect(result.current.isWidgetCollapsed).toBe(false)
  })
})
