'use client';
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Icon,
  VStack,
  Heading,
  useColorModeValue,
  Fade,
} from '@chakra-ui/react';
import { FaUserCircle, FaSignInAlt, FaRocket } from 'react-icons/fa';
import { useLogin } from './hooks/useAuth';

const LoginPage = () => {
  const { email, setEmail, password, setPassword, errors, handleLogin } = useLogin();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.900', 'white');
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.700');

  const handleDiscordRedirect = () => {
    window.open("https://discord.gg/2uYKmHNmHP", "_blank");
  };

  return (
    <Fade in={true}>
      <Flex minH="100vh" direction={{ base: "column", md: "row" }} bg={bgColor}>
        <Flex
          flex="1"
          justify="center"
          align="center"
          bg="red.600"
          color="white"
          p={8}
          display={{ base: "none", md: "flex" }}
        >
          <VStack spacing={6}>
            <Heading as="h2" size="2xl" textAlign="center">
              Bem-vindo ao EnemyMonitor
            </Heading>
            <Text fontSize="xl" textAlign="center">
              Monitore seus inimigos em tempo real!
            </Text>
            <Button
              leftIcon={<FaRocket />}
              colorScheme="white"
              variant="outline"
              size="lg"
              onClick={handleDiscordRedirect}
            >
              Solicitar Conta de Demonstração
            </Button>
          </VStack>
        </Flex>
        <Flex
          flex="1"
          bg={bgColor}
          color={textColor}
          direction="column"
          justify="center"
          align="center"
          p={{ base: 4, md: 10 }}
        >
          <Center mb={8}>
            <Icon as={FaUserCircle} w={16} h={16} color="red.600" />
            <Text fontSize="3xl" fontWeight="bold" ml={3}>
              Enemy<Text as="span" color="red.600">Monitor</Text>
            </Text>
          </Center>
          <Box w="full" maxW="md">
            <Stack spacing={6}>
              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Usuário</FormLabel>
                <Input
                  type="text"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _hover={{ borderColor: 'red.300' }}
                />
                {errors.email && <Text color="red.500">{errors.email}</Text>}
              </FormControl>
              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _hover={{ borderColor: 'red.300' }}
                />
                {errors.password && <Text color="red.500">{errors.password}</Text>}
              </FormControl>
              <Button
                leftIcon={<FaSignInAlt />}
                colorScheme="red"
                variant="solid"
                onClick={handleLogin}
                size="lg"
                w="full"
                mt={4}
              >
                Entrar
              </Button>
            </Stack>
          </Box>
          <Button
            variant="link"
            color="red.500"
            mt={6}
            onClick={handleDiscordRedirect}
            display={{ base: "block", md: "none" }}
          >
            Solicitar Conta de Demonstração
          </Button>
        </Flex>
      </Flex>
    </Fade>
  );
};

export default LoginPage;