export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'api' | 'route'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  requestId: string
  data?: any
  duration?: number
  path?: string
  method?: string
}

export interface LogError {
  message: string
  stack?: string
  status?: number
  code?: string
}
