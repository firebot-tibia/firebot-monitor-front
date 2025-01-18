import {
  useColorModeValue,
  VStack,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Checkbox,
  Input,
  Text,
  Heading,
} from '@chakra-ui/react'

import { useCharacterTypesView } from '@/hooks/use-type-view'
import type { GuildMemberResponse } from '@/types/guild-member.interface'

import { useCharacterMonitoring } from '../../hooks/useMonitor'

interface BombaMakerMonitorProps {
  characters: GuildMemberResponse[]
}

export const BombaMakerMonitor: React.FC<BombaMakerMonitorProps> = ({ characters }) => {
  const types = useCharacterTypesView(characters)
  const {
    threshold,
    setThreshold,
    timeWindow,
    setTimeWindow,
    monitoredLists,
    handleCheckboxChange,
    handleStatusChange,
  } = useCharacterMonitoring(characters, types)

  const textColor = useColorModeValue('gray.100', 'gray.200')
  const inputBgColor = useColorModeValue('black.700', 'black.800')

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md" color={textColor}>
        Configurações de Monitoramento
      </Heading>
      <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
        <FormControl>
          <FormLabel htmlFor="threshold" color={textColor}>
            Número Total de Personagens
          </FormLabel>
          <Input
            id="threshold"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            type="number"
            min={1}
            max={50}
            bg={inputBgColor}
            color={textColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="timeWindow" color={textColor}>
            Tempo (segundos)
          </FormLabel>
          <Input
            id="timeWindow"
            value={timeWindow}
            onChange={e => setTimeWindow(Number(e.target.value))}
            type="number"
            min={30}
            max={300}
            bg={inputBgColor}
            color={textColor}
          />
        </FormControl>
      </Flex>
      <Text fontSize="sm" color={textColor} mb={2} fontWeight="bold">
        Tipos monitorados:
      </Text>
      <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={2}>
        {types.map(type => (
          <Checkbox
            key={type}
            isChecked={monitoredLists.includes(type)}
            onChange={e => handleCheckboxChange(type, e.target.checked)}
            colorScheme="blue"
          >
            <Text fontSize="sm" color={textColor}>
              {type}
            </Text>
          </Checkbox>
        ))}
      </SimpleGrid>
    </VStack>
  )
}
