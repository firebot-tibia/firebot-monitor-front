import React, { useState } from 'react';
import { Box, Flex, Text, CloseButton } from '@chakra-ui/react';
import { InfoIcon } from 'lucide-react';

const InstructionsBox = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Box position="relative" p={3} borderWidth={1} borderRadius="md" mb={4}>
      <CloseButton
        position="absolute"
        right={2}
        top={2}
        onClick={() => setIsVisible(false)}
      />
      <Flex align="center" mb={2}>
        <InfoIcon size={16} style={{ marginRight: '8px' }} />
        <Text fontWeight="bold">Instruções:</Text>
      </Flex>
      <Text fontSize="xs">• Campo Local: atualizar em qual local do jogo o personagem se encontra.</Text>
      <Text fontSize="xs">• Clique no nome: para copiar o exiva para o CTRL+C</Text>
    </Box>
  );
};

export default InstructionsBox;