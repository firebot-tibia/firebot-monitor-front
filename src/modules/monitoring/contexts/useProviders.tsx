'use client'

import type { FC, ReactNode } from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'

import theme from '@/core/styles/theme'

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </SessionProvider>
  )
}
