import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { ElementType } from 'react';

interface InputWithIconProps {
  icon: ElementType;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({
  icon,
  label,
  value,
  onChange,
  placeholder
}) => {
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <FormControl>
      <FormLabel color="gray.500" fontSize="sm" fontWeight="medium">
        <Flex align="center" gap={2}>
          <Icon as={icon} />
          {label}
        </Flex>
      </FormLabel>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        bg={inputBg}
        borderColor={borderColor}
        _hover={{ borderColor: "red.500" }}
        _focus={{
          borderColor: "red.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-red-500)"
        }}
        transition="all 0.2s"
      />
    </FormControl>
  );
};