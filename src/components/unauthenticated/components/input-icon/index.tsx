import React from 'react'
import {
  FormControl,
  FormLabel,
  Input,
  Icon,
  Flex,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react'
import { InputWithIconProps } from './types'

const InputWithIcon: React.FC<InputWithIconProps> = ({
  icon,
  label,
  value,
  onChange,
  placeholder,
}) => {
  const inputSize = useBreakpointValue({ base: 'lg', md: 'md' })

  return (
    <FormControl>
      <FormLabel fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color="gray.600" mb={2}>
        <Flex align="center" gap={2}>
          <Icon as={icon} />
          {label}
        </Flex>
      </FormLabel>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size={inputSize}
        bg={useColorModeValue('gray.50', 'gray.800')}
        borderWidth="2px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        _hover={{ borderColor: 'red.400' }}
        _focus={{
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
          transform: 'scale(1.01)',
        }}
        transition="all 0.2s"
        h={{ base: '50px', md: '40px' }}
        fontSize={{ base: 'md', md: 'sm' }}
      />
    </FormControl>
  )
}

export default InputWithIcon
