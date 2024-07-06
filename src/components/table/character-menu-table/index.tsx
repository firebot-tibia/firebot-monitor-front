'use client';

import { FC } from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface CharacterMenuProps {
  characterName: string;
  handleCopy: (name: string | undefined) => void;
  copyAllNames: () => void;
  copyAllExivas: () => void;
}

export const CharacterMenu: FC<CharacterMenuProps> = ({ characterName, handleCopy, copyAllNames, copyAllExivas }) => (
  <Menu>
    <MenuButton as={Button} size="xs" rightIcon={<ChevronDownIcon />} bg="transparent" _hover={{ bg: 'transparent' }}>
      {characterName}
    </MenuButton>
    <MenuList bg="black" color="white">
      <CopyToClipboard text={`exiva "${characterName}"`}>
        <MenuItem _hover={{ bg: 'gray.700' }} onClick={() => handleCopy(characterName)}>Copiar exiva</MenuItem>
      </CopyToClipboard>
      <CopyToClipboard text={characterName}>
        <MenuItem _hover={{ bg: 'gray.700' }} onClick={() => handleCopy(characterName)}>Copiar nome</MenuItem>
      </CopyToClipboard>
      <MenuItem _hover={{ bg: 'gray.700' }} onClick={copyAllNames}>Copiar todos os nomes</MenuItem>
      <MenuItem _hover={{ bg: 'gray.700' }} onClick={copyAllExivas}>Copiar todos os exivas</MenuItem>
    </MenuList>
  </Menu>
);
