import { Box } from '@chakra-ui/react'
import type { Metadata } from 'next'

import Maps from '../../components/features/tibia-map'
import DashboardLayout from '../../components/layout'

export const metadata: Metadata = {
  title: 'Firebot Monitor - Mapa do Exiva',
  description: 'Mapa global do tibia com exiva',
  openGraph: {
    url: 'https://monitor.firebot.run/tibia-map',
    title: 'Firebot Monitor - Mapa do Exiva',
    locale: 'pt-br',
    type: 'website',
    description: 'Mapa global do tibia com exiva',
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
    title: 'Firebot Monitor - Mapa do Exiva',
    description: 'Mapa global do tibia com exiva',
    creator: '@firebot.tibia',
    site: 'https://monitor.firebot.run/tibia-map',
  },
}

const TibiaMaps = () => {
  return (
    <DashboardLayout>
      <Box p={4}>
        <Maps />
      </Box>
    </DashboardLayout>
  )
}

export default TibiaMaps
