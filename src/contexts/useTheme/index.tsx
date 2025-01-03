'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { FC } from 'react'
import { SessionProvider } from 'next-auth/react'
import theme from '../../styles/theme'
import { AppProvidersProps } from './types'

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </SessionProvider>
  )
}
