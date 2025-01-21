import type { SSEConfig, ConnectionStatus } from '@/hooks/useSSE/types'

import { TokenManager } from '../auth'

export class SSEManager {
  private eventSource: EventSource | null = null
  private config: SSEConfig
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 3
  private baseDelay: number = 1000
  private tokenManager: TokenManager
  private connectionStatus: ConnectionStatus = 'disconnected'

  constructor(config: SSEConfig) {
    this.config = config
    this.tokenManager = TokenManager.getInstance()
  }

  connect(): void {
    if (this.connectionStatus === 'connected') {
      return
    }

    this.updateConnectionStatus('connecting')

    try {
      this.eventSource = new EventSource(this.config.url)

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0
        this.updateConnectionStatus('connected')
      }

      this.eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data)
          this.config.onMessage(data)
        } catch (error) {
          throw error
        }
      }

      this.eventSource.onerror = async () => {
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.updateConnectionStatus('disconnected')
          await this.handleDisconnect()
        }
      }
    } catch (error) {
      this.handleDisconnect()
    }
  }

  private async handleDisconnect(): Promise<void> {
    this.closeConnection()

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.config.onMaxRetriesReached?.()
      return
    }

    this.reconnectAttempts++

    try {
      const newToken = await this.tokenManager.refreshToken(this.config.refreshToken)

      if (this.config.onTokenRefresh) {
        this.config.onTokenRefresh(newToken.access_token)
      }

      this.config.token = newToken.access_token
    } catch (error) {
      throw error
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      await this.exponentialBackoffReconnect()
    } else {
      this.config.onMaxRetriesReached?.()
    }
  }

  private updateConnectionStatus(status: ConnectionStatus) {
    this.connectionStatus = status
    this.config.onStatusChange?.(status)
  }

  private async exponentialBackoffReconnect(): Promise<void> {
    const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts - 1)
    await new Promise(resolve => setTimeout(resolve, delay))
    this.connect()
  }

  public closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      this.updateConnectionStatus('disconnected')
    }
  }
}
