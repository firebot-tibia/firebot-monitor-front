import MockAdapter from 'axios-mock-adapter'
import api from '..'
import { useAuth } from '../../../../components/features/auth/hooks/useAuth'

jest.mock('@/components/features/auth/hooks/useAuth')

describe('API Client', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(api)
  })

  afterEach(() => {
    mockAxios.reset()
  })

  it('should handle token refresh on 401', async () => {
    const initialToken = 'expired-token'
    const refreshedToken = 'new-token'
    let tokenRefreshCalled = false

    ;(useAuth.getState as jest.Mock).mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValueOnce(initialToken),
      refreshAccessToken: jest.fn().mockImplementation(async () => {
        tokenRefreshCalled = true
        ;(useAuth.getState as jest.Mock).mockReturnValue({
          getAccessToken: jest.fn().mockResolvedValue(refreshedToken),
        })
      }),
      clearTokens: jest.fn(),
    })

    mockAxios.onGet('/test').replyOnce(401).onGet('/test').reply(200)

    await api.get('/test').catch(async (error) => {
      if (error.response.status === 401) {
        await useAuth.getState().refreshAccessToken()
        return api.get('/test')
      }
    })
    const secondResponse = await api.get('/test')
    expect(secondResponse.status).toBe(200)
    expect(mockAxios.history.get[1].headers?.Authorization).toBe(refreshedToken)
  })

  it('should retry failed requests with new token', async () => {
    const expiredToken = 'expired'
    const newToken = 'refreshed'

    ;(useAuth.getState as jest.Mock).mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValueOnce(expiredToken).mockResolvedValueOnce(newToken),
      refreshAccessToken: jest.fn().mockImplementation(async () => {
        ;(useAuth.getState as jest.Mock).mockReturnValue({
          getAccessToken: jest.fn().mockResolvedValue(newToken),
          clearTokens: jest.fn(),
        })
      }),
      clearTokens: jest.fn(),
    })

    mockAxios
      .onGet('/protected')
      .replyOnce((config) => [401])
      .onGet('/protected')
      .reply(200, { data: 'success' })

    const response = await api.get('/protected').catch(async (error) => {
      await useAuth.getState().refreshAccessToken()
      return api.get('/protected')
    })

    expect(mockAxios.history.get).toHaveLength(2)
    expect(response.data).toEqual({ data: 'success' })
  })
})
