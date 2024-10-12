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
} from '@chakra-ui/react';
import { FaUserCircle, FaSignInAlt } from 'react-icons/fa';
import { useLogin } from './hooks/useAuth';

const LoginPage = () => {
  const { email, setEmail, password, setPassword, errors, handleLogin } = useLogin();

  return (
    <Flex minH="100vh" direction={{ base: "column", md: "row" }} bg="gray.900">
      <Flex
        flex="1"
        justify="center"
        align="center"
        bg="white"
        color="gray.900"
        p={8}
        display={{ base: "none", md: "flex" }}
      >
        <VStack spacing={4}>
          <Heading as="h2" size="xl" textAlign="center">
            Bem vindo,
          </Heading>
          <Text fontSize="xl" textAlign="center">
            realize o <Text as="span" color="red.600">login</Text> ao lado!
          </Text>
        </VStack>
      </Flex>

      <Flex
        flex="1"
        bg="gray.900"
        color="white"
        direction="column"
        justify="center"
        align="center"
        p={{ base: 4, md: 10 }}
      >
        <Center mb={8}>
          <Icon as={FaUserCircle} w={12} h={12} color="red.600" />
          <Text fontSize="2xl" fontWeight="bold" ml={2}>
            Enemy<Text as="span" color="red.600">Monitor</Text>
          </Text>
        </Center>
        <Box w="full" maxW="md">
          <Stack spacing={4}>
            <FormControl id="email" isInvalid={!!errors.email}>
              <FormLabel>Usuário</FormLabel>
              <Input
                type="text"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="gray.800"
                color="white"
                borderColor="gray.700"
                _hover={{ borderColor: 'gray.600' }}
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
                bg="gray.800"
                color="white"
                borderColor="gray.700"
                _hover={{ borderColor: 'gray.600' }}
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
      </Flex>
    </Flex>
  );
};

export default LoginPage;