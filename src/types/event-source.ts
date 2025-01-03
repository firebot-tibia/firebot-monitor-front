export type EventSourceStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

export interface EventSourceState {
  status: EventSourceStatus
  error: Error | null
  data: any
  lastUpdated: number
}
