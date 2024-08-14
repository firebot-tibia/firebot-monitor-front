'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { createContext, FC, ReactNode } from 'react'
import { createStore } from 'zustand';
import '../styles/globals.css'
import theme from '../styles/theme'
import { ToastProvider } from '../context/toast/toast-context';
import { AuthProvider } from '../context/auth/auth-context';
import { SessionProvider } from "next-auth/react";

interface RootLayoutProps {
  children: ReactNode
}

export const store = createStore();
const StoreContext = createContext({});

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head />
      <body>
        <SessionProvider>
          <ChakraProvider theme={theme}>
            <StoreContext.Provider value={store}>
              <ToastProvider>
                  {children}
              </ToastProvider>
            </StoreContext.Provider>
          </ChakraProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
export default RootLayout;