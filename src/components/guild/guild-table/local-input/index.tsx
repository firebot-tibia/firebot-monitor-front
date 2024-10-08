import React, { FC, useState, useMemo, useRef, useEffect } from "react";
import { Box, Input, List, ListItem, Portal } from "@chakra-ui/react";
import { respawns } from "../../../../constant/respawn";
import { GuildMemberResponse } from "../../../../shared/interface/guild/guild-member.interface";

interface LocalInputProps {
  member: GuildMemberResponse;
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  fontSize: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const LocalInput: FC<LocalInputProps> = ({
  member,
  onLocalChange,
  fontSize,
  onClick,
}) => {
  const [inputValue, setInputValue] = useState(member.Local || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const respawnOptions = useMemo(() => {
    return respawns.flatMap((city) =>
      city.spawns.map((spawn: any) => ({
        value: `${spawn.name}`,
        name: spawn.name,
        label: `${spawn.name}`,
      }))
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const filtered = respawnOptions
      .filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      )
      .map((option) => option.label);

    setFilteredOptions(filtered);
    setIsDropdownOpen(filtered.length > 0);
  };

  const applyChange = () => {
    onLocalChange(member, inputValue);
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyChange();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      applyChange();
    }, 200);
  };

  const handleOptionClick = (optionLabel: string) => {
    const selectedOption = respawnOptions.find(
      (option) => option.label === optionLabel
    );

    if (selectedOption) {
      setInputValue(selectedOption.name);
      onLocalChange(member, selectedOption.name);
    }

    setFilteredOptions([]);
    setIsDropdownOpen(false);
  };

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (isDropdownOpen) {
        updateDropdownPosition();
      }
    };

    updateDropdownPosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateDropdownPosition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [isDropdownOpen]);

  return (
    <Box position="relative" onClick={onClick} width="100%">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Local Hunt"
        onFocus={() => {
          setIsDropdownOpen(true);
          updateDropdownPosition();
        }}
        bg="gray.800"
        size="xs"
        fontSize={fontSize}
        width="100%"
        color="white"
      />
      {isDropdownOpen && (
        <Portal>
          <Box
            ref={dropdownRef}
            position="absolute"
            zIndex={1000}
            bg="gray.900"
            borderColor="gray.700"
            borderWidth="1px"
            borderRadius="md"
            maxHeight="200px"
            overflowY="auto"
            width={`${dropdownPosition.width}px`}
            top={`${dropdownPosition.top}px`}
            left={`${dropdownPosition.left}px`}
          >
            <List>
              {filteredOptions.map((option) => (
                <ListItem
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  p={2}
                  _hover={{ bg: "gray.700", cursor: "pointer" }}
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
  );
};