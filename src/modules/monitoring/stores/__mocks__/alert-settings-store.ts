import type { StoreApi } from 'zustand'

import type { AlertCondition } from '../../types/alert.types'
import type { AlertSettingsState } from '../types'

const mockState: AlertSettingsState = {
  alerts: [],
  isWidgetCollapsed: false,
  addAlert: jest.fn(),
  removeAlert: jest.fn(),
  toggleAlert: jest.fn(),
  updateAlert: jest.fn(),
  toggleWidget: jest.fn(),
}

const mockAddAlert = jest.fn<void, [Omit<AlertCondition, 'id' | 'createdAt'>]>()
const mockRemoveAlert = jest.fn<void, [string]>()
const mockToggleAlert = jest.fn<void, [string]>()
const mockUpdateAlert = jest.fn<void, [string, keyof AlertCondition, any]>()
const mockToggleWidget = jest.fn<void, []>()

const createState = () => ({
  ...mockState,
  addAlert: mockAddAlert,
  removeAlert: mockRemoveAlert,
  toggleAlert: mockToggleAlert,
  updateAlert: mockUpdateAlert,
  toggleWidget: mockToggleWidget,
})

const store = jest.fn(createState) as unknown as jest.Mock<AlertSettingsState> &
  StoreApi<AlertSettingsState>

store.setState = jest.fn(
  (
    stateOrUpdater:
      | AlertSettingsState
      | Partial<AlertSettingsState>
      | ((state: AlertSettingsState) => AlertSettingsState | Partial<AlertSettingsState>),
    replace?: boolean,
  ) => {
    const currentState = createState()
    const newState =
      typeof stateOrUpdater === 'function' ? stateOrUpdater(currentState) : stateOrUpdater

    if (replace) {
      Object.assign(mockState, newState)
    } else {
      Object.assign(mockState, {
        ...currentState,
        ...newState,
      })
    }

    store.mockImplementation(createState)
  },
)

store.getState = jest.fn(createState)

export const useAlertSettingsStore = store

export const mockStore = {
  state: mockState,
  addAlert: mockAddAlert,
  removeAlert: mockRemoveAlert,
  toggleAlert: mockToggleAlert,
  updateAlert: mockUpdateAlert,
  toggleWidget: mockToggleWidget,
  reset: () => {
    mockState.alerts = []
    mockState.isWidgetCollapsed = false
    mockAddAlert.mockClear()
    mockRemoveAlert.mockClear()
    mockToggleAlert.mockClear()
    mockUpdateAlert.mockClear()
    mockToggleWidget.mockClear()
    store.mockImplementation(createState)
  },
}
