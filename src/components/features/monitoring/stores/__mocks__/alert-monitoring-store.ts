import type { StoreApi } from 'zustand'

import type { GuildMemberResponse } from '@/types/guild-member.response'

import type { AlertMonitoringState, StoredLogin } from '../types'

type InputLogin = {
  character: GuildMemberResponse
  timestamp: Date
}

const mockState: AlertMonitoringState = {
  alertLogins: new Map<string, StoredLogin[]>(),
  lastAlertTimes: {} as Record<string, number>,
  setAlertLogins: jest.fn(),
  setLastAlertTime: jest.fn(),
  clearAlertLogins: jest.fn(),
}

const mockSetAlertLogins = jest.fn<void, [string, InputLogin[]]>()
const mockSetLastAlertTime = jest.fn<void, [string, number]>()
const mockClearAlertLogins = jest.fn<void, [string]>()

// Create mock implementation
const createState = () => ({
  alertLogins: mockState.alertLogins,
  lastAlertTimes: mockState.lastAlertTimes,
  setAlertLogins: mockSetAlertLogins,
  setLastAlertTime: mockSetLastAlertTime,
  clearAlertLogins: mockClearAlertLogins,
})

// Create store mock with proper type
const store = jest.fn(createState) as unknown as jest.Mock<AlertMonitoringState> &
  StoreApi<AlertMonitoringState>

// Add setState
store.setState = jest.fn(
  (
    stateOrUpdater:
      | AlertMonitoringState
      | Partial<AlertMonitoringState>
      | ((state: AlertMonitoringState) => AlertMonitoringState | Partial<AlertMonitoringState>),
    replace?: boolean,
  ) => {
    const currentState = createState()
    const newState =
      typeof stateOrUpdater === 'function' ? stateOrUpdater(currentState) : stateOrUpdater

    if (replace) {
      if (newState.alertLogins) {
        mockState.alertLogins = new Map()
        Array.from(newState.alertLogins.entries()).forEach(([key, value]) => {
          mockState.alertLogins.set(key, [...value])
        })
      }
      if (newState.lastAlertTimes) {
        mockState.lastAlertTimes = { ...newState.lastAlertTimes }
      }
    } else {
      if (newState.alertLogins) {
        Array.from(newState.alertLogins.entries()).forEach(([key, value]) => {
          mockState.alertLogins.set(key, [...value])
        })
      }
      if (newState.lastAlertTimes) {
        mockState.lastAlertTimes = { ...currentState.lastAlertTimes, ...newState.lastAlertTimes }
      }
    }

    store.mockImplementation(createState)
  },
)

// Add getState
store.getState = jest.fn(createState)

export const useAlertMonitoringStore = store

export const mockStore = {
  state: mockState,
  setAlertLogins: mockSetAlertLogins,
  setLastAlertTime: mockSetLastAlertTime,
  clearAlertLogins: mockClearAlertLogins,
  reset: () => {
    mockState.alertLogins.clear()
    Object.keys(mockState.lastAlertTimes).forEach(key => delete mockState.lastAlertTimes[key])
    mockSetAlertLogins.mockClear()
    mockSetLastAlertTime.mockClear()
    mockClearAlertLogins.mockClear()
    store.mockImplementation(createState)
  },
  setMockImplementations: () => {
    mockSetAlertLogins.mockImplementation((alertId, logins) => {
      const storedLogins: StoredLogin[] = logins.map(login => ({
        character: login.character,
        timestamp: login.timestamp.toISOString(),
      }))
      mockState.alertLogins.set(alertId, storedLogins)
      store.mockImplementation(createState)
    })

    mockSetLastAlertTime.mockImplementation((alertId, time) => {
      mockState.lastAlertTimes[alertId] = time
      store.mockImplementation(createState)
    })

    mockClearAlertLogins.mockImplementation(alertId => {
      mockState.alertLogins.delete(alertId)
      delete mockState.lastAlertTimes[alertId]
      store.mockImplementation(createState)
    })
  },
}
