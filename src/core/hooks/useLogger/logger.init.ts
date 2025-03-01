import { LoggerService } from './logger.service'

// Initialize logger with development configuration
export const initLogger = () => {
  LoggerService.getInstance({
    enabled: true,
    maxHistorySize: 1000,
  })
}
