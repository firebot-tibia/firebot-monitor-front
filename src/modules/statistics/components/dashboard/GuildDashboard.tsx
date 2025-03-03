import React from 'react'

import {
  Box,
  Grid,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
} from '@chakra-ui/react'

import { useStatisticsStore } from '../../stores/statistics.store'
import { DateRangeFilter } from '../filters/DateRangeFilter'
import { SearchFilter } from '../filters/SearchFilter'
import { VocationFilter } from '../filters/VocationFilter'
import { ExperienceTable } from '../tables/ExperienceTable'

export const GuildDashboard: React.FC = () => {
  const {
    filters,
    isLoading,
    filteredStats,
    setFilters,
    currentPage,
    setPage,
    itemsPerPage,
    setItemsPerPage,
  } = useStatisticsStore()

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const tabColor = useColorModeValue('gray.600', 'gray.400')
  const activeTabColor = useColorModeValue('blue.500', 'blue.300')

  const handleTabChange = (index: number) => {
    setFilters({
      type: index === 0 ? 'ally' : 'enemy',
    })
  }

  const handleModeChange = (index: number) => {
    setFilters({
      mode: index === 0 ? 'gain' : 'loss',
    })
  }

  return (
    <Box bg={bgColor} borderRadius="xl" boxShadow="xl" p={6} border="1px" borderColor={borderColor}>
      {/* Filters Section */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={6}>
        <DateRangeFilter
          startDate={filters.date.startDate}
          endDate={filters.date.endDate}
          onChange={range => setFilters({ date: range })}
        />
        <VocationFilter value={filters.vocation} onChange={vocation => setFilters({ vocation })} />
        <SearchFilter value={filters.name} onChange={name => setFilters({ name })} />
      </Grid>

      {/* Tabs Section */}
      <Tabs variant="soft-rounded" colorScheme="blue" onChange={handleTabChange} mb={6}>
        <TabList>
          <HStack spacing={4}>
            <Tab color={tabColor} _selected={{ color: activeTabColor, bg: 'blue.50' }}>
              Aliados
            </Tab>
            <Tab color={tabColor} _selected={{ color: activeTabColor, bg: 'blue.50' }}>
              Inimigos
            </Tab>
          </HStack>
        </TabList>
      </Tabs>

      {/* Mode Tabs */}
      <Tabs variant="soft-rounded" colorScheme="blue" onChange={handleModeChange} size="sm" mb={6}>
        <TabList>
          <HStack spacing={2}>
            <Tab color={tabColor} _selected={{ color: activeTabColor, bg: 'blue.50' }}>
              Ganho de XP
            </Tab>
            <Tab color={tabColor} _selected={{ color: activeTabColor, bg: 'blue.50' }}>
              Perda de XP
            </Tab>
          </HStack>
        </TabList>
      </Tabs>

      {/* Content Section */}
      <Box overflowX="auto">
        <ExperienceTable
          data={filteredStats}
          isLoading={isLoading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </Box>
    </Box>
  )
}

export default React.memo(GuildDashboard)
