'use client'
import React, { useEffect, useState } from 'react'

import { Box, Button, Flex, Heading, Spinner, Text, VStack } from '@chakra-ui/react'
import { useParams, useRouter } from 'next/navigation'

import {
  getPlayerExperienceHistory,
  getPlayerOnlineHistory,
  getPlayersLifeTimeDeaths,
} from '../../services'
import type { ExperienceDataItem } from '../../types/guild-stats-experience-history.interface'
import type { OnlineTimeDay, PlayerDeaths } from '../../types/guild-stats-player.interface'
import PlayerDashboard from '../player-dashboard'

const CharacterStatsPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  // Process the URL parameter for display - convert + to spaces and decode other encoded chars
  const characterName = decodeURIComponent((params['character-name'] as string)?.replace(/\+/g, ' '))

  const [onlineHistory, setOnlineHistory] = useState<OnlineTimeDay[]>([])
  const [experienceData, setExperienceData] = useState<ExperienceDataItem[]>([])
  const [deathData, setDeathData] = useState<PlayerDeaths | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const textColor = 'text-white'
  const accentColor = 'bg-red-800'

  useEffect(() => {
    const fetchData = async () => {
      if (!characterName) return

      try {
        setLoading(true)
        setError(null)

        const [onlineData, deathsData, experience] = await Promise.all([
          getPlayerOnlineHistory({ character: characterName }),
          getPlayersLifeTimeDeaths({ character: characterName }),
          getPlayerExperienceHistory({ character: characterName }),
        ])

        setOnlineHistory(onlineData?.online_time?.online_time_days ?? [])
        setExperienceData(experience?.experience_history?.character_experience_messages ?? [])
        setDeathData(deathsData?.deaths ?? null)
      } catch (err) {
        setError('Falha ao buscar dados do jogador. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [characterName])

  const handleBack = () => {
    router.back()
  }

  return (
    <Box className="min-h-screen w-full px-4 py-8">
      <VStack className="mx-auto max-w-[1400px] space-y-6">
        <Flex className="w-full items-center justify-between">
          <Button onClick={handleBack} className={`${accentColor} ${textColor} hover:bg-red-900`}>
            Voltar
          </Button>
        </Flex>

        <Heading className={textColor}>{characterName || 'Jogador Desconhecido'}</Heading>

        {loading ? (
          <VStack className="space-y-4">
            <Spinner className={`h-8 w-8 text-red-800`} />
            <Text className={textColor}>Carregando...</Text>
          </VStack>
        ) : error ? (
          <Box className="w-full rounded-md bg-red-900/20 p-4">
            <Text className="text-red-500">{error}</Text>
          </Box>
        ) : characterName ? (
          <PlayerDashboard
            experienceData={experienceData}
            onlineHistory={onlineHistory}
            deathData={deathData}
          />
        ) : (
          <Text className={textColor}>Nenhum jogador selecionado</Text>
        )}
      </VStack>
    </Box>
  )
}

export default CharacterStatsPage
