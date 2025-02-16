'use client'

import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react'
import { BarChart } from 'lucide-react'

import GuildStatsContainer from '../../guild-stats-container'

const StatisticsWidget = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'red.800')
  const buttonHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200')
  const modalBg = useColorModeValue('white', '#1e2124')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  return (
    <>
      <Tooltip label="Estatísticas" placement="right">
        <IconButton
          aria-label="Open Statistics"
          icon={<BarChart size={20} />}
          onClick={onOpen}
          bg="transparent"
          _hover={{ bg: buttonHoverBg }}
          size="sm"
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(8px)" />
        <ModalContent bg={modalBg} maxW="100vw" maxH="100vh">
          <ModalHeader
            borderBottom="1px solid"
            borderColor={borderColor}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={4}
          >
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Estatísticas da Guilda
            </Text>
            <ModalCloseButton position="static" />
          </ModalHeader>

          <ModalBody p={4} display="flex" flexDirection="column" flex={1}>
            <GuildStatsContainer />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default StatisticsWidget
