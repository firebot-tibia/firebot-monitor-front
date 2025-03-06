export type WorldStatus = 'WAR' | 'UNDER_ATTACK' | 'DOMINATED'

export interface WorldStatusInfo {
  name: string
  status: WorldStatus
}

export const WORLD_STATUS_PRIORITY: Record<WorldStatus, number> = {
  WAR: 0,
  UNDER_ATTACK: 1,
  DOMINATED: 2,
}

export const WORLD_STATUS_LABELS: Record<WorldStatus, string> = {
  WAR: 'WAR',
  UNDER_ATTACK: 'SOFRENDO ATAQUES',
  DOMINATED: 'DOMINADO',
}

export const WORLD_STATUS_COLORS: Record<WorldStatus, string> = {
  WAR: 'red',
  UNDER_ATTACK: 'orange',
  DOMINATED: 'green',
}
