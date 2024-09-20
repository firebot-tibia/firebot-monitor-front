import { Box, Input, List, ListItem } from "@chakra-ui/react";
import { FC, useState, useMemo } from "react";
import { respawns } from "../../../constant/respawn";
import { GuildMemberResponse } from "../../../shared/interface/guild-member.interface";

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

  const respawnOptions = useMemo(() => {
    return respawns.flatMap((city) =>
      city.spawns.map((spawn: any) => ({
        value: `[${city.city}] [${spawn.code}] ${spawn.name}`,
        name: spawn.name,
        label: `[${city.city}] [${spawn.code}] ${spawn.name}`,
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
    setIsDropdownOpen(true);

    onLocalChange(member, value);
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
  
  return (
    <Box position="relative" onClick={onClick} width="100%">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Local Hunt"
        onFocus={() => setIsDropdownOpen(true)}
        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} 
        bg="gray.800"
        size="xs"
        fontSize={fontSize}
        width="100%"
        minWidth="80px"
        overflowY="auto"
        color="white"
        _placeholder={{ color: "gray.400" }}
      />

      {isDropdownOpen && filteredOptions.length > 0 && (
        <List
          position="absolute"
          zIndex={1}
          bg="gray.900"
          width="100%"
          maxHeight="250px"
          overflowY="auto"
          border="1px solid gray"
          boxShadow="md"
          borderRadius="md"
          p={2}
        >
          {filteredOptions.map((option) => (
            <ListItem
              key={option}
              onClick={() => handleOptionClick(option)}
              p={2}
              borderRadius="md"
              _hover={{ bg: "gray.700", cursor: "pointer" }}
              _focus={{ bg: "gray.600" }}
              color="white"
            >
              {option}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
