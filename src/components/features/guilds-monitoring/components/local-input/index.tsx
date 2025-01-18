import type { FC } from 'react'

import { Box, Input, List, ListItem, Portal } from '@chakra-ui/react'

import type { GuildMemberResponse } from '../../../../../types/guild-member.interface'
import { useLocalInput } from '../../hooks/useLocalInput'

interface LocalInputProps {
  member: GuildMemberResponse
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void
  fontSize: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export const LocalInput: FC<LocalInputProps> = ({ member, onLocalChange, fontSize, onClick }) => {
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
  } = useLocalInput({ member, onLocalChange })

  return (
    <Box position="relative" onClick={onClick} width="100%">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Local Hunt"
        onFocus={updateDropdownPosition}
        bg="black.800"
        size="xs"
        fontSize={fontSize}
        width="100%"
        color="white"
      />
      {isDropdownOpen && filteredOptions.length > 0 && (
        <Portal>
          <Box
            ref={dropdownRef}
            position="absolute"
            zIndex={1000}
            bg="red.900"
            borderColor="red.700"
            borderWidth="1px"
            borderRadius="md"
            maxHeight="200px"
            overflowY="auto"
            width={`${dropdownPosition.width}px`}
            top={`${dropdownPosition.top}px`}
            left={`${dropdownPosition.left}px`}
          >
            <List>
              {filteredOptions.map(option => (
                <ListItem
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  p={2}
                  _hover={{ bg: 'black.700', cursor: 'pointer' }}
                  color="white"
                >
                  {option}
                </ListItem>
              ))}
            </List>
          </Box>
        </Portal>
      )}
    </Box>
  )
}
