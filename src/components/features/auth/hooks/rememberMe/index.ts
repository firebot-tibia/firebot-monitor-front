import { useCallback } from 'react'

interface LastLogin {
  email: string
  password: string
}

export const useLastLogin = () => {
  const getLastLogin = useCallback((): LastLogin | null => {
    try {
      const savedLogin = localStorage.getItem('last-login')
      if (!savedLogin) return null

      const parsedLogin = JSON.parse(savedLogin)
      if (!parsedLogin?.email || !parsedLogin?.password) {
        localStorage.removeItem('last-login')
        return null
      }

      return parsedLogin
    } catch (error) {
      console.error('Error getting saved login:', error)
      return null
    }
  }, [])

  const saveLastLogin = useCallback((email: string, password: string) => {
    if (!email || !password) return

    try {
      const loginData = { email, password }
      localStorage.setItem('last-login', JSON.stringify(loginData))
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
