'use client'

import { useState, useEffect } from 'react'

import { Center, Spinner, SimpleGrid, Box, Text } from '@chakra-ui/react'

import DashboardLayout from '@/modules/layout/components'

import { useGuildContext } from '../../contexts/guild-context'
import { GuildTable } from '../guild-table'
import { ActivityWidget } from '../recent-activity'

export default function GuildContainer() {
  const [isClient, setIsClient] = useState(false)

  const {
    isLoading,
    status,
    types,
    addType,
    handleLocalChange,
    handleClassificationChange,
    groupedData,
  } = useGuildContext()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      </DashboardLayout>
    )
  }

  if (!types?.length || !groupedData?.length) {
    return (
      <DashboardLayout>
        <Center h="100vh">
          <Text>Nenhum dado de guilda disponível.</Text>
        </Center>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box
        w="full"
        px={2}
        py={2}
        overflow="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '24px',
          },
        }}
      >
        <SimpleGrid
          columns={{ base: 1, lg: 3 }}
          spacing={{ base: 4, lg: 6 }}
          minChildWidth={{ base: '100%', lg: '400px' }}
        >
          {groupedData.map(({ type, data, onlineCount }) => (
            <Box key={type} w="full" minW={{ base: 'calc(100vw - 32px)', lg: '400px' }} maxW="100%">
              <GuildTable
                type={type}
                data={data}
                onlineCount={onlineCount}
                onLocalChange={handleLocalChange}
                onClassificationChange={handleClassificationChange}
                showExivaInput={type !== 'exitados'}
                types={types}
                addType={addType}
              />
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Activity Widget as an overlay */}
      <ActivityWidget />
    </DashboardLayout>
  )
}
