export type AlertCondition = {
  id: string
  timeRange: number
  threshold: number
  enabled: boolean
  createdAt: string
  sound: 'notification_sound.mp3' | 'notification_sound2.wav' | 'google_voice'
  useVoice?: boolean
}

export type ListChange = {
  type: string
  change: number
  timestamp: string
}

export type AlertCheck = {
  changes: ListChange[]
  totalChange: number
  threshold: number
  timeRange: number
}

export type MonitoredList = {
  id: string
  type: string
  enabled: boolean
  createdAt: string
}
