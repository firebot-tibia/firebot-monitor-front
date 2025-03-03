import type { FC } from 'react'

import {
  Box,
  Input,
  List,
  ListItem,
  Portal,
  VStack,
  Text,
  InputGroup,
  InputRightElement,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react'
import { Search, MapPin } from 'lucide-react'

import { useLocalInput } from '@/modules/monitoring/hooks/useExivaInput'

import type { ExivaInputProps } from './types'

export const ExivaInput: FC<ExivaInputProps> = ({
  member,
  onLocalChange,
  fontSize = '14px',
  onClick,
}) => {
  const {
    inputValue,
    isDropdownOpen,
    filteredOptions,
    dropdownPosition,
    inputRef,
    dropdownRef,
    handleInputChange,
    handleKeyDown,
    handleBlur,
    handleOptionClick,
    updateDropdownPosition,
    isLoading,
    recentLocations,
  } = useLocalInput({ member, onLocalChange })

  const dropdownBg = useColorModeValue('gray.800', 'gray.900')
  const dropdownBorder = useColorModeValue('gray.700', 'gray.800')
  const hoverBg = useColorModeValue('gray.700', 'gray.800')

  return (
    <Box position="relative" onClick={onClick} width="100%">
      <InputGroup size="sm">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Sem exiva"
          onFocus={updateDropdownPosition}
          bg="transparent"
          fontSize={fontSize}
          width="100%"
          color="yellow.200"
          border="1px solid transparent"
          _hover={{ borderColor: 'whiteAlpha.200' }}
          _focus={{
            borderColor: 'whiteAlpha.300',
            bg: 'whiteAlpha.50',
          }}
          pl={1}
          pr={1}
          height="24px"
        />
        <InputRightElement h="16px" w="16px">
          {isLoading ? (
            <Spinner size="xs" color="gray.400" />
          ) : (
            <Search size={12} color="gray.400" />
          )}
        </InputRightElement>
      </InputGroup>

      {isDropdownOpen && (
        <Portal>
          <Box
            ref={dropdownRef}
            position="fixed"
            zIndex={1000}
            bg={dropdownBg}
            borderColor={dropdownBorder}
            borderWidth="1px"
            borderRadius="sm"
            maxHeight="300px"
            overflowY="auto"
            width={`${dropdownPosition.width}px`}
            top={`${dropdownPosition.top + 4}px`}
            left={`${dropdownPosition.left}px`}
            shadow="lg"
            sx={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                bg: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                bg: 'gray.700',
                borderRadius: 'full',
              },
            }}
          >
            <VStack align="stretch" spacing={0}>
              {/* Recent Locations */}
              {recentLocations?.length > 0 && (
                <Box p={1}>
                  <Text fontSize="xs" color="gray.500" px={2} py={1}>
                    Recent Locations
                  </Text>
                  <List>
                    {recentLocations.map(location => (
                      <ListItem
                        key={location}
                        onClick={() => handleOptionClick(location)}
                        px={2}
                        py={1}
                        fontSize={fontSize}
                        color="gray.300"
                        _hover={{
                          bg: hoverBg,
                          cursor: 'pointer',
                          color: 'white',
                        }}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <MapPin size={10} />
                        {location}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Search Results */}
              {filteredOptions.length > 0 && (
                <Box p={1}>
                  {recentLocations?.length > 0 && (
                    <Text fontSize="xs" color="gray.500" px={2} py={1}>
                      All Locations
                    </Text>
                  )}
                  <List>
                    {filteredOptions.map(option => (
                      <ListItem
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        px={2}
                        py={1}
                        fontSize={fontSize}
                        color="gray.300"
                        _hover={{
                          bg: hoverBg,
                          cursor: 'pointer',
                          color: 'white',
                        }}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <Search size={10} />
                        {option}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </VStack>
          </Box>
        </Portal>
      )}
    </Box>
  )
}
