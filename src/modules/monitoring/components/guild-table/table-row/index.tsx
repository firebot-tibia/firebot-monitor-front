import { memo } from 'react'

import { useToast, Tr, Td, HStack, Text, Image } from '@chakra-ui/react'

import { getTimeColor } from '@/core/utils/get-time-color'
import { tableVocationIcons } from '@/core/utils/table-vocation-icons'
import { useTooltipState } from '@/modules/monitoring/hooks/useTooltip'

import { capitalizeFirstLetter } from '../../../../../core/utils/capitalize-first-letter'
import { CharacterTooltip } from '../table-tooltip'
import { CharacterClassification } from '../table-type-classification'
import { ExivaInput } from './exiva-input'
import type { CharacterRowProps } from './types'

export const CharacterRow = memo(function CharacterRow({
  member,
  onLocalChange,
  showExivaInput,
  types,
  onClassificationChange,
  addType,
  index,
}: CharacterRowProps) {
  const toast = useToast()
  const { toggleTooltip, isTooltipOpen } = useTooltipState()
  const tooltipId = `${member.Name}-${member.Level}`

  const handleRowClick = () => {
    const cleanName = member.Name.trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
    const exivas = `exiva "${cleanName}"`
    navigator.clipboard.writeText(exivas)
    toast({
      title: 'Exiva copiado para a área de transferência.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const formattedIndex = String(index).padStart(2, '0')

  return (
    <Tr
      h="4"
      _hover={{ bg: 'whiteAlpha.50' }}
      borderBottomWidth="1px"
      borderColor="gray.800"
      onClick={handleRowClick}
      cursor="pointer"
    >
      <Td p={0} pl={0} w="5%" fontSize="11px" color="gray.500" lineHeight="1">
        #{formattedIndex}
      </Td>
      <Td p={0} pl={1} w="8%" color="white.200" fontSize="11px" lineHeight="1">
        {member.Level}
      </Td>
      <Td p={0} pl={1} w="6%" lineHeight="1">
        <HStack spacing={0}>
          <Image
            src={tableVocationIcons[member.Vocation]}
            alt={member.Vocation}
            width={4}
            height={4}
          />
        </HStack>
      </Td>
      <Td p={0} pl={1} w="20%" lineHeight="1">
        <Text fontSize="11px" color="white.300" isTruncated>
          {capitalizeFirstLetter(member.Name)}
        </Text>
      </Td>
      <Td
        p={0}
        pl={1}
        w="10%"
        lineHeight="1"
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <CharacterClassification
          member={member}
          types={types}
          onClassificationChange={onClassificationChange}
          addType={addType}
        />
      </Td>
      <Td p={0} pl={1} w="10%" lineHeight="1">
        <Text fontSize="11px" color={getTimeColor(member.TimeOnline)}>
          {member.TimeOnline}
        </Text>
      </Td>
      {showExivaInput && (
        <Td p={0} pl={1} w="15%" lineHeight="1">
          <ExivaInput
            member={member}
            onLocalChange={onLocalChange}
            fontSize="11px"
            onClick={e => e.stopPropagation()}
          />
        </Td>
      )}
      <Td p={0} pl={1} w="10%" lineHeight="1">
        <CharacterTooltip
          member={member}
          isOpen={isTooltipOpen(tooltipId)}
          onToggle={() => toggleTooltip(tooltipId)}
        />
      </Td>
    </Tr>
  )
})

export default CharacterRow
