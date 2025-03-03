import { useCallback } from 'react'

import { useToast } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'

export const usePermission = () => {
  const { data: session } = useSession()
  const toast = useToast()

  const checkPermission = useCallback(() => {
    if (!session?.access_token) {
      return false
    }
    try {
      const payload = session.access_token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      const userStatus = decoded?.status
      if (userStatus !== 'admin' && userStatus !== 'bot-admin') {
        toast({
          title: 'Permissão negada',
          description: 'Você não tem permissão para editar estas informações.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return false
      }
      return true
    } catch (error) {
      throw error
    }
  }, [session, toast])

  return checkPermission
}
