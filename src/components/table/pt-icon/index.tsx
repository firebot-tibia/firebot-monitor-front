'use client';

import { Tooltip } from '@chakra-ui/react';
import { FC } from 'react';
import { updateRespawn } from '../../../services/respawn';
import { PTIconProps } from '../interface/table.interface';


const PTIcon: FC<PTIconProps> = ({
  characterName,
  localIconState,
  setLocalIconState,
  selectedCharacters,
  setSelectedCharacters,
  data,
  toast,
}) => {
  const handleIconClick = async (characterName: string) => {
    let updatedSelectedCharacters = [...selectedCharacters];
    if (selectedCharacters.includes(characterName)) {
      updatedSelectedCharacters = updatedSelectedCharacters.filter((name) => name !== characterName);
    } else {
      updatedSelectedCharacters.push(characterName);
    }

    if (updatedSelectedCharacters.length > 4) {
      toast({
        title: 'Máximo de 4 membros permitidos no PT.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setSelectedCharacters(updatedSelectedCharacters);

    const is_pt = updatedSelectedCharacters.length > 1;
    const pt_members = is_pt ? updatedSelectedCharacters : [];

    if (updatedSelectedCharacters.length <= 4) {
      try {
        for (const char of updatedSelectedCharacters) {
            await updateRespawn(char, { character: char, is_pt, pt_members });
        }
        toast({
          title: is_pt ? 'Personagens vinculados com sucesso' : 'Vinculação desfeita',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        setTimeout(() => {
          setSelectedCharacters([]);
        }, 5000);
      } catch (error) {
        console.error('Falha ao vincular personagens', error);
        toast({
          title: 'Falha ao vincular personagens',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    }

    const updatedIconState = { ...localIconState };
    for (const char of updatedSelectedCharacters) {
      updatedIconState[char] = is_pt ? 'true.png' : 'false.png';
    }
    setLocalIconState(updatedIconState);
  };

  const getTooltipText = (characterName: string) => {
    const character = data.find((char) => char.character.name === characterName);
    const linkedNames = character?.respawn?.pt_members || [];
    if (Array.isArray(linkedNames) && linkedNames.length > 0) {
      return `Personagens vinculados: ${linkedNames.join(', ')}`;
    }
    return 'Nenhum personagem vinculado';
  };

  return (
    <Tooltip label={getTooltipText(characterName)} hasArrow>
      <img
        src={localIconState[characterName] === 'true.png' ? 'assets/true.png' : 'assets/false.png'}
        alt="ícone de status"
        width="24"
        height="24"
        style={{ cursor: 'pointer' }}
        onClick={() => handleIconClick(characterName)}
      />
    </Tooltip>
  );
};

export default PTIcon;
