import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enemy Monitor - Monitoramento em tempo real de inimigos',
  description: 'Monitore seus inimigos realtime no tibia, sem precisar de spy',
  openGraph: {
    url: 'https://monitor.firebot.run/',
    title: 'Enemy Monitor - Monitoramento em tempo real de inimigos',
    locale: 'pt-br',
    type: 'website',
    description: 'Monitore seus inimigos realtime no tibia, sem precisar de spy',
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
    title: 'Enemy Monitor - Monitoramento em tempo real de inimigos',
    description: 'Monitore seus inimigos realtime no tibia, sem precisar de spy',
    creator: '@firebot.tibia',
    site: 'https://monitor.firebot.run',
  },
}

export { default } from './auth/index'


