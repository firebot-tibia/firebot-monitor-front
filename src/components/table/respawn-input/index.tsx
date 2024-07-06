'use client';

import { FC, useState } from 'react';
import { Input } from '@chakra-ui/react';
import { updateRespawn } from '../../../services/respawn';
import { RespawnInputProps } from '../interface/table.interface';

export const RespawnInput: FC<RespawnInputProps> = ({ characterName, localRespawnData, setLocalRespawnData, toast }) => {
  const [value, setValue] = useState(localRespawnData[characterName] || '');

  const handleBlur = async () => {
    try {
      if (localRespawnData[characterName]) {
        await updateRespawn(characterName, { name: value, character: characterName, is_pt: false });
        toast({
          title: 'Respawn atualizado com sucesso',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } 
    } catch (error) {
      console.error('Falha ao atualizar respawn', error);
      toast({
        title: 'Falha ao atualizar respawn',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Input
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        const updatedRespawnData = { ...localRespawnData, [characterName]: e.target.value };
        setLocalRespawnData(updatedRespawnData);
      }}
      onBlur={handleBlur}
      size="sm-5"
      bg="rgba(255, 255, 255, 0.2)"
      color="white"
    />
  );
};
