'use client';

import { Box, Button, Center, Flex, FormControl, FormLabel, Input, Stack, Text, Icon, Image } from '@chakra-ui/react';
import { FaUserCircle, FaSignInAlt } from 'react-icons/fa';
import { useState } from 'react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Logging in with', { username, password });
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
        <Center mb={8}>
          <Image 
            src="assets/logo.png" 
            alt="" 
            maxW="20%"
          />
        </Center>
      </Flex>

      <Flex
        flex="1"
        justify="center"
        direction="column"
        bg="white"
        color="gray.900"
      >
        <Text fontSize="3xl" fontWeight="bold" mb={2} >
          Bem vindo,
        </Text>
        <Text fontSize="xl" >
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
          <Text fontSize="2xl" fontWeight="bold" ml={2} >
            Enemy<Text as="span" color="red.600">Monitor</Text>
          </Text>
        </Center>
        <Box w="full" maxW="md">
          <Stack spacing={4}>
            <FormControl id="username">
              <FormLabel>Usuário</FormLabel>
              <Input
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="gray.800"
                color="white"
                borderColor="gray.700"
                _hover={{ borderColor: 'gray.600' }}
              />
            </FormControl>
            <FormControl id="password">
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
