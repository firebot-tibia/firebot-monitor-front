/**
 * Represents the current state of the SSE connection
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

/**
 * Message type discriminator for SSE messages
 */
export type SSEMessageType = 'guild_data' | 'guild_changes' | 'heartbeat' | 'error'

/**
 * Generic SSE message interface with strong typing
 */
export interface SSEMessage<T = unknown> {
  /** Type of the message for distinguishing different message types */
  type: SSEMessageType
  /** Strongly typed payload data */
  data: T
  /** Timestamp when the message was received */
  timestamp: number
  /** Optional error information */
  error?: {
    code: string
    message: string
  }
}

/**
 * Configuration for the SSE client
 */
export interface SSEConfig {
  /** Base URL for the SSE endpoint */
  url: string
  /** Authentication token */
  token: string
  /** Refresh token for authentication */
  refreshToken: string
  /** World ID for context-specific data */
  worldId: string
  /** Callback for handling incoming messages */
  onMessage: (message: SSEMessage) => void
  /** Callback for handling connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void
  /** Callback for handling errors */
  onError?: (error: Error) => void
  /** Callback for handling token refresh */
  onTokenRefresh?: (newToken: string, newRefreshToken: string) => void
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
  /** Interval for checking connection health (in ms) */
  heartbeatInterval?: number
  /** Maximum time to wait for a message before considering the connection dead (in ms) */
  heartbeatTimeout?: number
  /** Enable debug logging */
  debug?: boolean
}

/**
 * Default configuration values for SSE client optimized for real-time performance
 */
export const DEFAULT_SSE_OPTIONS: Required<SSEOptions> = {
  maxReconnectAttempts: 15, // More retry attempts for resilience
  initialReconnectDelay: 500, // Start with very short delay
  maxReconnectDelay: 5000, // Cap at 5 seconds for responsiveness
  heartbeatInterval: 10000, // Check connection health every 10 seconds
  heartbeatTimeout: 20000, // Consider connection dead after 20 seconds of silence
  debug: false, // Disable debug logging by default
}

/**
 * Guild specific data types
 */

// Base guild member type
export interface GuildMember {
  Name: string
  Vocation: string
  Level: number
  OnlineStatus: boolean
  Kind: string
  Status: string
  Local: string
  Login: string
  TimeOnline: string | null
  LastLogin: string
  OnlineSince: string | null
  Rank?: string
  Alias?: string
  JoiningDate?: string
  ChangedAt?: number
}

// Alias for GuildMemberResponse to maintain backward compatibility
export type GuildMemberResponse = GuildMember

// Guild change notification
export interface GuildChange {
  Member: GuildMember
  ChangeType: 'logged-in' | 'logged-out' | 'updated' | string
}

// Guild data structure in messages
export interface GuildData {
  members: GuildMember[]
  timestamp: number
  worldId: string
}

// Guild changes structure in messages
export interface GuildChanges {
  changes: GuildChange[]
  timestamp: number
  worldId: string
}
