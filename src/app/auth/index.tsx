// pages/login.tsx
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
  Image,
} from '@chakra-ui/react';
import { FaUserCircle, FaSignInAlt } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '../../context/auth/auth-context';
import { useToastContext } from '../../context/toast/toast-context';
import { AuthSchema, AuthDTO } from './schema/auth.schema';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const { showToast } = useToastContext();

  const handleLogin = async () => {
    const result = AuthSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.format();
      setErrors({
        email: fieldErrors.email?._errors[0],
        password: fieldErrors.password?._errors[0],
      });
      return;
    }

    try {
      const data: AuthDTO = { email, password };
      await login(data);
      showToast({
        title: 'Logado com sucesso',
        description: 'Você será redirecionado para a página principal.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setErrors({ password: 'E-mail ou senha incorretos' });
      showToast({
        title: 'Login incorreto',
        description: 'Verifique seu e-mail ou senha e tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" bg="gray.900">
      <Flex
        flex="1"
        justify="center"
        direction="column"
        bg="white"
        color="gray.900"
      >
        <Center>
          <Image src="assets/logo.png" alt="" maxW="20%" />
        </Center>
      </Flex>

      <Flex flex="1" justify="center" direction="column" bg="white" color="gray.900">
        <Text fontSize="3xl" fontWeight="bold" mb={2}>
          Bem vindo,
        </Text>
        <Text fontSize="xl">
          realize o <Text as="span" color="red.600">login</Text> ao lado!
        </Text>
      </Flex>

      <Flex
        flex="1"
        bg="gray.900"
        color="white"
        direction="column"
        justify="center"
        align="center"
        p={10}
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
