/**
 * Represents the current state of the SSE connection
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

/**
 * Represents a message received through the SSE connection
 */
export interface SSEMessage<T = unknown> {
  /** Type of the message */
  type: 'guild-data' | 'guild-changes' | 'heartbeat' | 'error'
  /** Message payload */
  data: T
  /** Timestamp when the message was received */
  timestamp: number
}

/**
 * Configuration options for the SSE client
 */
export interface SSEConfig {
  /** Base URL for the SSE endpoint */
  url: string
  /** Authentication token */
  token: string
  /** Refresh token for authentication */
  refreshToken: string
  /** Callback for handling incoming messages */
  onMessage: (message: SSEMessage) => void
  /** Callback for handling connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void
  /** Callback for handling errors */
  onError?: (error: Error) => void
  /** Callback for handling token refresh */
  onTokenRefresh?: (newToken: string) => void
  /** Callback when maximum reconnection attempts are reached */
  onMaxRetriesReached?: () => void
}

/**
 * Configuration options for SSE client behavior
 */
export interface SSEOptions {
  /** Maximum number of reconnection attempts before giving up */
  maxReconnectAttempts?: number
  /** Initial delay between reconnection attempts (in ms) */
  initialReconnectDelay?: number
  /** Maximum delay between reconnection attempts (in ms) */
  maxReconnectDelay?: number
  /** Interval for sending heartbeat messages (in ms) */
  heartbeatInterval?: number
  /** Maximum time to wait for a heartbeat before considering the connection dead (in ms) */
  heartbeatTimeout?: number
  /** Maximum size of the message queue */
  maxQueueSize?: number
  /** Number of messages to process in each batch */
  batchSize?: number
  /** Delay between processing batches (in ms) */
  batchDelay?: number
}

/**
 * Default configuration values for SSE client
 */
export const DEFAULT_SSE_OPTIONS: SSEOptions = {
  maxReconnectAttempts: 5,
  initialReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
  heartbeatTimeout: 45000,
  maxQueueSize: 1000,
  batchSize: 10,
  batchDelay: 1000,
}
