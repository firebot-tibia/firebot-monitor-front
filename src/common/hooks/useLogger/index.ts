'use client'

import { useLoggerContext } from './logger.context'
import { LoggerService } from './logger.service'
import type { UseLoggerReturn, LoggerConfig } from './types'

/**
 * Custom hook for using the logger in React components
 *
 * @param config - Optional configuration for the logger
 * @returns All logging methods and the logger instance
 *
 * @example
 * ```tsx
 * const { info, error, warn, debug } = useLogger();
 *
 * // Log information
 * info('User logged in', { userId: '123' });
 *
 * // Log errors with proper stack traces
 * try {
 *   // Some code that might throw
 * } catch (err) {
 *   error('Operation failed', err);
 * }
 * ```
 */
export const useLogger = (config?: LoggerConfig): UseLoggerReturn => {
  // Get logger from context, or fallback to singleton
  const loggerContext = useLoggerContext()

  // Apply any custom config to the logger
  const logger = config ? LoggerService.getInstance(config) : loggerContext

  // Create a memoized wrapper with all logger methods
  return {
    // Expose the logger instance directly
    logger,

    // Expose request ID and enabled state
    isEnabled: (logger as LoggerService).getIsEnabled(),
    requestId: (logger as LoggerService).getRequestId(),

    // Forward all logging methods
    logApi: (method, path, data, startTime) => logger.logApi(method, path, data, startTime),

    logRoute: (method, path, data, startTime) => logger.logRoute(method, path, data, startTime),

    info: (message, data, startTime) => logger.info(message, data, startTime),

    error: (message, error, startTime) => logger.error(message, error, startTime),

    warn: (message, data, startTime) => logger.warn(message, data, startTime),

    debug: (message, data, startTime) => logger.debug(message, data, startTime),

    getLogHistory: () => logger.getLogHistory(),

    clearHistory: () => logger.clearHistory(),
  }
}

// Export a singleton instance for non-React usage
export const logger = LoggerService.getInstance()
