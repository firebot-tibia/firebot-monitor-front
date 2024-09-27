'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { FC, ReactNode } from 'react'
import '../styles/globals.css'
import theme from '../styles/theme'
import { SessionProvider } from "next-auth/react";
import { GeistProvider } from '@geist-ui/core';

interface RootLayoutProps {
  children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
      <link rel="manifest" href="/site.webmanifest"/>
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
      <meta name="msapplication-TileColor" content="#da532c"/>
      <meta name="theme-color" content="#ffffff"/>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="keywords"
          content="tsbot, ts host, tibia, tibia bot, tibia tsbot, bot tibia, bot para teamspeak, firebot, tibia wars, teamspeak, servidor teamspeak, tsbot host"
        />
      </head>
      <body>
      <GeistProvider>
        <SessionProvider>
          <ChakraProvider theme={theme}>
            {children}
          </ChakraProvider>
        </SessionProvider>
        </GeistProvider>
      </body>
    </html>
  )
}
export default RootLayout;