import * as jwtDecode from 'jsonwebtoken'

import type { DecodedToken } from '@/components/features/auth/types/auth.types'
import { Logger } from '@/middlewares/useLogger'
import { TokenManager } from '@/services/auth'

import type { SSEConfig, ConnectionStatus } from './types'

export class SSEClient {
  private eventSource: EventSource | null = null
  private config: SSEConfig
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private heartbeatInterval: number | null = null
  private heartbeatTimeout: number | null = null
  private logger: Logger
  private tokenManager: TokenManager
  private connectionStatus: ConnectionStatus = 'disconnected'
  private lastMessageTime: number = Date.now()
  private messageQueue: any[] = []
  private processingQueue: boolean = false
  private reconnectTimeout: number | null = null
  private readonly HEARTBEAT_INTERVAL = 30000 // 30 seconds
  private readonly HEARTBEAT_TIMEOUT = 45000 // 45 seconds
  private readonly MESSAGE_BATCH_SIZE = 10
  private readonly MESSAGE_PROCESS_INTERVAL = 1000 // 1 second
  private readonly RECONNECT_DELAY = 5000 // 5 seconds
  private readonly MAX_QUEUE_SIZE = 1000

  constructor(config: SSEConfig) {
    this.config = config
    this.logger = Logger.getInstance()
    this.tokenManager = TokenManager.getInstance()
  }

  public connect(): void {
    if (this.connectionStatus === 'connected') {
      return
    }

    this.updateConnectionStatus('connecting')

    try {
      this.eventSource = new EventSource(this.config.url)
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
      this.checkConnection()
    }, this.HEARTBEAT_INTERVAL)

    this.heartbeatTimeout = window.setInterval(() => {
      if (Date.now() - this.lastMessageTime > this.HEARTBEAT_TIMEOUT) {
        this.logger.warn('Heartbeat timeout reached')
        this.reconnect()
      }
    }, this.HEARTBEAT_TIMEOUT)
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
      const data = JSON.parse(event.data)

      if (data.type === 'heartbeat') {
        this.handleHeartbeat()
        return
      }

      if (data.type === 'error') {
        this.handleErrorMessage(data)
        return
      }

      // Add message to queue instead of processing immediately
      if (this.messageQueue.length < this.MAX_QUEUE_SIZE) {
        this.messageQueue.push(data)
        this.processMessageQueue()
      } else {
        this.logger.warn('Message queue full, dropping message')
      }
    } catch (error) {
      this.logger.error('Error parsing SSE message', error)
    }
  }

  private async processMessageQueue(): Promise<void> {
    if (this.processingQueue || this.messageQueue.length === 0) return

    this.processingQueue = true
    try {
      // Process messages in batches
      while (this.messageQueue.length > 0) {
        const batch = this.messageQueue.splice(0, this.MESSAGE_BATCH_SIZE)
        const latestMessage = batch[batch.length - 1]

        // Only process the latest message from the batch to prevent UI overload
        if (latestMessage) {
          this.config.onMessage(latestMessage)
        }

        // Add delay between batches to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, this.MESSAGE_PROCESS_INTERVAL))
      }
    } catch (error) {
      this.logger.error('Error processing message queue', error)
    } finally {
      this.processingQueue = false
    }
  }

  private handleHeartbeat(): void {
    this.lastMessageTime = Date.now()
    this.logger.debug('Heartbeat received', { timestamp: this.lastMessageTime })
  }

  private handleErrorMessage(data: any): void {
    this.logger.error('Received error message from server', data)
    if (data.code === 'TOKEN_EXPIRED') {
      this.reconnect()
    }
  }

  private handleConnectionClosed(): void {
    this.logger.warn('SSE connection closed')
    this.stopHeartbeat()

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached')
      this.config.onMaxRetriesReached?.()
      return
    }

    // Exponential backoff for reconnection attempts
    const delay = Math.min(this.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts), 30000)
    this.logger.info(`Scheduling reconnection attempt in ${delay}ms`)

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnect()
    }, delay)
  }

  private async reconnect(): Promise<void> {
    this.closeConnection()

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached')
      this.config.onMaxRetriesReached?.()
      return
    }

    try {
      this.reconnectAttempts++
      await this.handleBackoff()
      const tokens = await this.refreshToken()

      if (tokens) {
        this.updateTokens(tokens)
        this.connect()
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      this.logger.error('Reconnection failed', error)
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect()
      } else {
        this.config.onMaxRetriesReached?.()
      }
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
