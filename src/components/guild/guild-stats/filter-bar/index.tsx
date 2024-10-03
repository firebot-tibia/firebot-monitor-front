import React, { useState } from 'react';
import { SimpleGrid, Select, Input, Button, Flex, useToast } from '@chakra-ui/react';
import { Vocations } from '../../../../constant/character';
import { z } from 'zod';

interface FilterBarProps {
  filter: string;
  vocationFilter: string;
  nameFilter: string;
  onFilterChange: (filter: string) => void;
  onVocationFilterChange: (vocation: string) => void;
  onNameFilterChange: (name: string) => void;
}

const searchSchema = z.string().min(3, "O nome deve ter pelo menos 3 caracteres");

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  vocationFilter,
  nameFilter,
  onFilterChange,
  onVocationFilterChange,
  onNameFilterChange,
}) => {
  const [searchInput, setSearchInput] = useState(nameFilter);
  const toast = useToast();

  const handleSearch = () => {
    try {
      searchSchema.parse(searchInput);
      onNameFilterChange(searchInput);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
      <Select 
        value={filter} 
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="Diaria">Diária</option>
        <option value="Semanal">Semanal</option>
        <option value="Mensal">Mensal</option>
      </Select>
      <Select 
        value={vocationFilter} 
        onChange={(e) => onVocationFilterChange(e.target.value)}
      >
        <option value="">Todas as vocações</option>
        {Object.keys(Vocations).map((vocation) => (
          <option key={vocation} value={vocation}>
            {vocation}
          </option>
        ))}
      </Select>
      <Flex>
        <Input
          placeholder="Buscar personagem por nome"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          mr={2}
        />
        <Button onClick={handleSearch}>Buscar</Button>
      </Flex>
    </SimpleGrid>
  );
};

export default FilterBar;