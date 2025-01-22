export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

export interface SSEConfig {
  url: string
  token: string
  refreshToken: string
  onMessage: (data: any) => void
  onError?: (error: Error) => void
  onTokenRefresh?: (newToken: string) => void
  onStatusChange?: (status: ConnectionStatus) => void
  onMaxRetriesReached?: () => void
}

export interface UseSSEOptions {
  endpoint: string
  onMessage: (data: any) => void
  onError?: (error: Error) => void
}
