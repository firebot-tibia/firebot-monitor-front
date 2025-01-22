import type { ChalkInstance } from 'chalk'
import chalk from 'chalk'
import type { NextRequest, NextResponse } from 'next/server'

import type { LogEntry, LogError, LogLevel } from './types'

export class Logger {
  private static instance: Logger
  private requestId: string
  private logHistory: LogEntry[] = []
  private readonly maxHistorySize = 1000
  private readonly isProduction = process.env.NODE_ENV === 'production'
  private readonly isEnabled = !this.isProduction

  private constructor() {
    this.requestId = this.generateRequestId()
  }

  static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger()
    }
    return this.instance
  }

  private generateRequestId(): string {
    if (!this.isEnabled) return ''
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  private getTimestamp(): string {
    return new Date().toISOString()
  }

  private getDuration(startTime: number): number {
    return Date.now() - startTime
  }

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

  private log(level: LogLevel, message: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return

    const duration = startTime ? this.getDuration(startTime) : undefined

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      requestId: this.requestId,
      data,
      duration,
    }

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      this.logHistory.unshift(entry)
      if (this.logHistory.length > this.maxHistorySize) {
        this.logHistory.pop()
      }
    }

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

  logApi(method: string, path: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return
    this.log('api', `${chalk.yellow(method)} ${path}`, data, startTime)
  }

  logRoute(method: string, path: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return
    this.log('route', `${chalk.yellow(method)} ${path}`, data, startTime)
  }

  info(message: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return
    this.log('info', message, data, startTime)
  }

  error(message: string, error?: unknown, startTime?: number): void {
    if (!this.isEnabled) return
    const formattedError = this.formatError(error)
    this.log('error', message, formattedError, startTime)
  }

  warn(message: string, data?: any, startTime?: number): void {
    if (!this.isEnabled) return
    this.log('warn', message, data, startTime)
  }

  debug(message: string, data?: any, startTime?: number): void {
    if (!this.isEnabled || process.env.NODE_ENV !== 'development') return
    this.log('debug', message, data, startTime)
  }

  getLogHistory(): LogEntry[] {
    if (!this.isEnabled) return []
    return [...this.logHistory]
  }

  clearHistory(): void {
    if (!this.isEnabled) return
    this.logHistory = []
  }
}

export async function loggerMiddleware(request: NextRequest, next: () => Promise<NextResponse>) {
  const logger = Logger.getInstance()

  // Skip logging in production
  if (process.env.NODE_ENV === 'production') {
    return next()
  }

  const startTime = Date.now()
  const { pathname, searchParams } = request.nextUrl
  const method = request.method

  try {
    if (pathname.startsWith('/api')) {
      logger.logApi(
        method,
        pathname,
        {
          query: Object.fromEntries(searchParams),
          headers: Object.fromEntries(request.headers),
        },
        startTime,
      )
    } else {
      logger.logRoute(
        method,
        pathname,
        {
          query: Object.fromEntries(searchParams),
        },
        startTime,
      )
    }

    const response = await next()

    const logData = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
    }

    if (pathname.startsWith('/api')) {
      logger.logApi(method, pathname, { response: logData }, startTime)
    } else {
      logger.logRoute(method, pathname, { response: logData }, startTime)
    }

    return response
  } catch (error: unknown) {
    logger.error(`Request failed: ${method} ${pathname}`, error, startTime)
    throw error
  }
}
