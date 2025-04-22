import { memo } from 'react'

import { useToast, Tr, Td, HStack, Text, Image, Box } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Skull } from 'lucide-react'

import { getTimeColor } from '@/core/utils/get-time-color'
import { tableVocationIcons } from '@/core/utils/table-vocation-icons'
import { useGuildContext } from '@/modules/monitoring/contexts/guild-context'
import { useCharacterAnimation } from '@/modules/monitoring/hooks/useCharacterAnimation'
import { useTooltipState } from '@/modules/monitoring/hooks/useTooltip'

import { capitalizeFirstLetter } from '../../../../../core/utils/capitalize-first-letter'
import { CharacterTooltip } from '../table-tooltip'
import { CharacterClassification } from '../table-type-classification'
import { ExivaInput } from './exiva-input'
import type { CharacterRowProps } from './types'

const MotionTr = motion.create(Tr)

const deathAnimation = keyframes`
  0% { background-color: rgba(255, 87, 87, 0.0); }
  50% { background-color: rgba(255, 87, 87, 0.1); }
  100% { background-color: rgba(255, 87, 87, 0.0); }
`

const levelUpAnimation = keyframes`
  0% { background-color: rgba(72, 187, 120, 0.0); }
  50% { background-color: rgba(72, 187, 120, 0.1); }
  100% { background-color: rgba(72, 187, 120, 0.0); }
`

const levelDownAnimation = keyframes`
  0% { background-color: rgba(245, 101, 101, 0.0); }
  50% { background-color: rgba(245, 101, 101, 0.1); }
  100% { background-color: rgba(245, 101, 101, 0.0); }
`

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
  const { recentDeaths, recentLevels } = useGuildContext()
  const animationType = useCharacterAnimation(member, recentDeaths, recentLevels)
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
    <MotionTr
      h="4"
      _hover={{ bg: 'whiteAlpha.50' }}
      borderBottomWidth="1px"
      borderColor="gray.800"
      onClick={handleRowClick}
      cursor="pointer"
      initial={{ opacity: 0.5 }}
      animate={{
        opacity: 1,
        borderLeftColor:
          animationType === 'death'
            ? '#F56565'
            : animationType === 'levelUp'
              ? '#48BB78'
              : animationType === 'levelDown'
                ? '#F56565'
                : undefined,
        borderLeftWidth: animationType ? '2px' : undefined,
      }}
      transition={{ duration: 0.3 }}
      css={
        animationType === 'death'
          ? {
              animation: `${deathAnimation} 2s ease-in-out infinite`,
            }
          : animationType === 'levelUp'
            ? {
                animation: `${levelUpAnimation} 2s ease-in-out infinite`,
              }
            : animationType === 'levelDown'
              ? {
                  animation: `${levelDownAnimation} 2s ease-in-out infinite`,
                }
              : undefined
      }
    >
      <Td p={0} pl={0} w="5%" fontSize="11px" color="gray.500" lineHeight="1">
        #{formattedIndex}
      </Td>
      <Td p={0} pl={1} w="8%" color="white.200" fontSize="11px" lineHeight="1">
        <HStack spacing={1} align="center">
          <Text>{member.Level}</Text>
          {animationType === 'levelUp' && <ArrowUp size={12} color="#48BB78" />}
          {animationType === 'levelDown' && <ArrowDown size={12} color="#F56565" />}
        </HStack>
      </Td>
      <Td p={0} pl={1} w="6%" lineHeight="1">
        <HStack spacing={0}>
          {(() => {
            const icon = tableVocationIcons[member.Vocation];
            if (icon.type === 'image') {
              return (
                <Image
                  src={icon.value}
                  alt={member.Vocation}
                  width={4}
                  height={4}
                />
              );
            } else {
              return (
                <Box w={4} h={4} display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="12px">{icon.value}</Text>
                </Box>
              );
            }
          })()}
        </HStack>
      </Td>
      <Td p={0} pl={1} w="20%" lineHeight="1">
        <HStack spacing={2}>
          <Text fontSize="11px" color="white.300" isTruncated>
            {capitalizeFirstLetter(member.Name)}
          </Text>
          {animationType === 'death' && <Skull size={12} color="#F56565" />}
          {animationType === 'levelUp' && <ArrowUp size={12} color="#48BB78" />}
          {animationType === 'levelDown' && <ArrowDown size={12} color="#F56565" />}
        </HStack>
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
    </MotionTr>
  )
})

export default CharacterRow
