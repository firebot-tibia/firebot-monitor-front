'use client'

import { useEffect } from 'react'

import { useSession } from 'next-auth/react'

import { useTokenStore } from '../../store/token-decoded-store'

export function TokenInitializer() {
  const { data: session } = useSession()
  const { decodeAndSetToken } = useTokenStore()

  useEffect(() => {
    if (session?.access_token) {
      decodeAndSetToken(session.access_token)
    }
  }, [session?.access_token, decodeAndSetToken])

  return null
}
