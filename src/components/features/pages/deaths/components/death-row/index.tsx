import React from 'react'

import { Badge, Td, Text, Tooltip, Tr, useToast } from '@chakra-ui/react'
import { formatDate } from 'date-fns'

import type { Death } from '@/components/features/guilds-monitoring/types/death.interface'

import { TruncatedText } from '../truncated-text'

interface DeathTableRowProps {
  death: Death
}

export const DeathTableRow: React.FC<DeathTableRowProps> = ({ death }) => {
  const toast = useToast()

  const handleClick = () => {
    const textToCopy = `${death.name}: ${death.text}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Copiado para a área de transferência',
        description: 'Nome do personagem e descrição da morte foram copiados.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    })
  }

  return (
    <Tr onClick={handleClick} _hover={{ bg: 'gray.700', cursor: 'pointer' }}>
      <Td>
        <Tooltip label={death.name} placement="top-start">
          <Text isTruncated maxWidth="150px">
            {death.name}
          </Text>
        </Tooltip>
      </Td>
      <Td>
        <Badge colorScheme="purple">{death.level}</Badge>
      </Td>
      <Td>
        <Badge colorScheme="blue">{death.vocation}</Badge>
      </Td>
      <Td>
        <Badge colorScheme="green">{death.city}</Badge>
      </Td>
      <Td>
        <TruncatedText text={death.text} />
      </Td>
    </Tr>
  )
}
