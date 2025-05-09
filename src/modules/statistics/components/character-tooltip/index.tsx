import React from 'react'

import { Badge, Box, Divider, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react'

import type { GuildMember } from '@/core/types/guild-member'

import { tableVocationIcons } from '../../../../core/utils/table-vocation-icons'

const CharacterTooltip: React.FC<GuildMember> = ({ name, vocation, level, experience, online }) => {
  return (
    <Box
      bg="gray.800"
      boxShadow="dark-lg"
      borderRadius="md"
      p={4}
      maxWidth="300px"
      border="1px solid"
      borderColor="gray.700"
    >
      <VStack align="stretch" spacing={3}>
        <Flex justify="space-between" align="center">
          <HStack>
            {(() => {
              const icon = tableVocationIcons[vocation];
              if (icon.type === 'image') {
                return <Image src={icon.value} alt={vocation} boxSize="32px" />;
              } else {
                return (
                  <Box boxSize="32px" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="20px">{icon.value}</Text>
                  </Box>
                );
              }
            })()}
            <Text fontWeight="bold" fontSize="lg" color="white">
              {name}
            </Text>
          </HStack>
          <Badge colorScheme={online ? 'green' : 'red'} variant="solid">
            {online ? 'Online' : 'Offline'}
          </Badge>
        </Flex>

        <Divider borderColor="gray.600" />

        <HStack justify="space-between">
          <Text color="gray.400">Nível</Text>
          <Text color="white" fontWeight="semibold">
            {level}
          </Text>
        </HStack>

        <HStack justify="space-between">
          <Text color="gray.400">Experiência</Text>
          <Text color="white" fontWeight="semibold">
            {experience.toLocaleString()}
          </Text>
        </HStack>

        <HStack justify="space-between">
          <Text color="gray.400">Vocação</Text>
          <Text color="white" fontWeight="semibold">
            {vocation}
          </Text>
        </HStack>
      </VStack>
    </Box>
  )
}

export default CharacterTooltip
