import React, { useState } from 'react'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Image,
  Text,
  useColorModeValue,
  Portal,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { CharacterTypesManager } from '../character-type'
import { GuildMemberResponse } from '../../../../types/interfaces/guild/guild-member.interface'
import { characterTypeIcons } from '../../../../utils/character-type-icons'

interface CharacterClassificationProps {
  member: GuildMemberResponse
  types: string[]
  onClassificationChange: (member: GuildMemberResponse, newType: string) => void
  addType: (newType: string) => void
}

export const CharacterClassification: React.FC<CharacterClassificationProps> = ({
  member,
  types,
  onClassificationChange,
  addType,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const bgColor = useColorModeValue('black.800', 'black.900')
  const hoverBgColor = useColorModeValue('red.700', 'red.800')
  const textColor = useColorModeValue('white', 'gray.100')

  const handleClassificationClick = (newType: string) => {
    onClassificationChange(member, newType)
    setIsOpen(false)
  }

  const renderTypeContent = (type: string) => (
    <HStack spacing={2}>
      {characterTypeIcons[type] ? (
        <Image src={characterTypeIcons[type]} alt={type} boxSize="12px" />
      ) : null}
      <Text>{type}</Text>
    </HStack>
  )

  return (
    <Menu isOpen={isOpen} onClose={() => setIsOpen(false)} placement="top-start">
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        onClick={() => setIsOpen(!isOpen)}
        size="xs"
        variant="ghost"
        bg={bgColor}
        color={textColor}
        _hover={{ bg: hoverBgColor }}
      >
        {renderTypeContent(member.Kind || 'n/a')}
      </MenuButton>
      <Portal>
        <MenuList bg="red.700" borderColor="black.700" zIndex={1000}>
          {Array.isArray(types) && types.length > 0 ? (
            types.map((type: string) => (
              <MenuItem
                key={type}
                onClick={() => handleClassificationClick(type)}
                bg={bgColor}
                _hover={{ bg: hoverBgColor }}
              >
                {renderTypeContent(type)}
              </MenuItem>
            ))
          ) : (
            <MenuItem isDisabled bg={bgColor}>
              Sem tipos para exibir
            </MenuItem>
          )}
          <CharacterTypesManager
            addType={(newType) => {
              addType(newType)
              onClassificationChange(member, newType)
              setIsOpen(false)
            }}
          />
        </MenuList>
      </Portal>
    </Menu>
  )
}
