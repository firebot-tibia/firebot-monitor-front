import { act } from '@testing-library/react'

import type { GuildMemberResponse } from '@/types/guild-member.response'

import { useAlertMonitoringStore } from '../alert-monitoring-store'

describe('alert-monitoring-store', () => {
  beforeEach(() => {
    // Clear the store state
    act(() => {
      useAlertMonitoringStore.setState({
        alertLogins: new Map(),
        lastAlertTimes: {},
      })
    })
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

  it('should set alert logins', () => {
    const character = createMockCharacter()
    const timestamp = new Date()

    act(() => {
      useAlertMonitoringStore.getState().setAlertLogins('1', [
        {
          character,
          timestamp,
        },
      ])
    })

    const store = useAlertMonitoringStore.getState()
    const logins = store.alertLogins.get('1')
    expect(logins).toBeDefined()
    expect(logins).toHaveLength(1)
    expect(logins![0].character).toEqual(character)
    expect(logins![0].timestamp).toBe(timestamp.toISOString())
  })

  it('should set last alert time', () => {
    const time = Date.now()

    act(() => {
      useAlertMonitoringStore.getState().setLastAlertTime('1', time)
    })

    const store = useAlertMonitoringStore.getState()
    expect(store.lastAlertTimes['1']).toBe(time)
  })

  it('should clear alert logins', () => {
    const character = createMockCharacter()
    const timestamp = new Date()
    const time = Date.now()

    act(() => {
      const store = useAlertMonitoringStore.getState()
      store.setAlertLogins('1', [{ character, timestamp }])
      store.setLastAlertTime('1', time)
    })

    act(() => {
      useAlertMonitoringStore.getState().clearAlertLogins('1')
    })

    const store = useAlertMonitoringStore.getState()
    expect(store.alertLogins.get('1')).toBeUndefined()
    expect(store.lastAlertTimes['1']).toBeUndefined()
  })

  it('should handle multiple alerts with different logins', () => {
    const alertId1 = 'test-alert-1'
    const alertId2 = 'test-alert-2'
    const mockCharacter1 = createMockCharacter({ Name: 'Char1' })
    const mockCharacter2 = createMockCharacter({ Name: 'Char2' })
    const timestamp = new Date()

    act(() => {
      useAlertMonitoringStore.getState().setAlertLogins(alertId1, [
        {
          character: mockCharacter1,
          timestamp,
        },
      ])
      useAlertMonitoringStore.getState().setAlertLogins(alertId2, [
        {
          character: mockCharacter2,
          timestamp,
        },
      ])
    })

    const logins1 = useAlertMonitoringStore.getState().alertLogins.get(alertId1)
    const logins2 = useAlertMonitoringStore.getState().alertLogins.get(alertId2)

    expect(logins1).toBeDefined()
    expect(logins2).toBeDefined()
    expect(logins1![0].character.Name).toBe('Char1')
    expect(logins2![0].character.Name).toBe('Char2')
  })

  it('should persist data between renders', () => {
    const alertId = 'test-alert-1'
    const mockCharacter = createMockCharacter()
    const timestamp = new Date()
    const time = Date.now()

    act(() => {
      useAlertMonitoringStore.getState().setAlertLogins(alertId, [
        {
          character: mockCharacter,
          timestamp,
        },
      ])
      useAlertMonitoringStore.getState().setLastAlertTime(alertId, time)
    })

    const store = useAlertMonitoringStore.getState()
    expect(store.alertLogins.get(alertId)![0].character).toEqual(mockCharacter)
    expect(store.lastAlertTimes[alertId]).toBe(time)
  })

  it('should handle empty alert logins', () => {
    const alertId = 'test-alert-1'

    act(() => {
      useAlertMonitoringStore.getState().setAlertLogins(alertId, [])
    })

    const storedLogins = useAlertMonitoringStore.getState().alertLogins.get(alertId)
    expect(storedLogins).toBeDefined()
    expect(storedLogins).toHaveLength(0)
  })
})
