'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { FC, ReactNode } from 'react'
import '../styles/globals.css'
import theme from '../styles/theme'

interface RootLayoutProps {
  children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head />
      <body>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </body>
    </html>
  )
}
export default RootLayout
