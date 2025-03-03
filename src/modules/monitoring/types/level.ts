export interface Level {
  player: string
  old_level: number
  new_level: number
  direction?: 'up' | 'down'
  timestamp?: string
  world: string
  isAlly: boolean
}

export interface LevelEvent {
  level: Level
}
