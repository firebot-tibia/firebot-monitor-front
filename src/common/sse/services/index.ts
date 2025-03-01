import { jwtDecode } from 'jwt-decode'

import { TokenManager } from '@/components/features/auth/services'
import type { DecodedToken } from '@/components/features/auth/types/auth.types'

import type { SSEConfig, SSEOptions, ConnectionStatus, SSEMessage } from './types'
import { DEFAULT_SSE_OPTIONS } from './types'

/**
 * Improved SSE client with better error handling and performance optimizations
 */
export class SSEClient {
  private eventSource: EventSource | null = null
  private config: SSEConfig
  private options: Required<SSEOptions>
  private tokenManager: TokenManager

  // Connection state tracking
  private connectionStatus: ConnectionStatus = 'disconnected'
  private lastMessageTime = Date.now()
  private reconnectCount = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private tokenRefreshInProgress = false
  private visibilityHandler: () => void
  private onlineHandler: () => void
  private offlineHandler: () => void

  /**
   * Creates a new SSE client instance
   */
  constructor(config: SSEConfig, options: SSEOptions = {}) {
    this.config = config
    this.options = { ...DEFAULT_SSE_OPTIONS, ...options }
    this.tokenManager = TokenManager.getInstance()

    // Bind event handlers
    this.visibilityHandler = this.handleVisibilityChange.bind(this)
    this.onlineHandler = this.handleOnline.bind(this)
    this.offlineHandler = this.handleOffline.bind(this)

    // Set up event listeners
    this.setupEventListeners()

    // Log initialization
    this.log('info', 'SSE client initialized')
  }

