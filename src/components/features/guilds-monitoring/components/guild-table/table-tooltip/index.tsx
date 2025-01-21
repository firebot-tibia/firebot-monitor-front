import type { FC } from 'react'

import {
  IconButton,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  VStack,
  Text,
  Link,
  Box,
  Divider,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { MoreHorizontal, Clock, User, Award, Sword } from 'lucide-react'
import NextLink from 'next/link'

import { routes } from '@/constants/routes'

import type { CharacterTooltipProps } from './types'

const sanitizeName = (name: string): string => {
  return name
    .normalize('NFKD')
    .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, ' ')
    .trim()
}

export const CharacterTooltip: FC<CharacterTooltipProps> = ({ member, isOpen, onToggle }) => {
  const bgColor = useColorModeValue('gray.800', 'gray.900')
  const borderColor = useColorModeValue('gray.700', 'gray.600')
  const textColor = useColorModeValue('gray.100', 'gray.200')

  const handleClose = () => {
    onToggle()
  }

  return (
    <Box display="inline-block">
      <Popover
        isOpen={isOpen}
        onClose={handleClose}
        closeOnBlur={true}
        closeOnEsc={true}
        placement="right"
        gutter={12}
      >
        <PopoverTrigger>
          <IconButton
            aria-label="More info"
            icon={<MoreHorizontal size={16} />}
            size="xs"
            variant="ghost"
            ml={1}
            _hover={{
              bg: 'whiteAlpha.200',
              transform: 'scale(1.1)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            transition="all 0.2s"
            onClick={e => {
              e.stopPropagation()
              onToggle()
            }}
          />
        </PopoverTrigger>

        <PopoverContent
          bg={bgColor}
          borderColor={borderColor}
          boxShadow="lg"
          _focusVisible={{ outline: 'none' }}
          width="250px"
        >
          <PopoverCloseButton
            top={3}
            right={3}
            onClick={handleClose}
            _hover={{
              bg: 'whiteAlpha.200',
            }}
          />

          <PopoverBody p={4}>
            <VStack align="stretch" spacing={3}>
              {/* Header */}
              <Box>
                <HStack spacing={2} mb={1}>
                  <User size={14} />
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    {member.Name}
                  </Text>
                </HStack>
                <Divider borderColor={borderColor} />
              </Box>

              {/* Stats */}
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Award size={14} />
                    <Text fontSize="xs" color={textColor}>
                      Level
                    </Text>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="xs">
                    {member.Level}
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Sword size={14} />
                    <Text fontSize="xs" color={textColor}>
                      Vocation
                    </Text>
                  </HStack>
                  <Badge colorScheme="blue" fontSize="xs">
                    {member.Vocation}
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Clock size={14} />
                    <Text fontSize="xs" color={textColor}>
                      Online
                    </Text>
                  </HStack>
                  <Badge colorScheme="green" fontSize="xs">
                    {member.TimeOnline}
                  </Badge>
                </HStack>
              </VStack>

              <Divider borderColor={borderColor} />

              {/* Footer */}
              <Link
                as={NextLink}
                href={`${routes.statistics}/${encodeURIComponent(sanitizeName(member.Name))}`}
                color="red.300"
                fontSize="xs"
                textAlign="center"
                py={1}
                borderRadius="md"
                _hover={{
                  bg: 'whiteAlpha.100',
                  textDecoration: 'none',
                }}
                transition="all 0.2s"
                onClick={handleClose}
              >
                Ver estatísticas detalhadas →
              </Link>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}
