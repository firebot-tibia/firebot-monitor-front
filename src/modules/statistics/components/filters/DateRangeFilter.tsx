import React from 'react'

import { Box, FormControl, FormLabel, HStack, Input, useColorModeValue } from '@chakra-ui/react'

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangeFilterProps {
  startDate: Date | null
  endDate: Date | null
  onChange: (range: DateRange) => void
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const labelColor = useColorModeValue('gray.700', 'gray.300')

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      startDate: e.target.value ? new Date(e.target.value) : null,
      endDate,
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      startDate,
      endDate: e.target.value ? new Date(e.target.value) : null,
    })
  }

  return (
    <FormControl>
      <FormLabel color={labelColor} fontSize="sm">
        Período
      </FormLabel>
      <HStack spacing={2}>
        <Box flex={1}>
          <Input
            type="date"
            size="sm"
            value={startDate?.toISOString().split('T')[0] || ''}
            onChange={handleStartDateChange}
            borderColor={borderColor}
            _hover={{ borderColor: 'blue.400' }}
          />
        </Box>
        <Box flex={1}>
          <Input
            type="date"
            size="sm"
            value={endDate?.toISOString().split('T')[0] || ''}
            onChange={handleEndDateChange}
            borderColor={borderColor}
            _hover={{ borderColor: 'blue.400' }}
          />
        </Box>
      </HStack>
    </FormControl>
  )
}
