import React from 'react';
import { Box, Text, VStack, HStack, Image } from '@chakra-ui/react';
import { GuildMember } from '../../../../../shared/interface/guild/guild-stats.interface';
import { Vocations } from '../../../../../constant/character';

const CharacterTooltip: React.FC<GuildMember> = ({
  name,
  vocation,
  level,
  experience,
  online
}) => {
  return (
    <Box 
      bg="white" 
      boxShadow="md" 
      borderRadius="md" 
      p={3} 
      maxWidth="250px"
    >
      <VStack align="start" spacing={2}>
        <HStack>
          <Image 
            src={Vocations[vocation]}
            alt={vocation} 
            boxSize="24px"
          />
          <Text fontWeight="bold">{name}</Text>
        </HStack>
        <Text>Nível: {level}</Text>
        <Text>Experiência: {experience.toLocaleString()}</Text>
        <Text>Vocação: {vocation}</Text>
        <HStack>
          <Box 
            w={2} 
            h={2} 
            borderRadius="full" 
            bg={online ? "green.500" : "red.500"}
          />
          <Text>{online ? "Online" : "Offline"}</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default CharacterTooltip;