import axios from 'axios'
import { signOut } from 'next-auth/react'

import { useAuth } from '../../../components/features/auth/hooks/useAuth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

api.interceptors.request.use(async config => {
  const token = await useAuth.getState().getAccessToken()
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      useAuth.getState().clearTokens()
      await signOut({ callbackUrl: '/' })
    }
    return Promise.reject(error)
  },
)

export default api