  /**
   * Set up global event listeners
   */
  private setupEventListeners(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityHandler)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineHandler)
      window.addEventListener('offline', this.offlineHandler)
    }
  }

  /**
   * Remove global event listeners
   */
  private removeEventListeners(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineHandler)
      window.removeEventListener('offline', this.offlineHandler)
    }
  }

  /**
   * Connect to the SSE endpoint
   */
  public connect(): void {
    if (this.connectionStatus === 'connected' || this.connectionStatus === 'connecting') {
      this.log('info', 'Already connected or connecting')
      return
    }

    this.setStatus('connecting')
    this.stopReconnectTimer()

    try {
      // Close any existing connection
      this.closeEventSource()

      // Build URL with parameters
      const url = new URL(this.config.url)

      // Add token
      if (this.config.token) {
        url.searchParams.set('token', encodeURIComponent(this.config.token))
      }

      // Add world ID if present
      if (this.config.worldId) {
        url.searchParams.set('world', this.config.worldId)
      }

      // Create and configure EventSource
      this.log('info', `Connecting to SSE endpoint: ${url.toString()}`)
      this.eventSource = new EventSource(url.toString())
      this.eventSource.onopen = this.handleOpen.bind(this)
      this.eventSource.onmessage = this.handleMessage.bind(this)
      this.eventSource.onerror = this.handleError.bind(this)

      // Start heartbeat monitoring
      this.startHeartbeat()
    } catch (error) {
      this.log('error', 'Failed to create EventSource', error)
      this.handleConnectionFailure(error as Error)
    }
  }

  /**
   * Handle EventSource open event
   */
  private handleOpen(): void {
    this.log('info', 'SSE connection established')
    this.setStatus('connected')
    this.reconnectCount = 0
    this.lastMessageTime = Date.now()
  }

  /**
   * Handle incoming SSE message
   */
  private handleMessage(event: MessageEvent): void {
    this.lastMessageTime = Date.now()

    try {
      // Parse the message data
      this.log('debug', 'Raw SSE message:', event.data)
      const data = JSON.parse(event.data)
      this.log('debug', 'Parsed SSE message:', data)

      if (!data) {
        this.log('warn', 'Empty message received')
        return
      }

      // Log the raw message for debugging
      this.log('debug', 'Received SSE message:', data)

      // Create structured message object
      this.log('debug', 'Creating structured message from data:', data)
      const message: SSEMessage = {
        data,
        timestamp: Date.now(),
        type: 'guild_data',
      }

      // Deliver message to handler
      this.log('debug', 'Delivering message to handler:', message)
      this.config.onMessage(message)
    } catch (error) {
      this.log('error', 'Error processing SSE message:', error, '\nRaw data:', event.data)
    }
  }

  /**
   * Handle EventSource error
   */
  private handleError(event: Event): void {
    this.log('warn', 'SSE connection error', event)

    // Check if connection is closed
    if (this.eventSource?.readyState === EventSource.CLOSED) {
      this.setStatus('disconnected')
      this.scheduleReconnect()
      return
    }

    // Check if the error might be due to an expired token
    const timeSinceLastMessage = Date.now() - this.lastMessageTime

    if (timeSinceLastMessage > 30000 && !this.tokenRefreshInProgress) {
      this.log('warn', 'No messages received for 30s, attempting token refresh')
      this.refreshToken()
    }
  }

  /**
   * Handle connection failure
   */
  private handleConnectionFailure(error: Error): void {
    this.log('error', 'SSE connection failure', error)
    this.setStatus('disconnected')

    if (this.config.onError) {
      this.config.onError(error)
    }

    this.scheduleReconnect()
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    this.stopReconnectTimer()

    if (this.reconnectCount >= this.options.maxReconnectAttempts) {
      this.log('error', 'Max reconnect attempts reached')

      if (this.config.onMaxRetriesReached) {
        this.config.onMaxRetriesReached()
      }

      return
    }

    // Calculate backoff delay with jitter
    const baseDelay = Math.min(
      this.options.initialReconnectDelay * Math.pow(1.5, this.reconnectCount),
      this.options.maxReconnectDelay,
    )

    // Add random jitter (±20%) to help prevent reconnection storms
    const jitter = 0.8 + Math.random() * 0.4 // 0.8-1.2
    const delay = Math.floor(baseDelay * jitter)

    this.log('info', `Scheduling reconnect in ${delay}ms (attempt ${this.reconnectCount + 1})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++
      this.connect()
    }, delay)
  }

  /**
   * Handle network offline event
   */
  private handleOffline(): void {
    this.log('warn', 'Network offline, pausing connection')
    this.closeEventSource() // Just close the connection without changing status
  }

  /**
   * Handle network online event
   */
  private handleOnline(): void {
    this.log('info', 'Network online, reconnecting')
    this.connect() // Reconnect using current parameters
  }

  /**
   * Handle visibility change (tab focus/blur)
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      // Tab is now visible
      const currentStatus = this.getStatus()

      if (currentStatus !== 'connected') {
        this.log('info', 'Tab visible, reconnecting')
        this.connect()
      }
    }
  }

  /**
   * Stop reconnect timer
   */
  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime

      if (timeSinceLastMessage > this.options.heartbeatTimeout) {
        this.log('warn', `No messages for ${timeSinceLastMessage}ms, reconnecting`)
        this.closeConnection()
        this.connect()
      }
    }, this.options.heartbeatInterval)
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Refresh the authentication token
   */
  private async refreshToken(): Promise<boolean> {
    if (this.tokenRefreshInProgress) {
      return false
    }

    this.tokenRefreshInProgress = true

    try {
      const userId = this.extractUserIdFromToken(this.config.token)

      if (!userId) {
        this.log('error', 'Could not extract user ID from token')
        return false
      }

      const tokens = await this.tokenManager.refreshToken(userId, this.config.refreshToken)

      if (tokens && tokens.access_token) {
        this.log('info', 'Token refreshed successfully')

        // Update tokens
        this.config.token = tokens.access_token
        this.config.refreshToken = tokens.refresh_token || this.config.refreshToken

        if (this.config.onTokenRefresh) {
          this.config.onTokenRefresh(tokens.access_token, tokens.refresh_token)
        }

        // Only reconnect if we're disconnected
        if (this.connectionStatus === 'disconnected') {
          this.connect()
        }

        return true
      }

      return false
    } catch (error) {
      this.log('error', 'Token refresh failed', error)
      return false
    } finally {
      this.tokenRefreshInProgress = false
    }
  }

  /**
   * Extract user ID from token
   */
  private extractUserIdFromToken(token: string): string | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      return decoded.sub
    } catch (error) {
      this.log('error', 'Failed to decode token', error)
      return null
    }
  }

  /**
   * Set connection status and notify listeners
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status

      if (this.config.onStatusChange) {
        this.config.onStatusChange(status)
      }
    }
  }

  /**
   * Close the EventSource instance
   */
  private closeEventSource(): void {
    if (this.eventSource) {
      this.eventSource.onopen = null
      this.eventSource.onmessage = null
      this.eventSource.onerror = null
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * Close the SSE connection and clean up
   */
  public closeConnection(): void {
    this.log('info', 'Closing SSE connection')

    this.stopHeartbeat()
    this.stopReconnectTimer()
    this.closeEventSource()
    this.setStatus('disconnected')

    // Clean up event listeners to prevent memory leaks
    this.removeEventListeners()
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  /**
   * Update the token without reconnecting
   */
  public updateToken(token: string, refreshToken: string): void {
    this.config.token = token
    this.config.refreshToken = refreshToken
    this.log('info', 'Tokens updated')
  }

  /**
   * Conditional logging based on debug option
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', ...args: any[]): void {
    // Only log debug messages if debug option is enabled
    if (level === 'debug' && !this.options.debug) {
      return
    }

    console[level](`[SSE Client] ${args[0]}`, ...args.slice(1))
  }
}
