'use client'

import React, { createContext, useContext, useMemo, type ReactNode } from 'react'

import { LoggerService } from './logger.service'
import type { ILogger, LoggerConfig } from './types'

// Create a context for the logger with default value
const LoggerContext = createContext<ILogger | null>(null)

interface LoggerProviderProps {
  children: ReactNode
  config?: LoggerConfig
}

/**
 * Provider component to make logger available throughout the React tree
 */
export const LoggerProvider: React.FC<LoggerProviderProps> = ({
  children,
  config
}) => {
  // Create or get the logger instance with configuration
  const logger = useMemo(() => {
    return LoggerService.getInstance(config)
  }, [config])

  return (
    <LoggerContext.Provider value={logger}>
      {children}
    </LoggerContext.Provider>
  )
}

/**
 * Hook to access the logger context
 * @throws Error if used outside LoggerProvider
 */
export const useLoggerContext = (): ILogger => {
  const context = useContext(LoggerContext)

  if (!context) {
    // Fallback to singleton if not in context
    // This enables usage outside React component tree
    return LoggerService.getInstance()
  }

  return context
}
