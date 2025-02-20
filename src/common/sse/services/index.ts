import * as jwtDecode from 'jsonwebtoken'

import { Logger } from '@/common/hooks/useLogger'
import { TokenManager } from '@/components/features/auth/services'
import type { DecodedToken } from '@/components/features/auth/types/auth.types'

import {
  DEFAULT_SSE_OPTIONS,
  type SSEConfig,
  type SSEMessage,
  type SSEOptions,
  type ConnectionStatus,
} from './types'

/**
 * SSEClient handles Server-Sent Events connections with automatic reconnection,
 * message queuing, and heartbeat monitoring.
 */
export class SSEClient {
  private eventSource: EventSource | null = null
  private config: SSEConfig
  private options: Required<SSEOptions>
  private logger: Logger
  private tokenManager: TokenManager

  private reconnectAttempts = 0
  private connectionStatus: ConnectionStatus = 'disconnected'
  private lastMessageTime = Date.now()
  private messageQueue: SSEMessage[] = []
  private processingQueue = false

  private heartbeatInterval: number | null = null
  private heartbeatTimeout: number | null = null
  private reconnectTimeout: number | null = null

  constructor(config: SSEConfig, options: SSEOptions = {}) {
    this.config = config
    this.options = { ...DEFAULT_SSE_OPTIONS, ...options }
    this.logger = Logger.getInstance()
    this.tokenManager = TokenManager.getInstance()
  }

