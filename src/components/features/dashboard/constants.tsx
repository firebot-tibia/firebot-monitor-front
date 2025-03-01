import { Activity, Map, Shield, Database, Crown, Eye } from 'lucide-react'

import type { Feature } from './types'

export const features: Feature[] = [
  {
    icon: <Activity className="h-6 w-6" />,
    title: 'Análise Avançada de Jogadores',
    description:
      'Acompanhe EXP, tempo online, e padrões de jogo com gráficos detalhados e análises preditivas.',
    premium: [
      'Histórico completo de EXP por hora',
      'Detecção de padrões de jogo suspeitos',
      'Relatórios personalizados de progresso',
    ],
    highlight: 'Aumente sua eficiência com análises detalhadas',
  },
  {
    icon: <Map className="h-6 w-6" />,
    title: 'Rastreamento de Hunts',
    description: 'Sistema inteligente de monitoramento de hunting spots com alertas em tempo real.',
    premium: [
      'Mapa interativo de hunting spots',
      'Histórico detalhado de ocupação',
      'Previsão de disponibilidade',
    ],
    highlight: 'Nunca perca um spot livre novamente',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Sistema Anti-Maker',
    description:
      'Proteção avançada contra makers com alertas instantâneos e análise de comportamento.',
    premium: [
      'Detecção automática de makers',
      'Alertas via Discord e Telegram',
      'Análise de padrões suspeitos',
    ],
    highlight: 'Proteção total contra makers',
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: 'Gestão de Respawns',
    description: 'Sistema completo de gestão de respawns com timer inteligente e histórico.',
    premium: [
      'Timer sincronizado com o servidor',
      'Histórico de kills por respawn',
      'Previsão de respawn com IA',
    ],
    highlight: 'Otimize suas rotas de caça',
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: 'Monitoramento Inteligente',
    description:
      'Acompanhamento 24/7 com sistema de alertas personalizados e dashboards em tempo real.',
    premium: ['Dashboards personalizáveis', 'Alertas configuráveis', 'Relatórios automáticos'],
    highlight: 'Controle total do seu jogo',
  },
  {
    icon: <Crown className="h-6 w-6" />,
    title: 'Inteligência de Guild',
    description:
      'Sistema completo de inteligência para monitorar e analisar atividades de guilds rivais.',
    premium: ['Análise de membros online', 'Rastreamento de territórios', 'Histórico de guerras'],
    highlight: 'Domine a política do servidor',
  },
]

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}
