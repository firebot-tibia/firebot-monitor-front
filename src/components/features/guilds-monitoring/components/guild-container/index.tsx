'use client'
import { useEffect, useState } from 'react'

import { Box, Center, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'

import { useHomeLogic } from '../../../../../hooks/use-dashboard'
import DashboardLayout from '../../../../layout'
import { GuildMemberTable } from '../guild-table'

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
  } = useHomeLogic()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <DashboardLayout>
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      </DashboardLayout>
    )
  }

  if (status === 'loading' || isLoading) {
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
      <Box maxWidth="100%" overflow="hidden" fontSize={['xs', 'sm', 'md']} mt={6}>
        <VStack spacing={4} align="stretch">
          <SimpleGrid columns={[1, 2, 3]} spacing={1}>
            {groupedData.map(({ type, data, onlineCount }) => (
              <GuildMemberTable
                key={type}
                data={data}
                onlineCount={onlineCount}
                onLocalChange={handleLocalChange}
                onClassificationChange={handleClassificationChange}
                showExivaInput={type !== 'exitados'}
                types={types}
                addType={addType}
                isLoading={false}
              />
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </DashboardLayout>
  )
}
