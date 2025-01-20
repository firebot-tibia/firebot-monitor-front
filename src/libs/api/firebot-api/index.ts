import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

import { BACKEND_URL } from '@/constants/env'
import { TokenManager } from '@/services/auth'

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
})

api.interceptors.request.use(async config => {
  const session = await getSession()
  if (session?.access_token) {
    config.headers.Authorization = session.access_token
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const session = await getSession()
        if (!session?.refresh_token) throw new Error('No refresh token available')

        const tokenManager = TokenManager.getInstance()
        const tokens = await tokenManager.refreshToken(session.refresh_token)

        originalRequest.headers.Authorization = tokens
        return api(originalRequest)
      } catch (refreshError) {
        await signOut({ callbackUrl: '/' })
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
