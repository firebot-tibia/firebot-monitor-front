export type AlertCondition = {
  id: string
  timeRange: number
  threshold: number
  enabled: boolean
  createdAt: string
  sound:
    | 'notification_sound.mp3'
    | 'notification_sound2.wav'
    | 'google_voice_alert'
    | 'google_voice_warning'
    | 'google_voice_enemy'
  useVoice?: boolean
  lastTriggered?: string
}
