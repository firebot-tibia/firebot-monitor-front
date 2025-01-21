import { useState } from 'react'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Image,
  InputGroup,
  InputRightElement,
  VStack,
  IconButton,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaSignInAlt, FaEye, FaEyeSlash, FaDiscord } from 'react-icons/fa'

import { routes } from '../../../../constants/routes'
import { useLogin } from '../hooks/useLogin'

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { email, setEmail, password, setPassword, errors, handleLogin } = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'white')
  const inputBgColor = useColorModeValue('gray.50', 'gray.800')
  const inputBorderColor = useColorModeValue('gray.200', 'gray.600')
  const errorColor = useColorModeValue('red.500', 'red.300')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await handleLogin()
    setIsLoading(false)
  }

  const MotionCenter = motion(Center)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'sm', md: 'md' }}
      motionPreset="slideInBottom"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        bg={bgColor}
        p={8}
        borderRadius="xl"
        boxShadow="2xl"
        border="1px solid"
        borderColor={useColorModeValue('gray.100', 'gray.700')}
      >
        <ModalCloseButton color={textColor} size="lg" borderRadius="full" />

        <VStack spacing={6}>
          <MotionCenter
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/assets/images/og.png"
              alt="Firebot Monitor"
              boxSize={{ base: '120px', md: '160px' }}
              animation={`2s infinite ease-in-out`}
            />
          </MotionCenter>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={4} w="100%">
              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel color={textColor} fontWeight="medium">
                  Usuário
                </FormLabel>
                <Input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _hover={{ borderColor: 'red.500' }}
                  _focus={{
                    borderColor: 'red.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
                  }}
                  color={textColor}
                  size="lg"
                  placeholder="Digite seu e-mail"
                />
                {errors.email && (
                  <Text color={errorColor} fontSize="sm" mt={1}>
                    {errors.email}
                  </Text>
                )}
              </FormControl>

              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel color={textColor} fontWeight="medium">
                  Senha
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    bg={inputBgColor}
                    borderColor={inputBorderColor}
                    _hover={{ borderColor: 'red.500' }}
                    _focus={{
                      borderColor: 'red.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
                    }}
                    color={textColor}
                    size="lg"
                    placeholder="Digite sua senha"
                  />
                  <InputRightElement height="100%">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      color={useColorModeValue('gray.400', 'gray.600')}
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.password && (
                  <Text color={errorColor} fontSize="sm" mt={1}>
                    {errors.password}
                  </Text>
                )}
              </FormControl>

              <Button
                type="submit"
                leftIcon={<FaSignInAlt />}
                bgGradient="linear(to-r, red.600, red.700)"
                color="white"
                size="lg"
                w="full"
                mt={2}
                _hover={{
                  bgGradient: 'linear(to-r, red.700, red.800)',
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  bgGradient: 'linear(to-r, red.800, red.900)',
                }}
                isLoading={isLoading}
                loadingText="Entrando..."
                transition="all 0.2s"
              >
                Entrar
              </Button>
            </Stack>
          </form>

          <Button
            as="a"
            href={routes.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            leftIcon={<FaDiscord />}
            variant="outline"
            borderColor="red.500"
            color="red.500"
            size="md"
            _hover={{
              bg: 'red.50',
              borderColor: 'red.600',
              color: 'red.600',
              transform: 'scale(1.05)',
            }}
          >
            Solicitar Demonstração
          </Button>
        </VStack>
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
