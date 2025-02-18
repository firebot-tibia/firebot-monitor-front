import { create } from 'zustand'

import { SSEClient } from '@/services/sse'
import type { ConnectionStatus } from '@/services/sse/types'
import type { GuildMemberResponse } from '@/types/guild-member.response'

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
  addMessage: (data: GuildData | GuildChanges) => void
  connect: (url: string, token: string, world: string) => void
  disconnect: () => void
  getUnprocessedMessages: () => SSEMessage[]
  markMessagesAsProcessed: (timestamp: number) => void
}

export const useSSEStore = create<SSEState>((set, get) => ({
  messages: [],
  client: null,
  status: 'disconnected',
  lastProcessedTimestamp: 0,
  currentUrl: null,
  currentToken: null,
  currentWorld: null,

  addMessage: data => {
    console.log('Adding SSE message:', { data })
    set(state => {
      const newMessage = {
        timestamp: Date.now(),
        data,
      }
      return {
        messages: [...state.messages, newMessage].slice(-100),
        status: 'connected', // Ensure we're marked as connected when receiving messages
      }
    })
  },

  connect: (url: string, token: string, world: string) => {
    const { client, disconnect, currentUrl, currentToken, currentWorld } = get()

    // Don't reconnect if already connected with same parameters
    if (
      client &&
      currentUrl === url &&
      currentToken === token &&
      currentWorld === world &&
      get().status !== 'disconnected'
    ) {
      return
    }

    // Disconnect existing client
    if (client) {
      disconnect()
    }

    // Add token to URL for SSE authentication
    const fullUrl = `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}&world=${world}`

    const newClient = new SSEClient({
      url: fullUrl,
      token,
      refreshToken: token,
      onMessage: (data: any) => {
        if (!data) return

        const monitorMode = url.split('/').filter(Boolean).pop() || ''
        const store = get()

        console.log('SSE received data:', { monitorMode, data })

        // Handle main data
        if (data[monitorMode]) {
          const mainData = data[monitorMode]
          if (Array.isArray(mainData)) {
            store.addMessage({ [monitorMode]: mainData })
          }
        }

        // Handle changes
        const changesKey = `${monitorMode}-changes`
        if (data[changesKey]) {
          const changes = data[changesKey]
          if (Array.isArray(changes)) {
            store.addMessage({ [changesKey]: changes })
          }
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
      onError: (error: Error) => {
        const store = get()
        if (store.client === newClient) {
          console.error('SSE Error:', error)
          set({ status: 'disconnected' })
        }
      },
      onTokenRefresh: (newToken: string) => {
        const store = get()
        if (store.client === newClient) {
          store.connect(url, newToken, world)
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
      currentUrl: url,
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
      })
    }
  },

  getUnprocessedMessages: () => {
    const { messages, lastProcessedTimestamp } = get()
    const unprocessed = messages.filter(msg => msg.timestamp > lastProcessedTimestamp)
    console.log('Getting unprocessed messages:', {
      total: messages.length,
      unprocessed: unprocessed.length,
      lastProcessed: new Date(lastProcessedTimestamp).toISOString(),
    })
    return unprocessed
  },

  markMessagesAsProcessed: (timestamp: number) => {
    set({ lastProcessedTimestamp: timestamp })
  },
}))
