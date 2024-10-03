'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { FC, ReactNode } from 'react'
import theme from '../styles/theme'
import { SessionProvider } from "next-auth/react";
import { GeistProvider } from '@geist-ui/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface AppProvidersProps {
  children: ReactNode
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <GeistProvider>
        <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        </ChakraProvider>
      </GeistProvider>
    </SessionProvider>
  )
}