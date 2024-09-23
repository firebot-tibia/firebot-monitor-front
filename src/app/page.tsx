import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enemy Monitor',
  description: 'Enemy Monitor',
  openGraph: {
    url: ``,
    title: 'Enemy Monitor',
    locale: 'pt-br',
    type: 'website',
    description: 'Enemy Monitor',
    images: [
      {
        url: '`https://monitor.firebot.run/assets/enemy.png`',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: `https://monitor.firebot.run/assets/enemy.png`,
    title: 'Enemy Monitor',
    description: "Monitore seus inimigos realtime",
    creator: '@firebot.tibia',
    site: 'https://monitor.firebot.run',
  },
}

export { default } from './auth/index'
