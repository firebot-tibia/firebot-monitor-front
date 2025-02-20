'use client'
import { useState, useEffect } from 'react'

import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
  chakra,
  shouldForwardProp,
  Tooltip
} from '@chakra-ui/react'
import { motion, isValidMotionProp } from 'framer-motion'
import {
  Activity,
  Map,
  Shield,
  Database,
  ExternalLink,
  CheckCircle,
  Target,
  Bell,
  Eye,
  Crown,
  Sparkles,
  Rocket
} from 'lucide-react'
import Image from 'next/image'

import { routes } from '../../../../../common/constants/routes'

// Chakra motion components
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
})

// Features data
const features = [
  {
    icon: <Activity />,
    title: 'Análise Avançada de Jogadores',
    description: 'Acompanhe EXP, tempo online, e padrões de jogo com gráficos detalhados e análises preditivas.',
    premium: [
      'Histórico completo de EXP por hora',
      'Detecção de padrões de jogo suspeitos',
      'Relatórios personalizados de progresso'
    ],
    highlight: 'Aumente sua eficiência com análises detalhadas'
  },
  {
    icon: <Map />,
    title: 'Rastreamento de Hunts',
    description: 'Sistema inteligente de monitoramento de hunting spots com alertas em tempo real.',
    premium: [
      'Mapa interativo de hunting spots',
      'Histórico detalhado de ocupação',
      'Previsão de disponibilidade'
    ],
    highlight: 'Nunca perca um spot livre novamente'
  },
  {
    icon: <Shield />,
    title: 'Sistema Anti-Maker',
    description: 'Proteção avançada contra makers com alertas instantâneos e análise de comportamento.',
    premium: [
      'Detecção automática de makers',
      'Alertas via Discord e Telegram',
      'Análise de padrões suspeitos'
    ],
    highlight: 'Proteção total contra makers'
  },
  {
    icon: <Database />,
    title: 'Gestão de Respawns',
    description: 'Sistema completo de gestão de respawns com timer inteligente e histórico.',
    premium: [
      'Timer sincronizado com o servidor',
      'Histórico de kills por respawn',
      'Previsão de respawn com IA'
    ],
    highlight: 'Otimize suas rotas de caça'
  },
  {
    icon: <Eye />,
    title: 'Monitoramento Inteligente',
    description: 'Acompanhamento 24/7 com sistema de alertas personalizados e dashboards em tempo real.',
    premium: [
      'Dashboards personalizáveis',
      'Alertas configuráveis',
      'Relatórios automáticos'
    ],
    highlight: 'Controle total do seu jogo'
  },
  {
    icon: <Crown />,
    title: 'Inteligência de Guild',
    description: 'Sistema completo de inteligência para monitorar e analisar atividades de guilds rivais.',
    premium: [
      'Análise de membros online',
      'Rastreamento de territórios',
      'Histórico de guerras'
    ],
    highlight: 'Domine a política do servidor'
  }
]

