import type { GuildMemberResponse } from '@/common/types/guild-member.response'

import type { AlertCondition } from '../types/alert.types'

export interface AlertSettingsState {
  alerts: AlertCondition[]
  isWidgetCollapsed: boolean
  addAlert: (alert: Omit<AlertCondition, 'id' | 'createdAt'>) => void
  removeAlert: (id: string) => void
  toggleAlert: (id: string) => void
  updateAlert: (id: string, field: keyof AlertCondition, value: any) => void
  toggleWidget: () => void
}

export interface AlertMonitoringState {
  alertLogins: Map<
    string,
    Array<{
      character: GuildMemberResponse
      timestamp: string
    }>
  >
  lastAlertTimes: Record<string, number>
  setAlertLogins: (
    alertId: string,
    logins: Array<{ character: GuildMemberResponse; timestamp: Date }>,
  ) => void
  setLastAlertTime: (alertId: string, time: number) => void
  clearAlertLogins: (alertId: string) => void
}

export type StoredLogin = {
  character: GuildMemberResponse
  timestamp: string
}
