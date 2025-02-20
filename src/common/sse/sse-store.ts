import * as jwtDecode from 'jsonwebtoken'
import { create } from 'zustand'

import { SSEClient } from '@/common/sse/services'
import type { ConnectionStatus } from '@/common/sse/services/types'
import type { GuildMemberResponse } from '@/common/types/guild-member.response'
import { TokenManager } from '@/components/features/auth/services'

interface GuildChange {
  ChangeType: 'logged-in' | 'logged-out' | 'updated'
  Member: GuildMemberResponse
}

type GuildData = {
  [key: string]: GuildMemberResponse[]
}

type GuildChanges = {
  [key: string]: {
    [memberName: string]: GuildChange
  }
}

interface SSEMessage {
  timestamp: number
  data: GuildData | GuildChanges
}

interface SSEState {
  messages: SSEMessage[]
  client: SSEClient | null
  status: ConnectionStatus
  lastProcessedTimestamp: number
  currentUrl: string | null
  currentToken: string | null
  currentWorld: string | null
  baseUrl: string | null
  addMessage: (data: GuildData | GuildChanges) => void
  connect: (baseUrl: string, token: string, world: string) => void
  disconnect: () => void
  getUnprocessedMessages: () => SSEMessage[]
  markMessagesAsProcessed: (timestamp: number) => void
  refreshConnection: (newToken: string) => void
}

export const useSSEStore = create<SSEState>((set, get) => ({
  messages: [],
  client: null,
  status: 'disconnected',
  lastProcessedTimestamp: 0,
  currentUrl: null,
  currentToken: null,
  currentWorld: null,
  baseUrl: null,

  addMessage: data => {
    set(state => ({
      messages: [
        ...state.messages,
        {
          timestamp: Date.now(),
          data,
        },
      ].slice(-100),
    }))
  },

  connect: (baseUrl: string, token: string, world: string) => {
    const { client, disconnect } = get()

    // Validate token before connecting
    try {
      const tokenData = jwtDecode.default(token) as { exp: number }
      const now = Math.floor(Date.now() / 1000)

      if (tokenData.exp <= now) {
        console.error('Token is expired, cannot connect')
        return
      }
    } catch (error) {
      console.error('Invalid token format:', error)
      return
    }

    // Store base configuration
    set({
      baseUrl,
      currentToken: token,
      currentWorld: world,
    })

    // Construct full URL with token and world
    const url = new URL(baseUrl)
    url.searchParams.set('token', encodeURIComponent(token))
    url.searchParams.set('world', world)
    const fullUrl = url.toString()

    set({ currentUrl: fullUrl })

    // Disconnect existing client if any
    if (client) {
      disconnect()
    }

    const newClient = new SSEClient({
      url: fullUrl,
      token,
      refreshToken: token,
      onMessage: (data: any) => {
        if (!data) return

        const monitorMode = baseUrl.split('/').filter(Boolean).pop() || ''
        const store = get()

        if (data[monitorMode]) {
          store.addMessage(data[monitorMode])
        }
        if (data[`${monitorMode}-changes`]) {
          store.addMessage(data[`${monitorMode}-changes`])
        }
      },
      onError: (error: Error) => {
        console.error('SSE Error:', error)
        // Check if error is due to token expiration
        if (error.message.includes('TOKEN_EXPIRED')) {
          // Attempt to refresh token
          const tokenManager = TokenManager.getInstance()
          tokenManager
            .refreshToken(get().currentToken || '', get().currentToken || '')
            .then(newToken => {
              get().refreshConnection(newToken.access_token)
            })
            .catch(err => {
              console.error('Failed to refresh token:', err)
              set({ status: 'disconnected' })
            })
        } else {
          set({ status: 'disconnected' })
        }
      },
      onStatusChange: (status: ConnectionStatus) => {
        const store = get()
        if (store.client === newClient) {
          set({ status })
          if (status === 'disconnected') {
            console.warn('SSE connection disconnected')
          }
        }
      },
      onMaxRetriesReached: () => {
        const store = get()
        if (store.client === newClient) {
          console.error('Max SSE reconnection attempts reached')
          disconnect()
        }
      },
    })

    set({
      client: newClient,
      status: 'connecting',
      currentUrl: fullUrl,
      currentToken: token,
      currentWorld: world,
    })

    newClient.connect()
  },

  disconnect: () => {
    const { client } = get()
    if (client) {
      client.closeConnection()
      set({
        client: null,
        status: 'disconnected',
        currentUrl: null,
        currentToken: null,
        currentWorld: null,
        baseUrl: null,
      })
    }
  },

  refreshConnection: (newToken: string) => {
    const { baseUrl, currentWorld } = get()
    if (!baseUrl || !currentWorld) {
      console.error('Cannot refresh connection: missing base URL or world')
      return
    }

    // Reconnect with new token
    get().connect(baseUrl, newToken, currentWorld)
  },

  getUnprocessedMessages: () => {
    const { messages, lastProcessedTimestamp } = get()
    return messages.filter(msg => msg.timestamp > lastProcessedTimestamp)
  },

  markMessagesAsProcessed: (timestamp: number) => {
    set({ lastProcessedTimestamp: timestamp })
  },
}))
