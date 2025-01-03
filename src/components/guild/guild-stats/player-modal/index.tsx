'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnlineTimeDay, PlayerDeaths } from '../interfaces/guild-stats-player.interface'
import PlayerDashboard from './player-dashboard'
import { ExperienceDataItem } from '../interfaces/guild-stats-experience-history.interface'
import { VStack, Flex, Button, Spinner, Heading, Text, Box } from '@chakra-ui/react'
import { getPlayerOnlineHistory, getPlayersLifeTimeDeaths, getPlayerExperienceHistory } from '../../../../services/guild-stats.service'


const CharacterStatsPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const characterName = decodeURIComponent(params['character-name'] as string)

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
        console.error('Error fetching player data:', err)
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
    <Box className="w-full min-h-screen py-8 px-4">
      <VStack className="space-y-6 max-w-[1400px] mx-auto">
        <Flex className="w-full justify-between items-center">
          <Button onClick={handleBack} className={`${accentColor} ${textColor} hover:bg-red-900`}>
            Voltar
          </Button>
        </Flex>

        <Heading className={textColor}>{characterName || 'Jogador Desconhecido'}</Heading>

        {loading ? (
          <VStack className="space-y-4">
            <Spinner className={`text-red-800 h-8 w-8`} />
            <Text className={textColor}>Carregando...</Text>
          </VStack>
        ) : error ? (
          <Box className="w-full p-4 bg-red-900/20 rounded-md">
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
