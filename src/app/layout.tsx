// app/layout.tsx
import '../common/styles/globals.css'
import type { Metadata } from 'next'


import { GoogleTagManager } from '@/components/layout/components/google-tag'

import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Firebot Monitor - Monitoramento em tempo real de inimigos',
  description: 'Tenha informações em tempo real da movimentação de seus inimigos no Tibia',
  openGraph: {
    url: 'https://monitor.firebot.run/',
    title: 'Firebot Monitor - Monitoramento em tempo real de inimigos',
    locale: 'pt-br',
    type: 'website',
    description: 'Tenha informações em tempo real da movimentação de seus inimigos no Tibia',
    images: [
      {
        url: 'https://monitor.firebot.run/assets/images/og.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: 'https://monitor.firebot.run/assets/images/og.png',
    title: 'Firebot Monitor - Monitoramento em tempo real de inimigos',
    description: 'Tenha informações em tempo real da movimentação de seus inimigos no Tibia',
    creator: '@firebot.tibia',
    site: 'https://monitor.firebot.run',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <GoogleTagManager />
          {children}
        </Providers>
      </body>
    </html>
  )
}
