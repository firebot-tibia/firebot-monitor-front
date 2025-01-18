'use client'

import type { FC } from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'

import type { AppProvidersProps } from './types'
import theme from '../../styles/theme'

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </SessionProvider>
  )
}
