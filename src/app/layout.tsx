'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { FC, ReactNode } from 'react'
import '../styles/globals.css'
import theme from '../styles/theme'
import { ToastProvider } from '../context/toast/toast-context';
import { SessionProvider } from "next-auth/react";

interface RootLayoutProps {
  children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head />
      <body>
        <SessionProvider>
          <ChakraProvider theme={theme}>
              <ToastProvider>
                  {children}
              </ToastProvider>
          </ChakraProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
export default RootLayout;