import React from 'react'
import { Box, Container, Text, HStack, Link, VStack } from '@chakra-ui/react'
import { FaInstagram, FaYoutube, FaGithub } from 'react-icons/fa'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Box as="footer" bg="red.900" color="white" py={4} width="full">
      <Container maxW="container.xl" px={4}>
        <VStack spacing={2} mb={2}>
          <Text fontSize={{ base: 'xs', sm: 'sm' }}>
            © Firebot | {currentYear} criado por ssbreno e matheusrps
          </Text>
          <Text fontSize={{ base: 'xs', sm: 'sm' }}>
            Tibia is a registered trademark of ©CipSoft and all products related to Tibia are
            copyright by ©CipSoft GmbH
          </Text>
        </VStack>

        <HStack justify="center" spacing={4}>
          <Link
            href="https://www.instagram.com/firebot_tibia/"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: 'yellow.500' }}
            transition="colors 0.2s"
          >
            <FaInstagram size={20} />
          </Link>
          <Link
            href="https://www.youtube.com/@firebot-tibia"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: 'yellow.500' }}
            transition="colors 0.2s"
          >
            <FaYoutube size={20} />
          </Link>
          <Link
            href="https://github.com/ssbreno"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: 'yellow.500' }}
            transition="colors 0.2s"
          >
            <FaGithub size={20} />
          </Link>
          <Link
            href="https://github.com/matheusrps"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: 'yellow.500' }}
            transition="colors 0.2s"
          >
            <FaGithub size={20} />
          </Link>
        </HStack>
      </Container>
    </Box>
  )
}

export default Footer
