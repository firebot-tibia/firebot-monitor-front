import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  HStack,
  Text,
  useDisclosure,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { ListChecks, X } from 'lucide-react'
import { FaMap } from 'react-icons/fa'

import Maps from '..'

const MapWidget = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Tooltip label="Mapa Tibia Exiva" placement="right">
        <IconButton
          aria-label="Open Mapa Tibia Exiva"
          icon={<FaMap size={20} />}
          onClick={onOpen}
          bg="transparent"
          size="sm"
        />
      </Tooltip>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="none">
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(8px)" />
        <ModalContent bg="#1a1b1e" m={0} rounded="none" overflow="hidden" position="relative">
          {/* Header */}
          <HStack
            justify="space-between"
            p={4}
            borderBottom="1px solid"
            borderColor="red.800"
            bg="#161718"
          >
            <HStack>
              <FaMap size={20} color="#4299E1" />
              <Text color="gray.100">Mapa de Exiva</Text>
            </HStack>
            <IconButton
              icon={<X size={20} />}
              aria-label="Close modal"
              variant="ghost"
              color="gray.400"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={onClose}
            />
          </HStack>

          {/* Instructions */}
          <Box bg="#b3310d" p={4} color="white">
            <Text fontWeight="bold" mb={2}>
              Instruções de Uso:
            </Text>
            <Text fontSize="sm">
              A ferramenta oferece orientação aproximada, não 100% precisa. Use seu conhecimento
              sobre nível e vocação do personagem para interpretar os resultados.
            </Text>
            <Text fontSize="sm" mt={1}>
              Atualmente, suporta a busca de apenas um personagem por vez.
            </Text>
            <Text fontSize="sm" mt={1}>
              <strong>Atenção:</strong> No momento, apenas respawns META estão marcados. Caso
              identifique que algum respawn META esteja faltando, por favor, entre em contato com a
              equipe via Discord.
            </Text>
          </Box>

          {/* Main Content */}
          <HStack align="stretch" spacing={0} flex={1} h="calc(100vh - 160px)">
            {/* Map Area */}
            <Box flex={2} position="relative" bg="#0d0e0f" overflow="hidden">
              <Maps />
            </Box>
          </HStack>
        </ModalContent>
      </Modal>
    </>
  )
}

export default MapWidget
