'use client';

import { Button, Text, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const Custom404 = () => {
  const router = useRouter();

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bg="gray.900"
      color="white"
      direction="column"
    >
      <Text fontSize="6xl" fontWeight="bold" mb={4}>
        404
      </Text>
      <Text fontSize="2xl" mb={6}>
        Página não encontrada
      </Text>
      <Button
        colorScheme="red"
        size="lg"
        onClick={() => router.push('/')}
      >
        Voltar para o Início
      </Button>
    </Flex>
  );
};

export default Custom404;
