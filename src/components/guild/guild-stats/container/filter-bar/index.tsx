import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Input,
  Button,
  Flex,
  VStack,
  Text,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Image,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Vocations } from '../../../../../constant/character';
import { capitalizeFirstLetter } from '../../../../../shared/utils/utils';

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
  const [searchInput, setSearchInput] = useState(nameFilter);

  const handleSearch = () => {
      onNameFilterChange(searchInput);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box bg="gray.900" p={4} borderRadius="md" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold" color="white">Filtros</Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              bg="gray.800"
              color="white"
              borderColor="gray.700"
              _hover={{ bg: "gray.700", borderColor: "gray.600" }}
              _expanded={{ bg: "gray.700" }}
            >
              {filter || "Selecione o período"}
            </MenuButton>
            <MenuList bg="gray.800" borderColor="gray.700">
              <MenuItem onClick={() => onFilterChange("Diaria")} bg="gray.800" _hover={{ bg: "gray.700" }}>Diária</MenuItem>
              <MenuItem onClick={() => onFilterChange("Semanal")} bg="gray.800" _hover={{ bg: "gray.700" }}>Semanal</MenuItem>
              <MenuItem onClick={() => onFilterChange("Mensal")} bg="gray.800" _hover={{ bg: "gray.700" }}>Mensal</MenuItem>
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              bg="gray.800"
              color="white"
              borderColor="gray.700"
              _hover={{ bg: "gray.700", borderColor: "gray.600" }}
              _expanded={{ bg: "gray.700" }}
            >
              {vocationFilter || "Todas as vocações"}
            </MenuButton>
            <MenuList bg="gray.800" borderColor="gray.700">
              <MenuItem onClick={() => onVocationFilterChange("")} bg="gray.800" _hover={{ bg: "gray.700" }}>
                Todas as vocações
              </MenuItem>
              {Object.keys(Vocations).map((vocation) => (
                <MenuItem
                  key={vocation}
                  onClick={() => onVocationFilterChange(vocation)}
                  bg="gray.800"
                  _hover={{ bg: "gray.700" }} 
                >
                  <HStack spacing={2}>
                    <Image src={Vocations[vocation]} boxSize="20px" alt=''/>
                    <Text>{capitalizeFirstLetter(vocation)}</Text>
                  </HStack>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Flex>
            <InputGroup>
              <Input
                placeholder="Buscar personagem por nome"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                bg="gray.800"
                color="white"
                borderColor="gray.700"
                _hover={{ borderColor: 'gray.600' }}
              />
              <InputRightElement>
                <Button
                  onClick={handleSearch}
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  _hover={{ bg: 'blue.700' }}
                >
                  <SearchIcon />
                </Button>
              </InputRightElement>
            </InputGroup>
          </Flex>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default FilterBar;