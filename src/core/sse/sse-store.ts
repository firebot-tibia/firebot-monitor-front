import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { SSEClient } from './services'
import type { ConnectionStatus, SSEMessage } from './services/types'

/**
 * State interface for the SSE store
 */
interface SSEState {
  // Connection state
  client: SSEClient | null
  status: ConnectionStatus

  // Message queue & processing
  messages: SSEMessage[]
  lastProcessedTimestamp: number

  // Connection parameters (persisted)
  baseUrl: string | null
  worldId: string | null
  monitorMode: string | null

  // Methods
  connect: (
    baseUrl: string,
    token: string,
    refreshToken: string,
    worldId: string,
    monitorMode: string,
  ) => void
  disconnect: () => void
  addMessage: (message: SSEMessage) => void
  getUnprocessedMessages: () => SSEMessage[]
  markMessagesAsProcessed: (timestamp: number) => void
  updateToken: (newToken: string, newRefreshToken: string) => void
}

/**
 * Validates incoming SSE message structure
 */
const validateMessage = (message: unknown): message is SSEMessage => {
  if (!message || typeof message !== 'object') return false

  const msg = message as any
  if (!msg.type || !msg.data || typeof msg.timestamp !== 'number') return false

  // Validate known message types
  if (!['guild_data', 'guild_changes', 'heartbeat', 'error'].includes(msg.type)) return false

  return true
}

/**
 * Zustand store for managing SSE connections and messages
 */
export const useSSEStore = create<SSEState>()(
  persist(
    (set, get) => ({
      // Connection state
      client: null,
      status: 'disconnected',

      // Message queue
      messages: [],
      lastProcessedTimestamp: 0,

      // Connection parameters
      baseUrl: null,
      worldId: null,
      monitorMode: null,

      /**
       * Connect to the SSE endpoint
       */
      connect: (
        baseUrl: string,
        token: string,
        refreshToken: string,
        worldId: string,
        monitorMode: string,
      ) => {
        // Store connection parameters
        set({
          baseUrl,
          worldId,
          monitorMode,
        })

        // Clean up existing client
        const { client } = get()
        if (client) {
          client.closeConnection()
        }

        // Create the URL with base and monitor mode
        const url = new URL(`${baseUrl}${monitorMode}/`)
        const fullUrl = url.toString()

        // Create a new client
        const newClient = new SSEClient(
          {
            url: fullUrl,
            token,
            refreshToken,
            worldId,
            onMessage: (message: unknown) => {
              // Validate message structure
              if (!validateMessage(message)) {
                console.error('[SSE Store] Invalid message structure:', message)
                return
              }

              // Process received message by adding it to our store
              get().addMessage(message)
            },
            onStatusChange: (status: ConnectionStatus) => {
              set({ status })
            },
            onError: (error: Error) => {
              console.error('[SSE Store] Connection error:', error)
              // Add error message to the queue
              get().addMessage({
                type: 'error',
                data: {
                  message: error.message,
                  code: 'CONNECTION_ERROR',
                },
                timestamp: Date.now(),
              })
            },
            onTokenRefresh: (newToken: string, newRefreshToken: string) => {
              get().updateToken(newToken, newRefreshToken)
            },
            onMaxRetriesReached: () => {
              console.error('[SSE Store] Max reconnection attempts reached')
            },
          },
          {
            debug: process.env.NODE_ENV === 'development',
          },
        )

        // Store the client and connect
        set({ client: newClient, status: 'connecting' })
        newClient.connect()
      },

      /**
       * Disconnect from the SSE endpoint
       */
      disconnect: () => {
        const { client } = get()
        if (client) {
          client.closeConnection()
          set({
            client: null,
            status: 'disconnected',
            messages: [], // Clear message queue on disconnect
          })
        }
      },

      /**
       * Add a new message to the queue
       */
      addMessage: (message: SSEMessage) => {
        console.log('[SSE Store Debug] Adding message:', message)
        // Validate message format
        if (!message || !message.data) {
          console.warn('[SSE Store] Invalid message format:', message)
          return
        }

        // Process and normalize the message based on its format
        const { monitorMode } = get()
        let processedMessage: SSEMessage | null = null

        // Extract data based on the message structure
        const data = message.data as any

        // Determine message type based on data structure
        const changesKey = `${monitorMode}-changes`
        const type = data[changesKey] ? 'guild_changes' : 'guild_data'

        // Check for specific properties in the data object
        if (data[monitorMode as string]) {
          // Full guild data update
          processedMessage = {
            type,
            data: data[monitorMode as string],
            timestamp: message.timestamp || Date.now(),
          }
        } else {
          // Check for changes format
          const changesKey = `${monitorMode}-changes`
          if (data[changesKey]) {
            // Incremental changes
            processedMessage = {
              type,
              data: data[changesKey],
              timestamp: message.timestamp || Date.now(),
            }
          } else if (Array.isArray(data)) {
            // Direct array format
            processedMessage = {
              type,
              data,
              timestamp: message.timestamp || Date.now(),
            }
          } else if (typeof data === 'object' && data !== null) {
            // Other object format - try to determine type
            const keys = Object.keys(data)
            if (
              keys.length > 0 &&
              typeof data[keys[0]] === 'object' &&
              'ChangeType' in data[keys[0]]
            ) {
              processedMessage = {
                type: 'guild_changes',
                data,
                timestamp: message.timestamp || Date.now(),
              }
            } else {
              // Unknown format, store as-is
              processedMessage = message
            }
          } else {
            // Fallback - store as-is
            processedMessage = message
          }
        }

        // Add the processed message to our store
        if (processedMessage) {
          console.log('[SSE Store Debug] Processed message:', processedMessage)
          set(state => ({
            messages: [...state.messages, processedMessage as SSEMessage].slice(-200), // Keep last 200 messages
          }))
        }
      },

      /**
       * Get messages that haven't been processed yet
       */
      getUnprocessedMessages: () => {
        console.log('[SSE Store Debug] Getting unprocessed messages')
        const { messages, lastProcessedTimestamp } = get()
        const unprocessed = messages.filter(msg => msg.timestamp > lastProcessedTimestamp)
        console.log('[SSE Store Debug] Found unprocessed messages:', unprocessed)
        return unprocessed
      },

      /**
       * Mark messages as processed up to the given timestamp
       */
      markMessagesAsProcessed: timestamp => {
        set({ lastProcessedTimestamp: timestamp })
      },

      /**
       * Update tokens in the client
       */
      updateToken: (newToken, newRefreshToken) => {
        const { client } = get()
        if (client) {
          client.updateToken(newToken, newRefreshToken)
        }
      },
    }),
    {
      name: 'sse-store',
      // Only persist these fields
      partialize: state => ({
        lastProcessedTimestamp: state.lastProcessedTimestamp,
        baseUrl: state.baseUrl,
        worldId: state.worldId,
        monitorMode: state.monitorMode,
      }),
    },
  ),
)
