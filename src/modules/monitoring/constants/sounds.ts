import type { AlertCondition } from '../types/alert.types'

export const soundOptions: Array<{ value: AlertCondition['sound']; label: string }> = [
  { value: 'notification_sound.mp3', label: 'Som de Notificação 1' },
  { value: 'notification_sound2.wav', label: 'Som de Notificação 2' },
  { value: 'google_voice_alert', label: 'Voz: Alerta Padrão' },
  { value: 'google_voice_warning', label: 'Voz: Aviso de Atividade' },
  { value: 'google_voice_enemy', label: 'Voz: Alerta de Inimigo' },
]
