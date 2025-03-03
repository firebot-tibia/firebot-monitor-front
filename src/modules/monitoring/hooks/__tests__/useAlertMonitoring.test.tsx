import React from 'react'

import { act, renderHook } from '@testing-library/react'

import type { GuildMemberResponse } from '@/core/types/guild-member.response'
import { TestWrapper } from 'tests/utils/test-utils'

import { mockStore, useAlertMonitoringStore } from '../../stores/__mocks__/alert-monitoring-store'
import { useAlertSettingsStore } from '../../stores/__mocks__/alert-settings-store'
import type { AlertCondition } from '../../types/alert.types'
import { useAlertMonitoring } from '../useAlertMonitoring/useAlertMonitoring'

jest.mock('@/middlewares/useLogger', () => ({
  Logger: {
    getInstance: () => ({
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  },
}))

jest.mock('../../../../../stores/storage-store', () => ({
  useStorage: () => ['enemy', jest.fn()],
}))

describe('useAlertMonitoring', () => {
  const mockPlaySound = jest.fn()
  const defaultWrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper playSound={mockPlaySound}>{children}</TestWrapper>
  )

  beforeEach(() => {
    jest.useFakeTimers()
    mockStore.reset()
    mockStore.setMockImplementations()
    useAlertSettingsStore.setState({ alerts: [] })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const createMockCharacter = (
    overrides: Partial<GuildMemberResponse> = {},
  ): GuildMemberResponse => ({
    Name: 'Test Character',
    Level: 100,
    Vocation: 'Knight',
    TimeOnline: '00:00:30',
    OnlineSince: '2024-01-01 00:00:00',
    LastLogin: '2024-01-01 00:00:00',
    OnlineStatus: true,
    Kind: 'enemy',
    Status: 'online',
    Local: 'Thais',
    Login: 'TestLogin',
    ...overrides,
  })

  const createMockAlert = (overrides: Partial<AlertCondition> = {}): AlertCondition => ({
    id: '1',
    sound: 'google_voice_alert',
    enabled: true,
    threshold: 1,
    timeRange: 5,
    createdAt: new Date().toISOString(),
    ...overrides,
  })

  it('should trigger alert when threshold is met', () => {
    const alert = createMockAlert({ threshold: 2, timeRange: 2 })

    useAlertSettingsStore.setState({
      alerts: [alert],
    })

    const { result } = renderHook(() => useAlertMonitoring(), {
      wrapper: defaultWrapper,
    })

    const chars = [
      createMockCharacter({ Name: 'Recent1', TimeOnline: '00:00:30' }),
      createMockCharacter({ Name: 'Recent2', TimeOnline: '00:01:30' }),
    ]

    act(() => {
      result.current.checkAndTriggerAlerts(chars)
    })

    jest.advanceTimersByTime(5000)
    expect(mockPlaySound).toHaveBeenCalledWith('google_voice_alert')
    expect(mockPlaySound).toHaveBeenCalledTimes(1)
  })

  it('should not trigger alert when threshold is not met', () => {
    const alert = createMockAlert({ threshold: 3, timeRange: 2 })

    useAlertSettingsStore.setState({
      alerts: [alert],
    })

    const { result } = renderHook(() => useAlertMonitoring(), {
      wrapper: defaultWrapper,
    })

    const chars = [
      createMockCharacter({ Name: 'Recent1', TimeOnline: '00:00:30' }),
      createMockCharacter({ Name: 'Recent2', TimeOnline: '00:01:30' }),
    ]

    act(() => {
      result.current.checkAndTriggerAlerts(chars)
    })

    jest.advanceTimersByTime(5000)
    expect(mockPlaySound).not.toHaveBeenCalled()
  })

  it('should respect cooldown period between alerts', () => {
    const alert = createMockAlert({ threshold: 2, timeRange: 2 })

    useAlertSettingsStore.setState({
      alerts: [alert],
    })

    const { result } = renderHook(() => useAlertMonitoring(), {
      wrapper: defaultWrapper,
    })

    const chars = [
      createMockCharacter({ Name: 'Recent1', TimeOnline: '00:00:30' }),
      createMockCharacter({ Name: 'Recent2', TimeOnline: '00:01:30' }),
    ]

    // First alert
    act(() => {
      const alertResult = result.current.checkAndTriggerAlerts(chars)
      expect(alertResult.reachedThreshold).toBe(true)
      expect(alertResult.alert).toBe(alert)
    })

    // Try to trigger again immediately (should not work due to cooldown)
    act(() => {
      const alertResult = result.current.checkAndTriggerAlerts(chars)
      expect(alertResult.reachedThreshold).toBe(false)
      expect(alertResult.alert).toBeUndefined()
    })

    // Wait for cooldown and try again
    jest.advanceTimersByTime(30000)
    act(() => {
      const alertResult = result.current.checkAndTriggerAlerts(chars)
      expect(alertResult.reachedThreshold).toBe(true)
      expect(alertResult.alert).toBe(alert)
    })
  })

  it('should filter out characters online for more than 3 minutes', () => {
    // Reset store states
    useAlertSettingsStore.setState({ alerts: [] })
    useAlertMonitoringStore.setState({ alertLogins: new Map(), lastAlertTimes: {} })

    const alert = createMockAlert({ threshold: 1, timeRange: 5 })

    useAlertSettingsStore.setState({
      alerts: [alert],
    })

    const { result } = renderHook(() => useAlertMonitoring(), {
      wrapper: defaultWrapper,
    })

    const chars = [
      createMockCharacter({ Name: 'Recent', TimeOnline: '00:01:30' }),
      createMockCharacter({ Name: 'Old', TimeOnline: '00:05:00' }),
    ]

    act(() => {
      result.current.checkAndTriggerAlerts(chars)
    })

    const logins = result.current.getRecentLogins()
    expect(logins).toHaveLength(0) // No characters should be included as they're all over 1 minute
  })

  it('should handle multiple alerts with different thresholds', () => {
    // Reset store states
    useAlertSettingsStore.setState({ alerts: [] })
    useAlertMonitoringStore.setState({ alertLogins: new Map(), lastAlertTimes: {} })

    const alert1 = createMockAlert({ id: 'alert1', threshold: 1, sound: 'google_voice_alert' })
    const alert2 = createMockAlert({ id: 'alert2', threshold: 2, sound: 'google_voice_warning' })

    useAlertSettingsStore.setState({
      alerts: [alert1, alert2],
    })

    const { result } = renderHook(() => useAlertMonitoring(), {
      wrapper: defaultWrapper,
    })

    const chars = [
      createMockCharacter({ Name: 'Recent1', TimeOnline: '00:00:30' }),
      createMockCharacter({ Name: 'Recent2', TimeOnline: '00:00:45' }),
    ]

    act(() => {
      result.current.checkAndTriggerAlerts(chars)
    })

    const logins = result.current.getRecentLogins()
    expect(logins).toHaveLength(2)
    expect(logins.map(l => l.character.Name).sort()).toEqual(['Recent1', 'Recent2'])

    // Verify alert logins were set correctly
    expect(mockStore.setAlertLogins).toHaveBeenCalledWith(
      'alert1',
      expect.arrayContaining([
        expect.objectContaining({ character: expect.objectContaining({ Name: 'Recent1' }) }),
        expect.objectContaining({ character: expect.objectContaining({ Name: 'Recent2' }) }),
      ]),
    )
    expect(mockStore.setAlertLogins).toHaveBeenCalledWith(
      'alert2',
      expect.arrayContaining([
        expect.objectContaining({ character: expect.objectContaining({ Name: 'Recent1' }) }),
        expect.objectContaining({ character: expect.objectContaining({ Name: 'Recent2' }) }),
      ]),
    )
  })

  it('should clear alert logins after time range expires', () => {
    // Reset store states
    useAlertSettingsStore.setState({ alerts: [] })
    useAlertMonitoringStore.setState({ alertLogins: new Map(), lastAlertTimes: {} })

    const alert = createMockAlert({ threshold: 1, timeRange: 2 })

    useAlertSettingsStore.setState({
      alerts: [alert],
    })

    const { result } = renderHook(() => useAlertMonitoring(), {
      wrapper: defaultWrapper,
    })

    const chars = [createMockCharacter({ Name: 'Recent1', TimeOnline: '00:00:30' })]

    act(() => {
      result.current.checkAndTriggerAlerts(chars)
    })

    const logins = result.current.getRecentLogins()
    expect(logins).toHaveLength(1)
    expect(logins[0].character.Name).toBe('Recent1')

    // Advance time past the time range
    jest.advanceTimersByTime(3 * 60 * 1000) // 3 minutes

    // Update chars with new time online
    const updatedChars = [createMockCharacter({ Name: 'Recent1', TimeOnline: '00:03:30' })]

    act(() => {
      result.current.checkAndTriggerAlerts(updatedChars)
    })

    // Verify that clearAlertLogins was called
    expect(mockStore.clearAlertLogins).toHaveBeenCalledWith(alert.id.toString())

    const loginsAfterExpiry = result.current.getRecentLogins()
    expect(loginsAfterExpiry).toHaveLength(0)
  })
})
