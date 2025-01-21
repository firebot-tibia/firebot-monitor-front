import React, { useState, useRef } from 'react'

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  VStack,
  Text,
  useDisclosure,
  useToast,
  FormControl,
  FormHelperText,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { ShieldCloseIcon } from 'lucide-react'
import { IoIosAddCircleOutline, IoMdAddCircleOutline } from 'react-icons/io'

interface CharacterTypesManagerProps {
  addType: (newType: string) => void
}

export const CharacterTypesManager: React.FC<CharacterTypesManagerProps> = ({ addType }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [newType, setNewType] = useState('')
  const [error, setError] = useState('')
  const initialRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewType(value)
    if (error) setError('')
  }

  const clearInput = () => {
    setNewType('')
    if (initialRef.current) {
      initialRef.current.focus()
    }
  }

  const validateInput = (value: string) => {
    if (!value.trim()) {
      setError('O tipo não pode estar vazio')
      return false
    }
    if (value.length < 2) {
      setError('O tipo deve ter pelo menos 2 caracteres')
      return false
    }
    if (value.length > 20) {
      setError('O tipo não pode ter mais de 20 caracteres')
      return false
    }
    return true
  }

  const handleAddType = () => {
    if (validateInput(newType)) {
      addType(newType.trim())
      toast({
        title: 'Tipo adicionado',
        description: `O tipo "${newType.trim()}" foi adicionado com sucesso.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      setNewType('')
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddType()
    }
  }

  const handleClose = () => {
    setNewType('')
    setError('')
    onClose()
  }

  return (
    <>
      <Button
        onClick={onOpen}
        size="sm"
        variant="ghost"
        leftIcon={<IoIosAddCircleOutline />}
        _hover={{ bg: 'whiteAlpha.200' }}
        _active={{ bg: 'whiteAlpha.300' }}
        fontSize="11px"
        height="24px"
        px={2}
      >
        Adicionar Tipo
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        initialFocusRef={initialRef}
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg="gray.900"
          color="white"
          borderRadius="md"
          boxShadow="dark-lg"
          maxW="400px"
        >
          <ModalHeader borderBottomWidth="1px" borderColor="gray.700" fontSize="md" py={3}>
            Adicionar Novo Tipo
          </ModalHeader>
          <ModalCloseButton size="sm" _hover={{ bg: 'whiteAlpha.200' }} />

          <ModalBody py={4}>
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" color="gray.300">
                Insira o nome do novo tipo de personagem:
              </Text>
              <FormControl isInvalid={!!error}>
                <InputGroup size="md">
                  <Input
                    ref={initialRef}
                    value={newType}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ex: PT 123"
                    bg="gray.800"
                    border="none"
                    _focus={{
                      boxShadow: '0 0 0 1px #63B3ED',
                      bg: 'gray.700',
                    }}
                    _hover={{
                      bg: 'gray.700',
                    }}
                  />
                  {newType && (
                    <InputRightElement>
                      <IconButton
                        aria-label="Clear input"
                        icon={<ShieldCloseIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={clearInput}
                        _hover={{ bg: 'transparent', color: 'red.300' }}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
                {error ? (
                  <FormErrorMessage>{error}</FormErrorMessage>
                ) : (
                  <FormHelperText color="gray.400">Use um nome curto e descritivo</FormHelperText>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor="gray.700" py={3}>
            <Button
              onClick={handleAddType}
              colorScheme="blue"
              mr={3}
              leftIcon={<IoMdAddCircleOutline />}
              size="sm"
              isDisabled={!newType.trim() || !!error}
            >
              Adicionar
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CharacterTypesManager
