import { jwtDecode } from 'jwt-decode'
import { getSession } from 'next-auth/react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void
  clearTokens: () => void
  getAccessToken: () => Promise<string | null>
  refreshAccessToken: () => Promise<void>
}

export const useAuth = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      clearTokens: () => set({ accessToken: null, refreshToken: null, isAuthenticated: false }),

      getAccessToken: async () => {
        const { accessToken } = get()
        if (accessToken) {
          try {
            const decoded = jwtDecode<{ exp: number }>(accessToken)
            if (decoded.exp > Date.now() / 1000) return accessToken
          } catch {
            return null
          }
        }

        const session = await getSession()
        if (session?.access_token) {
          set({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            isAuthenticated: true,
          })
          return session.access_token
        }

        return null
      },

      refreshAccessToken: async () => {
        try {
          const session = await getSession()
          if (session?.access_token) {
            set({
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              isAuthenticated: true,
            })
          } else {
            throw new Error('Failed to refresh token')
          }
        } catch (error) {
          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
    },
  ),
)
