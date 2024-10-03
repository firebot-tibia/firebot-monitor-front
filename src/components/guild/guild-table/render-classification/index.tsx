import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { CharacterTypesManager } from '../character-type';
import { characterTypeIcons } from '../../../../constant/character';
import { GuildMemberResponse } from '../../../../shared/interface/guild/guild-member.interface';

interface CharacterClassificationProps {
  member: GuildMemberResponse;
  types: string[];
  onClassificationChange: (member: GuildMemberResponse, newType: string) => void;
  addType: (newType: string) => void;
}

export const CharacterClassification: React.FC<CharacterClassificationProps> = ({
  member,
  types,
  onClassificationChange,
  addType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const hoverBgColor = useColorModeValue('gray.700', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');

  const handleClassificationClick = (newType: string) => {
    onClassificationChange(member, newType);
    setIsOpen(false);
  };

  const renderTypeContent = (type: string) => (
    <HStack spacing={2}>
      {characterTypeIcons[type] ? (
        <Image src={characterTypeIcons[type]} alt={type} boxSize="12px" />
      ) : null}
      <Text>{type}</Text>
    </HStack>
  );

  return (
    <Menu isOpen={isOpen} onClose={() => setIsOpen(false)}>
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
      <MenuList bg={bgColor} borderColor="gray.700">
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
          <MenuItem isDisabled bg={bgColor}>Sem tipos para exibir</MenuItem>
        )}
        <CharacterTypesManager 
          addType={(newType) => {
            addType(newType);
            onClassificationChange(member, newType);
            setIsOpen(false);
          }}
        />
      </MenuList>
    </Menu>
  );
};