import { Box, HStack, Text, VStack, Spacer, Badge } from '@chakra-ui/react'

import type { GuildMemberResponse } from '@/core/types/guild-member.response'
import type { AlertCondition } from '@/modules/monitoring/types/alert'

interface DetectedCharactersTooltipProps {
  characters: GuildMemberResponse[]
  alerts: AlertCondition[]
}

export const DetectedCharactersTooltip = ({ characters, alerts }: DetectedCharactersTooltipProps) => {
  return (
    <Box
      bg="rgba(0, 0, 0, 0.85)"
      backdropFilter="blur(8px)"
      borderRadius="lg"
      boxShadow="dark-lg"
      p={3}
      minW="300px"
      border="1px solid"
      borderColor="whiteAlpha.200"
      pointerEvents="all"
    >
      <HStack mb={3} borderBottom="1px solid" borderColor="whiteAlpha.200" pb={2}>
        <Text fontWeight="bold" color="white" fontSize="md">
          Personagens Detectados
        </Text>
        <Spacer />
        <Badge colorScheme="red" variant="solid">
          {characters.length}
        </Badge>
      </HStack>

      <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto" pr={2}>
        {characters
          .sort((a, b) => {
            const aTime = a.OnlineSince ? new Date(a.OnlineSince).getTime() : 0
            const bTime = b.OnlineSince ? new Date(b.OnlineSince).getTime() : 0
            return bTime - aTime // Most recent first
          })
          .map(character => (
            <Box
              key={character.Name}
              p={2}
              borderRadius="md"
              bg="whiteAlpha.50"
              _hover={{ bg: 'whiteAlpha.100' }}
              transition="all 0.2s"
            >
              <VStack spacing={1} align="stretch">
                <HStack spacing={3}>
                  <Text color="white" fontWeight="medium">
                    {character.FormattedName}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    {character.Vocation}
                  </Text>
                  <Text color="gray.400" fontSize="sm">•</Text>
                  <Text color="gray.400" fontSize="sm">
                    Expira às {new Date(new Date(character.OnlineSince!).getTime() + (alerts.find(a => a.enabled)?.timeRange || 5) * 60 * 1000).toLocaleTimeString()}
                  </Text>
                  <Spacer />
                  <Text fontSize="xs" color="gray.300">
                    {character.OnlineSince ? new Date(character.OnlineSince).toLocaleTimeString() : ''}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Text fontSize="xs" color="gray.400">
                    {character.Vocation}
                  </Text>
                  <Spacer />
                  <Text fontSize="xs" color="gray.400">
                    Level {character.Level}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          ))
        }
      </VStack>
    </Box>
  )
}
