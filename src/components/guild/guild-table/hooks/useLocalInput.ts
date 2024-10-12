import { useState, useMemo, useRef, useEffect } from "react";
import { respawns } from "../../../../constant/respawn";
import { GuildMemberResponse } from "../../../../shared/interface/guild/guild-member.interface";

interface UseLocalInputProps {
  member: GuildMemberResponse;
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
}

export const useLocalInput = ({ member, onLocalChange }: UseLocalInputProps) => {
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

  const handleInputChange = (value: string) => {
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

  return {
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
  };
};
