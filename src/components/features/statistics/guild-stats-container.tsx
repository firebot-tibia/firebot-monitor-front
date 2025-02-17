'use client'

import React, { useCallback, useEffect } from 'react'

import { Box, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import TablePagination from '@/components/common/pagination'
import { useGuildStatsStore } from '@/components/features/statistics/stores/useGuildStats'
import { routes } from '@/constants/routes'

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
                    <TablePagination
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
                    <TablePagination
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
                    <TablePagination
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
                    <TablePagination
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
