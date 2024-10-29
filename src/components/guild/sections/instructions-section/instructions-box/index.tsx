import { useState, useEffect } from 'react';
import { Box, Flex, Text, CloseButton, VStack, HStack, keyframes } from '@chakra-ui/react';
import { InfoIcon, ClockIcon, AlertTriangle } from 'lucide-react';

const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

const InstructionsBox = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBlinking(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

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
            <Text fontSize="sm" fontWeight="bold" color="red.500">• Apenas contas de administrador podem editar os campos.</Text>
            <Text fontSize="sm">• Campo Local: Atualize a localização atual do seu personagem no jogo.</Text>
            <Text fontSize="sm">• Clique no nome: Copie o comando exiva para a área de transferência (CTRL+C).</Text>
            <Text fontSize="sm">• Clique nos ...: Para abrir as estatísticas do personagem</Text>
          </VStack>
        </Box>
        <Box flex={1}>
          <VStack align="start" spacing={3}>
            <Flex align="center">
              <ClockIcon size={20} className="mr-2" />
              <Text fontWeight="bold" fontSize="lg">Atualizações Recentes:</Text>
            </Flex>
            <Text fontSize="sm">• Próxima atualização: Guilds Leave - Quem saiu / entrou na guild alida e inimiga</Text>
            <Text fontSize="sm">• Próxima atualização: Aprimoramento do Mapa de Exiva com triangulaçáo automática</Text>
          </VStack>
        </Box>
        <Box flex={1}>
          <VStack align="start" spacing={3}>
            <Flex align="center">
              <AlertTriangle size={20} className="mr-2" />
              <Text fontWeight="bold" fontSize="lg">Avisos:</Text>
            </Flex>
            <Text
              fontSize="sm"
              animation={isBlinking ? `${blinkAnimation} 1s infinite` : 'none'}
              fontWeight="bold"
              color="red.500"
            >• Clique no X acima para fechar essa caixa</Text>
            <Text fontSize="sm">• O acompanhamento de level up e morte requer que o site permaneça aberto constantemente.</Text>
            <Text fontSize="sm">• Atualmente, não registramos mortes ocorridas com o site fechado.</Text>
            <Text fontSize="sm">• Mantenha o site aberto para garantir o registro preciso de todas as atividades.</Text>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default InstructionsBox;