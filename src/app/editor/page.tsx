import type { Metadata } from 'next'

import Editor from '../../modules/editor'

export const metadata: Metadata = {
  title: 'Firebot Monitor - Editor de descrição',
  description: 'Editar descrição para inserir no teamspeak',
  openGraph: {
    url: 'https://monitor.firebot.run/editor',
    title: 'Firebot Monitor - Editor de descrição',
    locale: 'pt-br',
    type: 'website',
    description: 'Editar descrição para inserir no teamspeak',
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
    title: 'Firebot Monitor - Editor de descrição',
    description: 'Editar descrição para inserir no teamspeak',
    creator: '@firebot.tibia',
    site: 'https://monitor.firebot.run/editor',
  },
}

export default function EditorPage() {
  return <Editor />
}
