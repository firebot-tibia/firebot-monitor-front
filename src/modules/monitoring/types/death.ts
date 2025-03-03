export interface Death {
  name: string
  killer: string | null
  date: string
  text: string
  level: number
  vocation: string
  city: string
  world: string
  isAlly: boolean
}

export interface DeathEvent {
  death: Death
}
