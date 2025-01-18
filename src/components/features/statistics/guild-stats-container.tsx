'use client'
import React, { useCallback, useEffect, useState } from 'react'

import {
  Box,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { Pagination } from '@/components/ui'
import { routes } from '@/constants/routes'
import { useGuildStatsStore } from '@/stores/guild-stats-store'

import FilterBar from './components/filter-bar'
import GuildTable from './components/table'

const GuildStatsContainer: React.FC = () => {
  const {
    filter,
    vocationFilter,
    nameFilter,
    allyGainData,
    allyLossData,
    enemyGainData,
    enemyLossData,
    allyGainPage,
    allyLossPage,
    enemyGainPage,
    enemyLossPage,
    loading,
    setFilter,
    setVocationFilter,
    setNameFilter,
    setPage,
    fetchGuildStats,
  } = useGuildStatsStore()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const router = useRouter()

  const bgColor = 'black.800'
  const softRedColor = 'red.400'
  const borderColor = 'white.700'

  useEffect(() => {
    fetchGuildStats('ally')
    fetchGuildStats('enemy')
  }, [fetchGuildStats])

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      setFilter(newFilter)
    },
    [setFilter],
  )

  const handleVocationFilterChange = useCallback(
    (newVocation: string) => {
      setVocationFilter(newVocation)
    },
    [setVocationFilter],
  )

  const handleNameFilterChange = useCallback(
    (newName: string) => {
      setNameFilter(newName)
      const characterExists = [allyGainData, allyLossData, enemyGainData, enemyLossData].some(
        data => data.data.some(player => player.name.toLowerCase() === newName.toLowerCase()),
      )

      if (!characterExists) {
        router.push(`${routes.statistics}/${encodeURIComponent(newName)}`)
      }
    },
    [allyGainData, allyLossData, enemyGainData, enemyLossData, setNameFilter, router],
  )

  const handlePageChange = useCallback(
    (guildType: 'allyGain' | 'allyLoss' | 'enemyGain' | 'enemyLoss', pageNumber: number) => {
      setPage(guildType, pageNumber)
    },
    [setPage],
  )

  const handleCharacterClick = useCallback(
    (characterName: string) => {
      router.push(`${routes.statistics}/${encodeURIComponent(characterName)}`)
    },
    [router],
  )

  return (
    <Box width="100%" bg={bgColor} minH="100vh" py={8} style={{ zoom: `${80}%` }}>
      <VStack spacing={6} align="stretch" maxWidth="1400px" mx="auto" px={4}>
        <FilterBar
          filter={filter}
          vocationFilter={vocationFilter}
          nameFilter={nameFilter}
          onFilterChange={handleFilterChange}
          onVocationFilterChange={handleVocationFilterChange}
          onNameFilterChange={handleNameFilterChange}
          allyGainData={allyGainData}
          allyLossData={allyLossData}
          enemyGainData={enemyGainData}
          enemyLossData={enemyLossData}
        />

        <Tabs variant="soft-rounded" colorScheme="red">
          <TabList>
            <Tab color="white" _selected={{ color: 'white', bg: softRedColor }}>
              Aliados
            </Tab>
            <Tab color="white" _selected={{ color: 'white', bg: softRedColor }}>
              Inimigos
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={[1, null, 2]} spacing={6}>
                <Box bg={bgColor} borderRadius="md" borderWidth={1} borderColor={borderColor} p={4}>
                  <VStack spacing={4}>
                    <GuildTable
                      guildType="allyGain"
                      guildData={allyGainData}
                      filter={filter}
                      onCharacterClick={handleCharacterClick}
                      isLoading={loading}
                    />
                    <Pagination
                      currentPage={allyGainPage}
                      totalPages={allyGainData.totalPages}
                      onPageChange={newPage => handlePageChange('allyGain', newPage)}
                    />
                  </VStack>
                </Box>
                <Box bg={bgColor} borderRadius="md" borderWidth={1} borderColor={borderColor} p={4}>
                  <VStack spacing={4}>
                    <GuildTable
                      guildType="allyLoss"
                      guildData={allyLossData}
                      filter={filter}
                      onCharacterClick={handleCharacterClick}
                      isLoading={loading}
                    />
                    <Pagination
                      currentPage={allyLossPage}
                      totalPages={allyLossData.totalPages}
                      onPageChange={newPage => handlePageChange('allyLoss', newPage)}
                    />
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <SimpleGrid columns={[1, null, 2]} spacing={6}>
                <Box bg={bgColor} borderRadius="md" borderWidth={1} borderColor={borderColor} p={4}>
                  <VStack spacing={4}>
                    <GuildTable
                      guildType="enemyGain"
                      guildData={enemyGainData}
                      filter={filter}
                      onCharacterClick={handleCharacterClick}
                      isLoading={loading}
                    />
                    <Pagination
                      currentPage={enemyGainPage}
                      totalPages={enemyGainData.totalPages}
                      onPageChange={newPage => handlePageChange('enemyGain', newPage)}
                    />
                  </VStack>
                </Box>
                <Box bg={bgColor} borderRadius="md" borderWidth={1} borderColor={borderColor} p={4}>
                  <VStack spacing={4}>
                    <GuildTable
                      guildType="enemyLoss"
                      guildData={enemyLossData}
                      filter={filter}
                      onCharacterClick={handleCharacterClick}
                      isLoading={loading}
                    />
                    <Pagination
                      currentPage={enemyLossPage}
                      totalPages={enemyLossData.totalPages}
                      onPageChange={newPage => handlePageChange('enemyLoss', newPage)}
                    />
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}

export default React.memo(GuildStatsContainer)
