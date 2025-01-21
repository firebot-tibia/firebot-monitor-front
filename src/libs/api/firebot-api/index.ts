import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

import { BACKEND_URL } from '@/constants/env'
import { Logger } from '@/middlewares/useLogger'
import { TokenManager } from '@/services/auth'

const logger = Logger.getInstance()

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  async config => {
    const startTime = Date.now()

    logger.logApi(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || 'unknown-url',
      {
        headers: config.headers,
        data: config.data,
      },
      startTime,
    )

    const session = await getSession()
    if (session?.access_token) {
      config.headers.Authorization = session.access_token
      logger.debug('Added auth token to request', { url: config.url }, startTime)
    }

    return config
  },
  error => {
    logger.error('API Request Error', error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  async response => {
    const startTime = Date.now()

    logger.logApi(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || 'unknown-url',
      {
        status: response.status,
        data: response.data,
        headers: response.headers,
      },
      startTime,
    )

    const originalRequest = response.config
    if (response?.status === 401) {
      logger.warn('Token expired, attempting refresh', {
        url: originalRequest.url,
      })

      try {
        const session = await getSession()
        if (!session?.refresh_token) {
          throw new Error('No refresh token available')
        }

        const tokenManager = TokenManager.getInstance()
        const tokens = await tokenManager.refreshToken(session.refresh_token)

        logger.info('Token refreshed successfully', {
          url: originalRequest.url,
        })

        originalRequest.headers.setAuthorization(tokens.access_token)
        return api(originalRequest)
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError)
        await signOut({ callbackUrl: '/' })
        return Promise.reject(refreshError)
      }
    }

    return response
  },
  error => {
    logger.error('API Response Error', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    return Promise.reject(error)
  },
)

export default api
