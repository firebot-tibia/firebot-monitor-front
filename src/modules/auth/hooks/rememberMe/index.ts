import { useCallback } from 'react'

interface LastLogin {
  email: string
  password: string
}

export const useLastLogin = () => {
  const getLastLogin = useCallback((): LastLogin | null => {
    try {
      const savedLogin = typeof window !== 'undefined' ? localStorage.getItem('last-login') : null
      if (!savedLogin) return null

      const parsedLogin = JSON.parse(savedLogin)
      if (!parsedLogin?.email || !parsedLogin?.password) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('last-login')
        }
        return null
      }

      return parsedLogin
    } catch (error) {
      return null
    }
  }, [])

  const saveLastLogin = useCallback((email: string, password: string) => {
    if (!email || !password) return

    const loginData = { email, password }
    if (typeof window !== 'undefined') {
      localStorage.setItem('last-login', JSON.stringify(loginData))
    }
  }, [])

  const clearLastLogin = useCallback(() => {
    localStorage.removeItem('last-login')
  }, [])

  return {
    getLastLogin,
    saveLastLogin,
    clearLastLogin,
  }
}