const BotDescriptions = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <Box w="full" bg="black.900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <Container
          maxW="8xl"
          py={16}
          px={4}
          display="flex"
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          minH="100vh"
        >
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            justify="center"
            gap={8}
            w="full"
            maxW={{ base: "100%", md: "container.md" }}
            mx="auto"
            textAlign={{ base: "center", lg: "left" }}
          >
            {/* Left Side - Content */}
                          <Stack
              spacing={8}
              flex={1}
              align="center"
              textAlign="center"
              maxW={{ base: 'full', lg: '2xl' }}
              px={{ base: 4, sm: 6 }}
              mx="auto"
            >
              <Heading
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                bgGradient="linear(to-r, red.400, orange.400)"
                bgClip="text"
                lineHeight="1.2"
              >
                Firebot Monitor
              </Heading>

              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.400">
                Domine o jogo com as ferramentas mais avançadas do mercado.
                Monitoramento inteligente, análise de dados e proteção anti-maker em tempo real.
              </Text>

              <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={4}
                w="full"
                justify="center"
              >
                <Button
                  size="lg"
                  as="a"
                  href={routes.discordUrl}
                  target="_blank"
                  colorScheme="red"
                  rightIcon={<ExternalLink size={20} />}
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  Começar Agora
                </Button>
                <Button
                  size="lg"
                  as="a"
                  href={routes.discordUrl}
                  target="_blank"
                  variant="outline"
                  colorScheme="red"
                  rightIcon={<Target size={20} />}
                >
                  Ver Demonstração
                </Button>
              </Stack>
            </Stack>

            {/* Right Side - Image */}
            <Box
              position="relative"
              w={{ base: '250px', sm: '300px', md: '400px', lg: '500px' }}
              h={{ base: '250px', sm: '300px', md: '400px', lg: '500px' }}
              mx="auto"
            >
              <Image
                src="/assets/images/og.png"
                alt="Firebot Monitor Logo"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          </Flex>
        </Container>

        {/* Features Section */}
        <Box bg="black.800" py={16}>
          <Container maxW="8xl">
            <Stack spacing={12}>
              <Stack spacing={6} textAlign="center">
                <Heading
                  fontSize={{ base: '3xl', md: '4xl' }}
                  bgGradient="linear(to-r, red.400, orange.400)"
                  bgClip="text"
                >
                  Recursos Exclusivos
                </Heading>
                <Text fontSize="lg" color="gray.400" maxW="2xl" mx="auto">
                  Ferramentas poderosas projetadas para maximizar sua eficiência e domínio no Tibia
                </Text>
              </Stack>

              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                gap={8}
              >
                {features.map((feature, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Tooltip
                      label={feature.highlight}
                      placement="top"
                      hasArrow
                      bg="red.500"
                    >
                      <Box
                        p={6}
                        bg="black.900"
                        borderRadius="xl"
                        borderWidth={1}
                        borderColor="red.500"
                        h="full"
                        transition="all 0.3s"
                        _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                      >
                        <Stack spacing={4}>
                          <Flex align="center" gap={4}>
                            <Box
                              p={2}
                              borderRadius="lg"
                              bg="red.500"
                              color="white"
                              transition="all 0.3s"
                              _groupHover={{ bg: 'red.400' }}
                            >
                              {feature.icon}
                            </Box>
                            <Heading size="md">{feature.title}</Heading>
                          </Flex>

                          <Text color="gray.400">{feature.description}</Text>

                          <Stack spacing={3}>
                            {feature.premium.map((item, i) => (
                              <Flex key={i} gap={2} align="center">
                                <CheckCircle size={16} color="green" />
                                <Text fontSize="sm" color="gray.400">{item}</Text>
                              </Flex>
                            ))}
                          </Stack>
                        </Stack>
                      </Box>
                    </Tooltip>
                  </MotionBox>
                ))}
              </Grid>
            </Stack>
          </Container>
        </Box>

        {/* Pricing Section */}
        <Container maxW="8xl" py={16}>
          <Stack spacing={12}>
            <Stack spacing={6} textAlign="center">
              <Heading
                fontSize={{ base: '3xl', md: '4xl' }}
                bgGradient="linear(to-r, red.400, orange.400)"
                bgClip="text"
              >
                Plano Premium
              </Heading>
              <Text fontSize="lg" color="gray.400" maxW="2xl" mx="auto">
                Desbloqueie todo o potencial do Firebot com nosso plano premium
              </Text>
            </Stack>

            <Flex
              direction={{ base: 'column', lg: 'row' }}
              gap={8}
              align="center"
              justify="center"
            >
              {/* Pricing Card */}
              <MotionBox
                maxW="md"
                w="full"
                bg="black.800"
                borderRadius="2xl"
                borderWidth={1}
                borderColor="red.500"
                p={8}
                whileHover={{ scale: 1.02 }}
              >
                <Stack spacing={6}>
                  <Flex align="center" justify="center" gap={4}>
                    <Image
                      src="/assets/tibiaCoins.gif"
                      alt="Tibia Coins"
                      width={32}
                      height={32}
                    />
                    <Stack spacing={0} textAlign="center">
                      <Text fontSize="3xl" fontWeight="bold">750 Tibia Coins</Text>
                      <Text color="gray.400">por mês</Text>
                    </Stack>
                  </Flex>

                  <Stack spacing={4}>
                    {[
                      {
                        icon: <Sparkles />,
                        title: 'Acesso Premium Completo',
                        description: 'Desbloqueie todo o potencial do Firebot'
                      },
                      {
                        icon: <Bell />,
                        title: 'Suporte 24/7',
                        description: 'Atendimento prioritário via Discord'
                      },
                      {
                        icon: <Target />,
                        title: '7 Dias Grátis',
                        description: 'Teste todas as funcionalidades premium'
                      },
                      {
                        icon: <Rocket />,
                        title: 'Atualizações Constantes',
                        description: 'Novas funcionalidades regularmente'
                      }
                    ].map((feature, index) => (
                      <Flex key={index} align="center" gap={3}>
                        <Box color="red.400">{feature.icon}</Box>
                        <Stack spacing={0}>
                          <Text fontWeight="bold">{feature.title}</Text>
                          <Text color="gray.400" fontSize="sm">{feature.description}</Text>
                        </Stack>
                      </Flex>
                    ))}
                  </Stack>

                  <Button
                    size="lg"
                    w="full"
                    colorScheme="red"
                    rightIcon={<ExternalLink />}
                    onClick={() => window.open(routes.discordUrl, '_blank')}
                  >
                    Começar Avaliação Gratuita
                  </Button>
                </Stack>
              </MotionBox>
            </Flex>
          </Stack>
        </Container>
      </motion.div>
    </Box>
  )
}

export default BotDescriptions
