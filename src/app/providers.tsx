'use client'

import type { ReactNode } from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'

import { LoggerProvider } from '@/core/hooks/useLogger/logger.context'
import theme from '@/core/styles/theme'
import { GuildProvider } from '@/modules/monitoring/contexts/guild-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LoggerProvider config={{ maxHistorySize: 1000, enabled: true }}>
        <ChakraProvider theme={theme}>
          <GuildProvider>
            {children}
          </GuildProvider>
        </ChakraProvider>
      </LoggerProvider>
    </SessionProvider>
  )
}
