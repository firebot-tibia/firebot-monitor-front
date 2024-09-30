import { useState } from 'react';
import { Box, Flex, Text, CloseButton, VStack, HStack } from '@chakra-ui/react';
import { InfoIcon, ClockIcon } from 'lucide-react';

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
      <HStack spacing={4} align="start">
        <Box flex={1}>
          <VStack align="start" spacing={2}>
            <Flex align="center">
              <InfoIcon size={16} className="mr-2" />
              <Text fontWeight="bold">Instruções:</Text>
            </Flex>
            <Text fontSize="xs">• Campo Local: atualizar em qual local do jogo o personagem se encontra.</Text>
            <Text fontSize="xs">• Clique no nome: para copiar o exiva para o CTRL+C</Text>
          </VStack>
        </Box>
        <Box flex={1}>
          <VStack align="start" spacing={2}>
            <Flex align="center">
              <ClockIcon size={16} className="mr-2" />
              <Text fontWeight="bold">Últimos Updates:</Text>
            </Flex>
            <Text fontSize="xs">• Respawn Planilhado - Em progresso, ainda pode possuir inconsistência</Text>
            <Text fontSize="xs">• Mapa Exiva - Em progresso, versão inicial disponível</Text>
            <Text fontSize="xs">• Qualquer erro ou bug, nos relate no discord</Text>
            <Text fontSize="xs">• Próximo update - Tracking de Level Up realtime</Text>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default InstructionsBox;