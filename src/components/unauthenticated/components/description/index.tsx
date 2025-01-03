'use client'
import React, { useState, useEffect } from 'react'
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
  useBreakpointValue,
  Skeleton,
} from '@chakra-ui/react'
import { FaCopy, FaUserAlt, FaHammer, FaUserEdit, FaPlus } from 'react-icons/fa'
import InputWithIcon from '../input-icon'

interface FormState {
  mainChar: string
  makers: string[]
  registeredBy: string
}

const DescriptionEditorSkeleton = () => {
  return (
    <Container maxW={{ base: '95%', sm: '85%', md: 'container.md' }} py={{ base: 4, md: 10 }}>
      <VStack spacing={{ base: 4, md: 8 }} align="stretch">
        <Box textAlign="center">
          <Skeleton height="30px" width="200px" mx="auto" mb={2} />
          <Skeleton height="20px" width="150px" mx="auto" />
        </Box>

        <Box
          p={{ base: 4, md: 8 }}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.200"
        >
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={{ base: 4, md: 6 }}>
            <GridItem>
              <VStack spacing={4}>
                <Skeleton height="70px" width="100%" />
                <Skeleton height="70px" width="100%" />
                <Skeleton height="70px" width="100%" />
              </VStack>
            </GridItem>
            <GridItem>
              <Skeleton height="70px" width="100%" />
            </GridItem>
          </Grid>

          <Skeleton height="100px" width="100%" mt={6} />
          <Skeleton height="50px" width="100%" mt={6} />
        </Box>
      </VStack>
    </Container>
  )
}

const DescriptionEditor: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    mainChar: '',
    makers: [''],
    registeredBy: '',
  })
  const [generatedDescription, setGeneratedDescription] = useState('')
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)

  const containerWidth = useBreakpointValue({
    base: '95%',
    sm: '85%',
    md: 'container.md',
  })
  const padding = useBreakpointValue({ base: 4, md: 8 })
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const descriptionBg = useColorModeValue('gray.50', 'gray.700')

  useEffect(() => {
    const activeFields = [
      formState.mainChar && `Main: ${formState.mainChar}`,
      formState.makers.some((m) => m.trim()) &&
        `Maker: ${formState.makers.filter((m) => m.trim()).join(', ')}`,
      formState.registeredBy && `Reg: ${formState.registeredBy}`,
    ].filter(Boolean)

    setGeneratedDescription(activeFields.join(' | '))
  }, [formState])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <DescriptionEditorSkeleton />

  const handleInputChange =
    (field: keyof FormState, index?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === 'makers' && typeof index === 'number') {
        const makers = [...formState.makers]
        makers[index] = e.target.value
        setFormState((prev) => ({ ...prev, makers }))
      } else {
        setFormState((prev) => ({ ...prev, [field]: e.target.value }))
      }
    }

  const addMaker = () => {
    setFormState((prev) => ({
      ...prev,
      makers: [...prev.makers, ''],
    }))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDescription)
      toast({
        title: 'Copiado!',
        description: 'Descrição copiada com sucesso!',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar a descrição',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      })
    }
  }

  return (
    <Container maxW={containerWidth} py={{ base: 4, md: 10 }}>
      <VStack spacing={{ base: 4, md: 8 }} align="stretch">
        <Box textAlign="center">
          <Heading size={{ base: 'md', md: 'lg' }} mb={2}>
            Editor de Descrição
          </Heading>
          <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
            Crie sua descrição personalizada
          </Text>
        </Box>

        <Box
          bg={cardBg}
          p={padding}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ boxShadow: '2xl' }}
        >
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={{ base: 4, md: 6 }}>
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
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    w="100%"
                  >
                    <Box flex="1">
                      <InputWithIcon
                        icon={FaHammer}
                        label={`Maker ${index + 1}`}
                        value={maker}
                        onChange={handleInputChange('makers', index)}
                        placeholder="Digite o nome do maker"
                      />
                    </Box>
                    {index === formState.makers.length - 1 && (
                      <Button
                        onClick={addMaker}
                        size={{ base: 'xs', md: 'sm' }}
                        colorScheme="red"
                        variant="ghost"
                        leftIcon={<FaPlus />}
                        ml={2}
                        mt={{ base: 6, md: 7 }}
                      />
                    )}
                  </Box>
                ))}
              </VStack>
            </GridItem>

            <GridItem>
              <VStack spacing={4}>
                <InputWithIcon
                  icon={FaUserEdit}
                  label="Registrado por"
                  value={formState.registeredBy}
                  onChange={handleInputChange('registeredBy')}
                  placeholder="Digite seu nome"
                />
              </VStack>
            </GridItem>
          </Grid>

          <Fade in={!!generatedDescription}>
            <Box
              mt={6}
              p={4}
              bg={descriptionBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Text color="gray.500" mb={2} fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">
                Descrição Gerada
              </Text>
              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }} wordBreak="break-word">
                {generatedDescription}
              </Text>
            </Box>
          </Fade>

          <Button
            w="full"
            mt={6}
            size={{ base: 'md', md: 'lg' }}
            bg="red.900"
            color="white"
            _hover={{ bg: 'red.800' }}
            _active={{ bg: 'red.700' }}
            leftIcon={<Icon as={FaCopy} />}
            onClick={copyToClipboard}
            transition="all 0.2s"
            isDisabled={!generatedDescription}
          >
            Copiar Descrição
          </Button>
        </Box>
      </VStack>
    </Container>
  )
}

export default DescriptionEditor
