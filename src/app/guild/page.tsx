import type { Metadata } from 'next'

import GuildContainer from '../../modules/monitoring/components/guild-container'

export const metadata: Metadata = {
  title: 'Firebot Monitor - Guilds',
  description: 'Informações da guilda inimiga',
  openGraph: {
    url: 'https://monitor.firebot.run/',
    title: 'Firebot Monitor - Guilds',
    locale: 'pt-br',
    type: 'website',
    description: 'Informações da guilda inimiga',
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
    title: 'Firebot Monitor - Guilds',
    description: 'Informações da guilda inimiga',
    creator: '@firebot.tibia',
    site: 'https://monitor.firebot.run',
  },
}

export default function GuildPage() {
  return (
      <GuildContainer />
  )
}
