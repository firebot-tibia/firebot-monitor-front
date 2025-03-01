import chalk from 'chalk'
import type { ChalkInstance } from 'chalk'

import type { LogEntry, LogError, LogLevel, LoggerConfig, ILogger } from './types'

/**
 * Core Logger Service with improved flexibility and configuration
 */
export class LoggerService implements ILogger {
  private static instance: LoggerService
  private requestId: string
  private logHistory: LogEntry[] = []
  private maxHistorySize: number
  private readonly isProduction = process.env.NODE_ENV === 'production'
  private isEnabled: boolean

  private constructor(config: LoggerConfig = {}) {
    this.maxHistorySize = config.maxHistorySize || 1000
    this.isEnabled = config.enabled ?? !this.isProduction
    this.requestId = config.requestId || this.generateRequestId()
  }

  /**
   * Get the singleton instance of the logger
   */
  static getInstance(config?: LoggerConfig): LoggerService {
    if (!this.instance) {
      this.instance = new LoggerService(config)
    } else if (config) {
      // Update existing instance with new config
      this.instance.updateConfig(config)
    }
    return this.instance
  }

  /**
   * Update logger configuration
   */
  private updateConfig(config: LoggerConfig): void {
    if (config.maxHistorySize) {
      this.maxHistorySize = config.maxHistorySize
    }
    if (config.requestId) {
      this.requestId = config.requestId
    }
    if (config.enabled !== undefined) {
      this.isEnabled = config.enabled
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = new LoggerService()
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    if (!this.isEnabled) return ''
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  /**
   * Get the current timestamp in ISO format
   */
  private getTimestamp(): string {
    return new Date().toISOString()
  }

  /**
   * Calculate duration in milliseconds
   */
  private getDuration(startTime: number): number {
    return Date.now() - startTime
  }

  /**
   * Format error objects for consistent logging
   */
  private formatError(error: unknown): LogError {
    if (!this.isEnabled) return { message: '', code: 'DISABLED' }

    if (error instanceof Error) {
      return {
        message: error.message,
        stack: this.isEnabled ? error.stack : undefined,
        code: 'ERROR',
      }
    }

    if (typeof error === 'string') {
      return {
        message: error,
        code: 'STRING_ERROR',
      }
    }

    return {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      ...(error as object),
    }
  }

  /**
   * Core logging function that handles all log levels
   */
  private log(level: LogLevel, message: string, data?: any, startTime?: number): void {
    // Always log in development, respect isEnabled in production
    if (!this.isEnabled && process.env.NODE_ENV === 'production') return

    // Always log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = this.getTimestamp()
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '')
    }

    const duration = startTime ? this.getDuration(startTime) : undefined

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      requestId: this.requestId,
      data,
      duration,
    }

    // Add to history in development or test
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      this.logHistory.unshift(entry)
      if (this.logHistory.length > this.maxHistorySize) {
        this.logHistory.pop()
      }
    }

    // Format console output with colors
    const timestamp = chalk.gray(entry.timestamp)
    const requestId = chalk.gray(`[${entry.requestId}]`)
    const durationStr = duration ? chalk.cyan(` (${duration}ms)`) : ''

    let levelColor: ChalkInstance
    let prefix: string

    switch (level) {
      case 'api':
        levelColor = chalk.blue
        prefix = '🌐 API'
        break
      case 'route':
        levelColor = chalk.green
        prefix = '🛣️ ROUTE'
        break
      case 'error':
        levelColor = chalk.red
        prefix = '❌ ERROR'
        break
      case 'warn':
        levelColor = chalk.yellow
        prefix = '⚠️ WARN'
        break
      case 'debug':
        levelColor = chalk.gray
        prefix = '🔍 DEBUG'
        break
      default:
        levelColor = chalk.white
        prefix = 'ℹ️ INFO'
    }

    const output = `${timestamp} ${requestId} ${levelColor(prefix)}: ${message}${durationStr}`

    // Output to console
    if (this.isEnabled) {
      if (level === 'error') {
        console.error(output)
        if (data?.stack) {
          console.error(chalk.red(data.stack))
        }
      } else {
        console.log(output)
      }

      if (data && !data.stack) {
        console.log(chalk.gray(JSON.stringify(data, null, 2)))
      }
    }
  }

  /**
   * Get the current request ID
   */
  getRequestId(): string {
    return this.requestId
  }

  /**
   * Check if logging is enabled
   */
  getIsEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * Log API request/response
   */
  logApi(method: string, path: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return
    this.log('api', `${chalk.yellow(method)} ${path}`, data, startTime)
  }

  /**
   * Log route navigation
   */
  logRoute(method: string, path: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return
    this.log('route', `${chalk.yellow(method)} ${path}`, data, startTime)
  }

  /**
   * Log informational message
   */
  info(message: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return
    this.log('info', message, data, startTime)
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown, startTime?: number): void {
    if (!this.isEnabled) return
    const formattedError = this.formatError(error)
    this.log('error', message, formattedError, startTime)
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return
    this.log('warn', message, data, startTime)
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: any, startTime?: number): void {
    if (!this.isEnabled || process.env.NODE_ENV !== 'development') return
    this.log('debug', message, data, startTime)
  }

  /**
   * Get the log history
   */
  getLogHistory(): LogEntry[] {
    if (!this.isEnabled) return []
    return [...this.logHistory]
  }

  /**
   * Clear the log history
   */
  clearHistory(): void {
    if (!this.isEnabled) return
    this.logHistory = []
  }
}
