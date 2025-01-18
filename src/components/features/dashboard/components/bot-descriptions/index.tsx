'use client'
import { useState, useEffect } from 'react'

import {
  Activity,
  Users,
  Map,
  Shield,
  Clock,
  Database,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { routes } from '../../../../../constants/routes'

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="mb-8 flex flex-col items-center space-y-4">
      <div className="h-8 w-64 rounded bg-gray-700"></div>
      <div className="h-4 w-48 rounded bg-gray-700"></div>
      <div className="h-6 w-32 rounded bg-gray-700"></div>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl bg-gray-800/50 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center">
            <div className="mr-4 h-10 w-10 rounded-xl bg-gray-700"></div>
            <div className="h-4 w-32 rounded bg-gray-700"></div>
          </div>
          <div className="mb-2 h-4 w-full rounded bg-gray-700"></div>
          <div className="h-4 w-3/4 rounded bg-gray-700"></div>
        </div>
      ))}
    </div>
  </div>
)

const BotDescriptions = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: <Activity className="h-6 w-6" />,
      title: 'Análise de Jogadores',
      description: 'EXP, tempo online e padrões de jogo com estatísticas detalhadas',
    },
    {
      icon: <Map className="h-6 w-6" />,
      title: 'Locais de Hunt',
      description: 'Monitoramento de hunting spots e tracking online em tempo real',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Alertas de Maker',
      description: 'Receba notificações instantâneas sobre possíveis ataques maker',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Respawn Planilhado',
      description: 'Sistema avançado substituindo planilhas tradicionais',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Monitoramento 24/7',
      description: 'Acompanhamento contínuo com atualizações instantâneas',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Inteligência de Guild',
      description: 'Sistema completo para monitorar atividades rivais',
    },
  ]

  const pricingFeatures = [
    'Acesso completo a todas as funcionalidades',
    'Suporte premium via Discord',
    '7 dias de avaliação gratuita',
    'Cancelamento a qualquer momento',
    'Atualizações constantes',
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Skeleton />
      </div>
    )
  }

  return (
    <div
      className={`container mx-auto max-w-6xl px-4 py-8 transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      {/* Hero Section */}
      <div className="mb-16 space-y-6 text-center">
        <div className="relative mx-auto mb-8 h-64 w-64">
          <Image
            src="/assets/images/og.png"
            alt="Firebot Monitor Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <p className="text-xl font-light text-gray-300 md:text-2xl">
          Sistema Avançado de Monitoramento para Tibia
        </p>

        {/* Pricing Card */}
        <div className="mx-auto max-w-lg rounded-2xl border border-red-500/20 bg-gray-800/50 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-center gap-4">
            <Image
              src="/assets/tibiaCoins.gif"
              alt="Tibia Coins"
              width={32}
              height={32}
              className="animate-bounce"
            />
            <div className="text-center">
              <div className="text-3xl font-bold">1500 Tibia Coins</div>
              <div className="text-gray-400">por mês</div>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            {pricingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-5 w-5 text-red-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href={routes.discordUrl}
            target="_blank"
            className="group block w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-8 py-4 text-center text-xl font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-red-500/20"
          >
            Começar Avaliação Gratuita
            <ExternalLink className="ml-2 inline-block h-5 w-5 opacity-75" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group rounded-xl border border-gray-700/50 bg-gray-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-red-600 to-red-500 p-3 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium">{feature.title}</h3>
            </div>
            <p className="leading-relaxed text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Integration Section */}
      <div className="mb-16 rounded-xl border border-gray-700/50 bg-gray-800/50 p-10 backdrop-blur-sm">
        <h2 className="mb-4 bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
          Integração com Tibia Maps
        </h2>
        <p className="mx-auto mb-6 max-w-2xl text-center text-lg leading-relaxed text-gray-300">
          Integração perfeita com a plataforma líder de mapas do Tibia para rastreamento e
          monitoramento aprimorados
        </p>
        <div className="text-center">
          <Link
            href="https://tibiamaps.io/"
            target="_blank"
            className="inline-flex items-center gap-2 text-red-400 transition-colors hover:text-red-300"
          >
            Visite tibiamaps.io
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-2xl bg-gradient-to-br from-red-700 to-red-900 p-12 text-center shadow-xl">
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
          Pronto para melhorar a inteligência da sua guild?
        </h2>
        <p className="mb-4 text-xl text-gray-200">Experimente gratuitamente por 7 dias</p>
        <p className="mb-8 text-gray-300">Sem compromisso - Cancele quando quiser</p>
        <Link
          href={routes.discordUrl}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-medium text-red-600 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-50 hover:shadow-white/20"
        >
          Começar Agora
          <ExternalLink className="h-5 w-5 opacity-75" />
        </Link>
      </div>
    </div>
  )
}

export default BotDescriptions
