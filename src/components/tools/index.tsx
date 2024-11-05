import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  Button,
  Text,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  useToast,
  VStack,
  Container,
  Heading,
  Icon,
  Fade,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCopy, FaUserAlt, FaHammer, FaBomb, FaMagic, FaUserEdit } from 'react-icons/fa';

interface InputWithIconProps {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const DescriptionEditor: React.FC = () => {
  const [mainChar, setMainChar] = useState("");
  const [maker, setMaker] = useState("");
  const [bombChar, setBombChar] = useState("");
  const [sdChar, setSDChar] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const generateDescription = () => {
    return `Main: ${mainChar} | Maker: ${maker} | BombChar: ${bombChar} | SDChar: ${sdChar} - ${registeredBy}`;
  };

  useEffect(() => {
    setGeneratedDescription(generateDescription());
  }, [mainChar, maker, bombChar, sdChar, registeredBy]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDescription).then(() => {
      toast({
        title: "Copiado!",
        description: "Descrição copiada com sucesso!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
        variant: "subtle",
      });
    }).catch(err => {
      console.error('Erro ao copiar: ', err);
      toast({
        title: "Erro",
        description: "Não foi possível copiar a descrição",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    });
  };


  const InputWithIcon: React.FC<InputWithIconProps> = ({
    icon,
    label,
    value,
    onChange,
    placeholder
  }) => (
    <FormControl>
      <FormLabel color="gray.500" fontSize="sm" fontWeight="medium">
        <Flex align="center" gap={2}>
          <Icon as={icon} />
          {label}
        </Flex>
      </FormLabel>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        bg={inputBg}
        borderColor={borderColor}
        _hover={{ borderColor: "red.500" }}
        _focus={{ borderColor: "red.500", boxShadow: "0 0 0 1px var(--chakra-colors-red-500)" }}
        transition="all 0.2s"
      />
    </FormControl>
  );

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>Editor de Descrição</Heading>
          <Text color="gray.500">Crie sua descrição personalizada</Text>
        </Box>

        <Box
          bg={cardBg}
          p={8}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ boxShadow: "2xl" }}
        >
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <VStack spacing={4}>
                <InputWithIcon
                  icon={FaUserAlt}
                  label="Character Principal"
                  value={mainChar}
                  onChange={(e) => setMainChar(e.target.value)}
                  placeholder="Digite o nome do char principal"
                />
                <InputWithIcon
                  icon={FaHammer}
                  label="Maker"
                  value={maker}
                  onChange={(e) => setMaker(e.target.value)}
                  placeholder="Digite o nome do maker"
                />
              </VStack>
            </GridItem>

            <GridItem>
              <VStack spacing={4}>
                <InputWithIcon
                  icon={FaBomb}
                  label="Bomb Character"
                  value={bombChar}
                  onChange={(e) => setBombChar(e.target.value)}
                  placeholder="Digite o nome do bomb char"
                />
                <InputWithIcon
                  icon={FaMagic}
                  label="SD Character"
                  value={sdChar}
                  onChange={(e) => setSDChar(e.target.value)}
                  placeholder="Digite o nome do SD char"
                />
              </VStack>
            </GridItem>
          </Grid>

          <Box mt={6}>
            <InputWithIcon
              icon={FaUserEdit}
              label="Registrado por"
              value={registeredBy}
              onChange={(e) => setRegisteredBy(e.target.value)}
              placeholder="Digite seu nome"
            />
          </Box>

          <Fade in={!!generatedDescription}>
            <Box mt={6} p={4} bg={inputBg} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Text color="gray.500" mb={2} fontSize="sm" fontWeight="medium">
                Descrição Gerada
              </Text>
              <Text fontWeight="medium" fontSize="md">
                {generatedDescription}
              </Text>
            </Box>
          </Fade>

          <Button
            w="full"
            mt={6}
            size="lg"
            bg="red.900"
            color="white"
            _hover={{ bg: "red.800" }}
            _active={{ bg: "red.700" }}
            leftIcon={<FaCopy />}
            onClick={copyToClipboard}
            transition="all 0.3s"
          >
            Copiar Descrição
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default DescriptionEditor;