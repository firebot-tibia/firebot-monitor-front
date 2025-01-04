'use client'
import { useState, useEffect } from 'react';
import { Activity, Users, Map, Shield, Clock, Database, ExternalLink, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { routes } from '../../../../../constants/routes';

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="flex flex-col items-center space-y-4 mb-8">
      <div className="h-8 bg-gray-700 rounded w-64"></div>
      <div className="h-4 bg-gray-700 rounded w-48"></div>
      <div className="h-6 bg-gray-700 rounded w-32"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-700 rounded-xl mr-4"></div>
            <div className="h-4 bg-gray-700 rounded w-32"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  </div>
);

const BotDescriptions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Análise de Jogadores",
      description: "EXP, tempo online e padrões de jogo com estatísticas detalhadas"
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Locais de Hunt",
      description: "Monitoramento de hunting spots e tracking online em tempo real"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Alertas de Maker",
      description: "Receba notificações instantâneas sobre possíveis ataques maker"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Respawn Planilhado",
      description: "Sistema avançado substituindo planilhas tradicionais"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Monitoramento 24/7",
      description: "Acompanhamento contínuo com atualizações instantâneas"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Inteligência de Guild",
      description: "Sistema completo para monitorar atividades rivais"
    }
  ];

  const pricingFeatures = [
    "Acesso completo a todas as funcionalidades",
    "Suporte premium via Discord",
    "7 dias de avaliação gratuita",
    "Cancelamento a qualquer momento",
    "Atualizações constantes"
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton />
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-6xl transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-6">
        <div className="relative w-64 h-64 mx-auto mb-8">
          <Image
            src="/assets/images/og.png"
            alt="Firebot Monitor Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <p className="text-xl md:text-2xl text-gray-300 font-light">
          Sistema Avançado de Monitoramento para Tibia
        </p>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20 shadow-xl">
          <div className="flex justify-center items-center gap-4 mb-6">
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

          <div className="space-y-3 mb-6">
            {pricingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Link 
            href={routes.discordUrl} 
            target="_blank"
            className="block w-full bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-xl text-xl font-medium shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:-translate-y-1 text-center group"
          >
            Começar Avaliação Gratuita
            <ExternalLink className="w-5 h-5 opacity-75 inline-block ml-2" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium">{feature.title}</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Integration Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-10 mb-16 border border-gray-700/50">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
          Integração com Tibia Maps
        </h2>
        <p className="text-gray-300 text-lg text-center max-w-2xl mx-auto leading-relaxed mb-6">
          Integração perfeita com a plataforma líder de mapas do Tibia para rastreamento e monitoramento aprimorados
        </p>
        <div className="text-center">
          <Link 
            href="https://tibiamaps.io/"
            target="_blank"
            className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            Visite tibiamaps.io
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-12 text-center shadow-xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Pronto para melhorar a inteligência da sua guild?
        </h2>
        <p className="text-xl mb-4 text-gray-200">
          Experimente gratuitamente por 7 dias
        </p>
        <p className="text-gray-300 mb-8">
          Sem compromisso - Cancele quando quiser
        </p>
        <Link 
          href={routes.discordUrl}
          target="_blank" 
          className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-white/20"
        >
          Começar Agora
          <ExternalLink className="w-5 h-5 opacity-75" />
        </Link>
      </div>
    </div>
  );
};

export default BotDescriptions;