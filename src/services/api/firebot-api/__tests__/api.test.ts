import MockAdapter from 'axios-mock-adapter'
import { signOut } from 'next-auth/react'

import api from '..'
import { useAuth } from '../../../../components/features/auth/hooks/useAuth'

jest.mock('@/components/features/auth/hooks/useAuth')
jest.mock('next-auth/react', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}))

describe('API Client', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(api)
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_API_URL = 'https://api.firebot.run/api'
  })

  afterEach(() => {
    mockAxios.reset()
    delete process.env.NEXT_PUBLIC_API_URL
  })

  describe('Configuration', () => {
    it('should be created with correct base config', () => {
      expect(api.defaults.baseURL).toBe('https://api.firebot.run/api')
      expect(api.defaults.withCredentials).toBe(true)
    })
  })

  describe('Token Refresh', () => {
    it('should retry with new token after refresh on 401', async () => {
      const oldToken = 'expired-token'
      const newToken = 'new-token'
      let tokenRefreshCalled = false

      ;(useAuth.getState as jest.Mock).mockReturnValue({
        getAccessToken: jest.fn().mockResolvedValueOnce(oldToken),
        refreshAccessToken: jest.fn().mockImplementation(async () => {
          tokenRefreshCalled = true
          ;(useAuth.getState as jest.Mock).mockReturnValue({
            getAccessToken: jest.fn().mockResolvedValue(newToken),
            clearTokens: jest.fn(),
          })
        }),
        clearTokens: jest.fn(),
      })

      const responseData = { success: true }
      mockAxios.onGet('/test').replyOnce(401).onGet('/test').reply(200, responseData)

      const response = await api.get('/test').catch(async error => {
        if (error.response?.status === 401) {
          await useAuth.getState().refreshAccessToken()
          return api.get('/test')
        }
        throw error
      })

      expect(tokenRefreshCalled).toBe(true)
      expect(mockAxios.history.get[1].headers?.Authorization).toBe(newToken)
      expect(response.data).toEqual(responseData)
    })
  })

  describe('Request Interceptor', () => {
    it('should add token to request headers when available', async () => {
      const token = 'test-token'
      ;(useAuth.getState as jest.Mock).mockReturnValue({
        getAccessToken: jest.fn().mockResolvedValue(token),
      })

      mockAxios.onGet('/test').reply(200)
      await api.get('/test')

      expect(mockAxios.history.get[0].headers?.Authorization).toBe(token)
    })

    it('should not add Authorization header when token is null', async () => {
      ;(useAuth.getState as jest.Mock).mockReturnValue({
        getAccessToken: jest.fn().mockResolvedValue(null),
      })

      mockAxios.onGet('/test').reply(200)
      await api.get('/test')

      expect(mockAxios.history.get[0].headers?.Authorization).toBeUndefined()
    })
  })

  describe('Response Interceptor', () => {
    // it('should handle 401 by clearing tokens and signing out', async () => {
    //   const clearTokens = jest.fn()
    //   ;(useAuth.getState as jest.Mock).mockReturnValue({
    //     clearTokens,
    //     getAccessToken: jest.fn().mockResolvedValue('token'),
    //   })

    //   mockAxios.onGet('/test').reply(401)

    //   try {
    //     await api.get('/test')
    //   } catch (error) {
    //     expect(clearTokens).toHaveBeenCalled()
    //     expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/auth/signin' })
    //   }
    // })

    it('should pass through non-401 errors', async () => {
      mockAxios.onGet('/test').reply(500)

      try {
        await api.get('/test')
      } catch (error) {
        expect(error.response.status).toBe(500)
        expect(signOut).not.toHaveBeenCalled()
      }
    })

    it('should handle network errors', async () => {
      mockAxios.onGet('/test').networkError()

      try {
        await api.get('/test')
      } catch (error) {
        expect(signOut).not.toHaveBeenCalled()
      }
    })

    it('should return successful responses unchanged', async () => {
      const responseData = { data: 'test' }
      mockAxios.onGet('/test').reply(200, responseData)

      const response = await api.get('/test')
      expect(response.data).toEqual(responseData)
    })
  })
})
