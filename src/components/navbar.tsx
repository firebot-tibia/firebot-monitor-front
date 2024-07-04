'use client'

import { Box, Container, Flex, Heading, HStack, Image, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

export function Navbar() {
  return (
    <Box bg="white" boxShadow="md">
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center">
          <HStack spacing={8}>
            <NextLink href="/" passHref>
              <Link display="flex" alignItems="center">
                <Image src="/assets/tibia-logo.png" alt="Tibia Logo" boxSize="50px" />
              </Link>
            </NextLink>
            <Heading size="lg" color="blue.600">
              Tibia Guild
            </Heading>
          </HStack>
          <HStack spacing={8}>
            <NextLink href="/" passHref>
              <Link fontSize="lg" color="blue.600" _hover={{ color: 'blue.800' }}>
                Home
              </Link>
            </NextLink>
            <NextLink href="/about" passHref>
              <Link fontSize="lg" color="blue.600" _hover={{ color: 'blue.800' }}>
                About
              </Link>
            </NextLink>
            <NextLink href="/contact" passHref>
              <Link fontSize="lg" color="blue.600" _hover={{ color: 'blue.800' }}>
                Contact
              </Link>
            </NextLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
