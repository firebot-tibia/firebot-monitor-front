'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { createContext, FC, ReactNode } from 'react'
import { createStore } from 'zustand';
import '../styles/globals.css'
import theme from '../styles/theme'
import { ToastProvider } from '../context/toast/toast-context';
import { AuthProvider } from '../context/auth/auth-context';

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
        <ChakraProvider theme={theme}>
          <StoreContext.Provider value={store}>
            <ToastProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
           </ToastProvider>
          </StoreContext.Provider>
        </ChakraProvider>
      </body>
    </html>
  )
}
export default RootLayout;