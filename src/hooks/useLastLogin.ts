import { useCallback } from 'react'

interface LastLogin {
  email: string
  password: string
}

export const useLastLogin = () => {
  const getLastLogin = useCallback((): LastLogin | null => {
    try {
      const savedLogin = localStorage.getItem('last-login')
      return savedLogin ? JSON.parse(savedLogin) : null
    } catch {
      return null
    }
  }, [])

  const saveLastLogin = useCallback((email: string, password: string) => {
    try {
      localStorage.setItem('last-login', JSON.stringify({ email, password }))
    } catch (error) {
      console.error('Failed to save login:', error)
    }
  }, [])

  const clearLastLogin = useCallback(() => {
    try {
      localStorage.removeItem('last-login')
    } catch (error) {
      console.error('Failed to clear login:', error)
    }
  }, [])

  return {
    getLastLogin,
    saveLastLogin,
    clearLastLogin,
  }
}
