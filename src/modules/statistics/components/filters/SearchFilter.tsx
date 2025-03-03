import React from 'react'

import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from '@chakra-ui/react'
import { Search } from 'lucide-react'

interface SearchFilterProps {
  value: string
  onChange: (name: string) => void
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ value, onChange }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const labelColor = useColorModeValue('gray.700', 'gray.300')
  const iconColor = useColorModeValue('gray.400', 'gray.500')

  return (
    <FormControl>
      <FormLabel color={labelColor} fontSize="sm">
        Buscar Personagem
      </FormLabel>
      <InputGroup size="sm">
        <InputLeftElement pointerEvents="none">
          <Search size={16} color={iconColor} />
        </InputLeftElement>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Nome do personagem..."
          borderColor={borderColor}
          _hover={{ borderColor: 'blue.400' }}
          _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
        />
      </InputGroup>
    </FormControl>
  )
}
