import { useState } from 'react';
import { Box, Flex, Text, CloseButton, VStack, HStack } from '@chakra-ui/react';
import { InfoIcon, ClockIcon, AlertTriangle } from 'lucide-react';

const InstructionsBox = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Box position="relative" p={4} borderWidth={1} borderRadius="md" mb={4}>
      <CloseButton
        position="absolute"
        right={2}
        top={2}
        onClick={() => setIsVisible(false)}
      />
      <HStack spacing={4} align="start">
        <Box flex={1}>
          <VStack align="start" spacing={3}>
            <Flex align="center">
              <InfoIcon size={20} className="mr-2" />
              <Text fontWeight="bold" fontSize="lg">Instruções:</Text>
            </Flex>
            <Text fontSize="sm">• Campo Local: Atualize a localização atual do seu personagem no jogo.</Text>
            <Text fontSize="sm">• Clique no nome: Copie o comando exiva para a área de transferência (CTRL+C).</Text>
            <Text fontSize="sm">• Bugs ou erros: Por favor, relate-nos no Discord.</Text>
          </VStack>
        </Box>
        <Box flex={1}>
          <VStack align="start" spacing={3}>
            <Flex align="center">
              <ClockIcon size={20} className="mr-2" />
              <Text fontWeight="bold" fontSize="lg">Atualizações Recentes:</Text>
            </Flex>
            <Text fontSize="sm">• Respawn Planilhado: Em desenvolvimento, pode apresentar inconsistências.</Text>
            <Text fontSize="sm">• Mapa Exiva: Versão inicial disponível, em constante aprimoramento.</Text>
            <Text fontSize="sm">• Próxima atualização: Liberação completa do respawn planilhado</Text>
          </VStack>
        </Box>
        <Box flex={1}>
          <VStack align="start" spacing={3}>
            <Flex align="center">
              <AlertTriangle size={20} className="mr-2" />
              <Text fontWeight="bold" fontSize="lg">Avisos:</Text>
            </Flex>
            <Text fontSize="sm">• O acompanhamento de level up e morte requer que o site permaneça aberto constantemente.</Text>
            <Text fontSize="sm">• Atualmente, não registramos mortes ocorridas com o site fechado.</Text>
            <Text fontSize="sm">• Mantenha o site aberto para garantir o registro preciso de todas as atividades.</Text>
            <Text fontSize="sm" color={"red"}>• Clicar no X acima para fechar essa caixa</Text>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default InstructionsBox;