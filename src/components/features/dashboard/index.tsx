'use client'

import { useState, useEffect } from 'react'

import { motion } from 'framer-motion'
import { ExternalLink, Target, Bell, Sparkles, Rocket } from 'lucide-react'
import Image from 'next/image'

import { routes } from '@/common/constants/routes'

import { staggerContainer, fadeInUp, features } from './constants'
import { FeatureCard } from './feature-card'
import { PricingFeature } from './pricing-feature'
import type { Feature } from './types'

const BotDescriptions = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen w-full bg-black">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <section className="relative min-h-screen w-full py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center lg:flex-row lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex w-full max-w-2xl flex-col items-center space-y-8 text-center"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl lg:text-6xl"
                >
                  Firebot Monitor
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg text-gray-400 sm:text-xl"
                >
                  Domine o jogo com as ferramentas mais avançadas do mercado. Monitoramento
                  inteligente, análise de dados e proteção anti-maker em tempo real.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center"
                >
                  <a
                    href={routes.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/25"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Começar Agora
                      <ExternalLink className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </a>

                  <a
                    href={routes.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-lg border border-red-500 px-6 py-3 text-white transition-all duration-300 hover:bg-red-500/10"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Ver Demonstração
                      <Target className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    </span>
                  </a>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-12 w-full max-w-lg lg:mt-0"
              >
                <div className="relative mx-auto aspect-square w-full max-w-[500px]">
                  <Image
                    src="/assets/images/og.png"
                    alt="Firebot Monitor Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-black py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-12"
            >
              <motion.div variants={fadeInUp} className="text-center">
                <h2 className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                  Recursos Exclusivos
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
                  Ferramentas poderosas projetadas para maximizar sua eficiência e domínio no Tibia
                </p>
              </motion.div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature: Feature, index: any) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="w-full py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-12"
            >
              <motion.div variants={fadeInUp} className="text-center">
                <h2 className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                  Plano Premium
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
                  Desbloqueie todo o potencial do Firebot com nosso plano premium
                </p>
              </motion.div>

              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500 bg-gradient-to-b from-black to-black/80 p-8 shadow-lg backdrop-blur-sm"
                >
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 opacity-0 transition-opacity duration-500 hover:opacity-100" />

                  <div className="relative z-10 space-y-6">
                    <motion.div
                      variants={fadeInUp}
                      className="flex items-center justify-center gap-4"
                    >
                      <div className="relative h-8 w-8">
                        <Image
                          src="/assets/tibiaCoins.gif"
                          alt="Tibia Coins"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">750 Tibia Coins</p>
                        <p className="text-gray-400">por mês</p>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerContainer} className="space-y-4">
                      <PricingFeature
                        icon={<Sparkles className="h-6 w-6" />}
                        title="Acesso Premium Completo"
                        description="Desbloqueie todo o potencial do Firebot"
                      />
                      <PricingFeature
                        icon={<Bell className="h-6 w-6" />}
                        title="Suporte 24/7"
                        description="Atendimento prioritário via Discord"
                      />
                      <PricingFeature
                        icon={<Target className="h-6 w-6" />}
                        title="7 Dias Grátis"
                        description="Teste todas as funcionalidades premium"
                      />
                      <PricingFeature
                        icon={<Rocket className="h-6 w-6" />}
                        title="Atualizações Constantes"
                        description="Novas funcionalidades regularmente"
                      />
                    </motion.div>

                    <motion.a
                      href={routes.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variants={fadeInUp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                    >
                      <span className="flex items-center gap-2">
                        Começar Avaliação Gratuita
                        <ExternalLink className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                      </span>
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </div>
  )
}

export default BotDescriptions
