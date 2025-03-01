/**
 * Available log levels for the logger
 */
export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'api' | 'route'

/**
 * Formatted error object for logging
 */
export interface LogError {
  message: string
  stack?: string
  code: string
  [key: string]: any
}

/**
 * Log entry structure for history tracking
 */
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  requestId: string
  data?: any
  duration?: number
}

/**
 * Configuration options for the logger
 */
export interface LoggerConfig {
  maxHistorySize?: number
  enabled?: boolean
  requestId?: string
}

/**
 * Core logger interface
 */
export interface ILogger {
  logApi(method: string, path: string, data?: any, startTime?: number): void
  logRoute(method: string, path: string, data?: any, startTime?: number): void
  info(message: string, data?: any, startTime?: number): void
  error(message: string, error?: unknown, startTime?: number): void
  warn(message: string, data?: any, startTime?: number): void
  debug(message: string, data?: any, startTime?: number): void
  getLogHistory(): LogEntry[]
  clearHistory(): void
}

/**
 * Hook return type with all logging functions
 */
export interface UseLoggerReturn extends ILogger {
  logger: ILogger
  isEnabled: boolean
  requestId: string
}
