import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Grid,
  GridItem,
  useToast,
  VStack,
  Container,
  Heading,
  Icon,
  Fade,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCopy, FaUserAlt, FaHammer, FaUserEdit, FaPlus } from 'react-icons/fa';
import { InputWithIcon } from './input-icon';

interface FormState {
  mainChar: string;
  makers: string[];
  registeredBy: string;
}

const DescriptionEditor: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    mainChar: '',
    makers: [''],
    registeredBy: ''
  });

  const [generatedDescription, setGeneratedDescription] = useState('');

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const descriptionBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    let description = `Main: ${formState.mainChar}`;

    if (formState.makers.length > 0) {
      const makers = formState.makers.filter(maker => maker.trim() !== '');
      description += ` | Maker: ${makers.join(', ')}`;
    }

    if (formState.registeredBy) {
      description += ` | Reg: ${formState.registeredBy}`;
    }

    setGeneratedDescription(description);
  }, [formState]);

  const handleInputChange = (field: keyof FormState, index?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'makers') {
      const makers = [...formState.makers];
      makers[index!] = e.target.value;
      setFormState(prev => ({
        ...prev,
        makers
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }
  };

  const addMaker = () => {
    setFormState(prev => ({
      ...prev,
      makers: [...prev.makers, '']
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDescription);
      toast({
        title: "Copiado!",
        description: "Descrição copiada com sucesso!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
        variant: "subtle",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a descrição",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

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
                  value={formState.mainChar}
                  onChange={handleInputChange('mainChar')}
                  placeholder="Digite o nome do char principal"
                />
                {formState.makers.map((maker, index) => (
                  <Box key={index} display="flex" alignItems="center" justifyContent="space-between" w="100%">
                    <InputWithIcon
                      icon={FaHammer}
                      label="Maker"
                      value={maker}
                      onChange={handleInputChange('makers', index)}
                      placeholder="Digite o nome do maker"
                    />
                    <Button
                      onClick={addMaker}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<FaPlus />}
                      ml={4}
                      mt={7}
                    >
                    </Button>
                  </Box>
                ))}
              </VStack>
            </GridItem>
          </Grid>

          <Box mt={6}>
            <InputWithIcon
              icon={FaUserEdit}
              label="Registrado por"
              value={formState.registeredBy}
              onChange={handleInputChange('registeredBy')}
              placeholder="Digite seu nome"
            />
          </Box>

          <Fade in={!!generatedDescription}>
            <Box mt={6} p={4} bg={descriptionBg} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
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
            leftIcon={<Icon as={FaCopy} />}
            onClick={copyToClipboard}
            transition="all 0.2s"
            disabled={!generatedDescription}
          >
            Copiar Descrição
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default DescriptionEditor;