  public connect(): void {
    if (this.connectionStatus === 'connected') {
      return
    }

    this.updateConnectionStatus('connecting')

    try {
      const url = new URL(this.config.url)
      url.searchParams.set('token', encodeURIComponent(this.config.token))

      this.eventSource = new EventSource(url.toString())
      this.setupEventListeners()
      this.startHeartbeat()
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return

    this.eventSource.onopen = () => {
      this.logger.info('SSE connection opened')
      this.reconnectAttempts = 0
      this.updateConnectionStatus('connected')
      this.lastMessageTime = Date.now()
    }

    this.eventSource.onmessage = this.handleMessageEvent.bind(this)
    this.setupErrorHandling()
  }

  private setupErrorHandling(): void {
    if (!this.eventSource) return

    this.eventSource.onerror = (error: Event) => {
      this.logger.error('SSE connection error', error)
      this.updateConnectionStatus('disconnected')

      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.handleConnectionClosed()
      }
    }

    window.addEventListener('offline', () => {
      this.logger.warn('Network offline, closing SSE connection')
      this.closeConnection()
    })

    window.addEventListener('online', () => {
      this.logger.info('Network online, attempting to reconnect')
      this.reconnect()
    })
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatInterval = window.setInterval(() => {
      void this.checkConnection()
    }, this.options.heartbeatInterval)

    this.heartbeatTimeout = window.setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime
      if (timeSinceLastMessage > this.options.heartbeatTimeout) {
        this.logger.warn('Heartbeat timeout reached', { timeSinceLastMessage })
        void this.reconnect()
      }
    }, this.options.heartbeatTimeout)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  private async checkConnection(): Promise<void> {
    if (this.eventSource?.readyState === EventSource.CLOSED) {
      this.logger.warn('Connection closed, attempting to reconnect')
      await this.reconnect()
    }
  }

  private handleMessageEvent(event: MessageEvent): void {
    this.lastMessageTime = Date.now()

    try {
      const message: SSEMessage = {
        ...JSON.parse(event.data),
        timestamp: Date.now(),
      }

      switch (message.type) {
        case 'heartbeat':
          this.handleHeartbeat(message)
          break
        case 'error':
          this.handleErrorMessage(message)
          break
        default:
          if (this.messageQueue.length < this.options.maxQueueSize) {
            this.messageQueue.push(message)
            void this.processMessageQueue()
          } else {
            this.logger.warn('Message queue full, dropping message', {
              queueSize: this.messageQueue.length,
            })
          }
      }
    } catch (error) {
      this.logger.error('Error parsing SSE message', error)
      this.config.onError?.(error as Error)
    }
  }

  private async processMessageQueue(): Promise<void> {
    if (this.processingQueue || this.messageQueue.length === 0) return

    this.processingQueue = true
    try {
      while (this.messageQueue.length > 0) {
        const batch = this.messageQueue.splice(0, this.options.batchSize)

        // Process only the most recent message to prevent UI overload
        const latestMessage = batch[batch.length - 1]
        if (latestMessage) {
          try {
            this.config.onMessage(latestMessage)
          } catch (error) {
            this.logger.error('Error in message handler', { error, message: latestMessage })
          }
        }

        if (this.messageQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.options.batchDelay))
        }
      }
    } catch (error) {
      this.logger.error('Error processing message queue', error)
      this.config.onError?.(error as Error)
    } finally {
      this.processingQueue = false
    }
  }

  private handleHeartbeat(data: any): void {
    this.lastMessageTime = Date.now()
    this.logger.debug('Heartbeat received', { timestamp: this.lastMessageTime })
  }

  private async handleErrorMessage(data: any): Promise<void> {
    this.logger.error('Received error message from server', data)

    if (data.code === 'TOKEN_EXPIRED') {
      try {
        const decodedToken = await this.tokenManager.refreshToken(this.config.refreshToken)
        if (decodedToken) {
          this.logger.info('Token refreshed successfully')
          this.config.onTokenRefresh?.(decodedToken.token)
          return
        }
      } catch (error) {
        this.logger.error('Failed to refresh token', error)
      }

      // If token refresh fails, try to reconnect
      void this.reconnect()
    }
  }

  private handleConnectionClosed(): void {
    this.logger.warn('SSE connection closed')
    this.stopHeartbeat()

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached')
      this.config.onMaxRetriesReached?.()
      return
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.options.initialReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.options.maxReconnectDelay,
    )

    this.logger.info('Scheduling reconnection attempt', {
      attempt: this.reconnectAttempts + 1,
      delay,
      maxAttempts: this.options.maxReconnectAttempts,
    })

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.reconnectTimeout = window.setTimeout(() => {
      void this.reconnect()
    }, delay)
  }

  private async reconnect(): Promise<void> {
    this.closeConnection()

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached')
      this.config.onMaxRetriesReached?.()
      return
    }

    try {
      // Try to refresh token before reconnecting
      try {
        const decodedToken = await this.tokenManager.refreshToken(this.config.refreshToken)
        if (decodedToken) {
          this.logger.info('Token refreshed during reconnection')
          this.config.onTokenRefresh?.(decodedToken.token)
          return // The store will handle reconnection with new token
        }
      } catch (error) {
        this.logger.error('Failed to refresh token during reconnection', error)
      }

      // If token refresh fails, try to reconnect with current token
      this.reconnectAttempts++
      await this.connect()
      const tokens = await this.refreshToken()

      if (tokens) {
        this.updateTokens(tokens)
        this.connect()
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      this.logger.error('Reconnection failed', error)
    }
  }

  private getUserIdFromToken(token: string): string | null {
    try {
      const decoded = jwtDecode.decode(token) as DecodedToken
      return decoded.sub
    } catch (error) {
      this.logger.error('Error decoding token', error)
      return null
    }
  }

  private async refreshToken(): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
      const userId = this.getUserIdFromToken(this.config.token)

      if (!userId) {
        this.logger.error('Failed to get userId from token')
        return null
      }

      return await this.tokenManager.refreshToken(userId, this.config.refreshToken)
    } catch (error) {
      this.logger.error('Token refresh failed during reconnection', error)
      return null
    }
  }

  private updateTokens(tokens: { access_token: string; refresh_token: string }): void {
    this.config.token = tokens.access_token
    this.config.refreshToken = tokens.refresh_token
    this.config.onTokenRefresh?.(tokens.access_token)
  }

  private async handleBackoff(): Promise<void> {
    const delay = this.calculateBackoffDelay()
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  private calculateBackoffDelay(): number {
    return Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000)
  }

  private handleError(error: Error): void {
    this.logger.error('SSE Error', error)
    this.config.onError?.(error)
    this.updateConnectionStatus('disconnected')
    this.reconnect()
  }

  private updateConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status
    this.config.onStatusChange?.(status)
  }

  public closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.stopHeartbeat()
    this.updateConnectionStatus('disconnected')
  }

  public getStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  public forceReconnect(): void {
    this.logger.info('Forcing reconnection')
    this.closeConnection()
    this.reconnectAttempts = 0
    this.connect()
  }
}
