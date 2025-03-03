import React from 'react'

import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'

interface StatsCardProps {
  title: string
  value: string
  icon: string
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const titleColor = useColorModeValue('gray.600', 'gray.400')
  const valueColor = useColorModeValue('gray.900', 'white')

  return (
    <Box
      bg={bgColor}
      p={4}
      borderRadius="lg"
      borderWidth={1}
      borderColor={borderColor}
      minW="200px"
    >
      <Flex align="center" mb={2}>
        <Text fontSize="xl" mr={2}>
          {icon}
        </Text>
        <Text fontSize="sm" color={titleColor}>
          {title}
        </Text>
      </Flex>
      <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
        {value}
      </Text>
    </Box>
  )
}
