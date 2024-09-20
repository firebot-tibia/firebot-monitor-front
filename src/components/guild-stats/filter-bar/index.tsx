import React from 'react';
import { SimpleGrid, Select, Input } from '@chakra-ui/react';
import { Vocations } from '../../../constant/character';

interface FilterBarProps {
  filter: string;
  vocationFilter: string;
  nameFilter: string;
  onFilterChange: (filter: string) => void;
  onVocationFilterChange: (vocation: string) => void;
  onNameFilterChange: (name: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  vocationFilter,
  nameFilter,
  onFilterChange,
  onVocationFilterChange,
  onNameFilterChange,
}) => {
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
      <Input
        placeholder="Buscar personagem por nome"
        value={nameFilter}
        width={{ base: '100%', md: 'auto' }}
        onChange={(e) => onNameFilterChange(e.target.value)}
      />
    </SimpleGrid>
  );
};

export default FilterBar;