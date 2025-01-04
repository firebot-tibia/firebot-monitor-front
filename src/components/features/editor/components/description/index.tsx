'use client'
import React from 'react'
import {
  Box,
  Button,
  Text,
  Grid,
  GridItem,
  VStack,
  Container,
  Heading,
  Icon,
  Fade,
} from '@chakra-ui/react'
import { FaCopy, FaUserAlt, FaHammer, FaUserEdit, FaPlus } from 'react-icons/fa'
import InputWithIcon from '../input-icon'
import { useDescriptionEditor } from '../../hooks/useDescriptions'
import { DescriptionEditorSkeleton } from './description-editor-skeleton'

const DescriptionEditor: React.FC = () => {
  const {
    formState,
    generatedDescription,
    isLoading,
    containerWidth,
    padding,
    cardBg,
    borderColor,
    descriptionBg,
    handleInputChange,
    addMaker,
    copyToClipboard,
  } = useDescriptionEditor()

  if (isLoading) return <DescriptionEditorSkeleton />

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
