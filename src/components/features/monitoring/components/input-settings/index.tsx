import React, { memo, useEffect, useState } from 'react'

import { HStack, Text } from '@chakra-ui/react'

const InputField = memo(
  ({
    value,
    onChange,
    width = '40px',
    suffix,
    min = 1,
  }: {
    value: number
    onChange: (value: number) => void
    width?: string
    suffix?: string
    min?: number
  }) => {
    const [localValue, setLocalValue] = useState(value.toString())

    useEffect(() => {
      setLocalValue(value.toString())
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)

      const numValue = parseInt(newValue)
      if (!isNaN(numValue) && numValue >= min) {
        onChange(numValue)
      }
    }

    const handleBlur = () => {
      const numValue = parseInt(localValue)
      if (isNaN(numValue) || numValue < min) {
        setLocalValue(value.toString())
      }
    }

    return (
      <HStack spacing={1}>
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          style={{
            width,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: 'white',
            fontSize: '14px',
            padding: '2px 6px',
            outline: 'none',
          }}
        />
        {suffix && (
          <Text fontSize="xs" color="whiteAlpha.600">
            {suffix}
          </Text>
        )}
      </HStack>
    )
  },
)

export default InputField
InputField.displayName = 'InputField'
