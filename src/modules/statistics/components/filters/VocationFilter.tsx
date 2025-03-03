import React from 'react'

import { FormControl, FormLabel, Select, useColorModeValue } from '@chakra-ui/react'

interface VocationFilterProps {
  value: string
  onChange: (vocation: string) => void
}

const VOCATIONS = [
  { value: '', label: 'Todas' },
  { value: 'Knight', label: 'Knight' },
  { value: 'Paladin', label: 'Paladin' },
  { value: 'Druid', label: 'Druid' },
  { value: 'Sorcerer', label: 'Sorcerer' },
]

export const VocationFilter: React.FC<VocationFilterProps> = ({ value, onChange }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const labelColor = useColorModeValue('gray.700', 'gray.300')

  return (
    <FormControl>
      <FormLabel color={labelColor} fontSize="sm">
        Vocação
      </FormLabel>
      <Select
        size="sm"
        value={value}
        onChange={e => onChange(e.target.value)}
        borderColor={borderColor}
        _hover={{ borderColor: 'blue.400' }}
      >
        {VOCATIONS.map(vocation => (
          <option key={vocation.value} value={vocation.value}>
            {vocation.label}
          </option>
        ))}
      </Select>
    </FormControl>
  )
}
