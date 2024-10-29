import { useState, useRef, useEffect } from "react";
import { GuildMemberResponse } from "../../../../shared/interface/guild/guild-member.interface";
import { useRespawnsStore } from "../../../../store/respawn-store";

interface UseLocalInputProps {
  member: GuildMemberResponse;
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
}

export const useLocalInput = ({ member, onLocalChange }: UseLocalInputProps) => {
  const [inputValue, setInputValue] = useState(member.Local || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isDropdownSelection, setIsDropdownSelection] = useState(false);
  const dropdownSelectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { respawns, fetchRespawns, isLoading } = useRespawnsStore();

  useEffect(() => {
    return () => {
      if (dropdownSelectionTimeoutRef.current) {
        clearTimeout(dropdownSelectionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchRespawns();
  }, [fetchRespawns]);

  useEffect(() => {
    if (!isDropdownSelection) {
      setInputValue(member.Local || "");
    }
  }, [member.Local, isDropdownSelection]);

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    setIsDropdownSelection(false);

    if (respawns.length === 0 && !isLoading) {
      await fetchRespawns();
    }

    if (value.trim()) {
      const filtered = respawns
        .filter((respawn) =>
          respawn.name.toLowerCase().includes(value.toLowerCase())
        )
        .map((respawn) => respawn.name);

      setFilteredOptions(filtered);
      setIsDropdownOpen(filtered.length > 0);
    } else {
      setFilteredOptions([]);
      setIsDropdownOpen(false);
    }
  };

  const handleOptionClick = (optionLabel: string) => {
    if (dropdownSelectionTimeoutRef.current) {
      clearTimeout(dropdownSelectionTimeoutRef.current);
    }

    setIsDropdownSelection(true);
    setInputValue(optionLabel);

    const updatedMember = { ...member, Local: optionLabel };
    onLocalChange(updatedMember, optionLabel);

    setFilteredOptions([]);
    setIsDropdownOpen(false);

    dropdownSelectionTimeoutRef.current = setTimeout(() => {
      setIsDropdownSelection(false);
    }, 500);
  };

  const applyChange = () => {
    if (!isDropdownSelection && inputValue !== member.Local) {
      const updatedMember = { ...member, Local: inputValue };
      onLocalChange(updatedMember, inputValue);
    }
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyChange();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!isDropdownSelection) {
        applyChange();
      }
    }, 200);
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
        if (!isDropdownSelection) {
          applyChange();
        }
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
  }, [isDropdownOpen, inputValue, member, isDropdownSelection]);

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
    isLoading,
  };
};