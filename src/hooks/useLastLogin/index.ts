import { useStorageStore } from '@/stores/storage-store'

interface LastLogin {
  email: string
  password: string
}

export const useLastLogin = () => {
  const storage = useStorageStore()

  const saveLastLogin = (email: string, password: string) => {
    storage.setItem('lastLogin', { email, password })
  }

  const getLastLogin = (): LastLogin | null => {
    return storage.getItem('lastLogin', null)
  }

  const clearLastLogin = () => {
    storage.removeItem('lastLogin')
  }

  return {
    saveLastLogin,
    getLastLogin,
    clearLastLogin,
  }
}
