import React, { useState } from 'react'

import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  useColorModeValue,
  Text,
  Box,
  Divider,
  Tooltip,
} from '@chakra-ui/react'
import { ChevronDownIcon } from 'lucide-react'

import { capitalizeFirstLetter } from '@/utils/capitalize-first-letter'
import { typeColors } from '@/utils/character-type-icons'

import { CharacterTypesManager } from './character-type'
import type { CharacterClassificationProps } from './types'

export const CharacterClassification: React.FC<CharacterClassificationProps> = ({
  member,
  types,
  onClassificationChange,
  addType,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const bgColor = useColorModeValue('gray.800', 'gray.900')
  const hoverBgColor = useColorModeValue('gray.700', 'gray.800')
  const menuBgColor = useColorModeValue('gray.900', 'gray.800')
  const borderColor = useColorModeValue('gray.700', 'gray.600')

  const handleClassificationClick = (newType: string) => {
    onClassificationChange(member, newType)
    setIsOpen(false)
  }

  const currentColor = member.Kind ? typeColors[member.Kind.toLowerCase()] || 'white' : 'gray.400'
  const currentType = member.Kind ? capitalizeFirstLetter(member.Kind) : 'N/A'

  const sortedTypes = [...types].sort()

  return (
    <Menu isOpen={isOpen} onClose={() => setIsOpen(false)} placement="top-start" autoSelect={false}>
      <Tooltip label={`Current Type: ${currentType}`} placement="top" openDelay={500}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          onClick={() => setIsOpen(!isOpen)}
          size="xs"
          variant="ghost"
          bg={bgColor}
          color={currentColor}
          _hover={{
            bg: hoverBgColor,
            transform: 'translateY(-1px)',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          transition="all 0.2s"
          px={2}
          height="18px"
          fontSize="11px"
          width="60px"
        >
          <Text isTruncated>{currentType}</Text>
        </MenuButton>
      </Tooltip>

      <Portal>
        <MenuList
          bg={menuBgColor}
          borderColor={borderColor}
          boxShadow="lg"
          p={1}
          minW="150px"
          zIndex={1000}
        >
          {sortedTypes.length > 0 ? (
            <Box>
              {sortedTypes.map(type => (
                <MenuItem
                  key={type}
                  onClick={() => handleClassificationClick(type)}
                  bg="transparent"
                  color={typeColors[type.toLowerCase()] || 'white'}
                  _hover={{
                    bg: hoverBgColor,
                    transform: 'translateX(2px)',
                  }}
                  fontSize="11px"
                  height="24px"
                  transition="all 0.2s"
                  borderRadius="sm"
                  mb={0.5}
                >
                  <Text>{capitalizeFirstLetter(type)}</Text>
                </MenuItem>
              ))}
              <Divider my={1} borderColor={borderColor} />
            </Box>
          ) : (
            <MenuItem isDisabled bg="transparent" fontSize="11px" height="24px">
              Sem tipos para exibir
            </MenuItem>
          )}

          <Box mt={1}>
            <CharacterTypesManager
              addType={(newType: string) => {
                addType(newType)
                onClassificationChange(member, newType)
                setIsOpen(false)
              }}
            />
          </Box>
        </MenuList>
      </Portal>
    </Menu>
  )
}

export default CharacterClassification
