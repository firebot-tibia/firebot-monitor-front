import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Portal,
} from '@chakra-ui/react'
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { capitalizeFirstLetter } from '../../../../../utils/capitalize-first-letter'
import { tableVocationIcons } from '../../../../../utils/table-vocation-icons'

interface FilterBarProps {
  filter: string
  vocationFilter: string
  nameFilter: string
  onFilterChange: (filter: string) => void
  onVocationFilterChange: (vocation: string) => void
  onNameFilterChange: (name: string) => void
  allyGainData: { data: { name: string }[] }
  allyLossData: { data: { name: string }[] }
  enemyGainData: { data: { name: string }[] }
  enemyLossData: { data: { name: string }[] }
}

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  vocationFilter,
  nameFilter,
  onFilterChange,
  onVocationFilterChange,
  onNameFilterChange,
  allyGainData,
  allyLossData,
  enemyGainData,
  enemyLossData,
}) => {
  const [searchInput, setSearchInput] = useState(nameFilter)
  const router = useRouter()

  const handleSearch = () => {
    const characterExists = [allyGainData, allyLossData, enemyGainData, enemyLossData].some(
      (data) => data.data.some((player) => player.name.toLowerCase() === searchInput.toLowerCase()),
    )

    if (!characterExists) {
      router.push(`/guild-stats/${encodeURIComponent(searchInput)}`)
    } else {
      onNameFilterChange(searchInput)
    }
    setSearchInput('')
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const menuButtonStyle = {
    bg: 'red.800',
    color: 'white',
    borderColor: 'red.600',
    _hover: { bg: 'black', borderColor: 'red.500' },
    _expanded: { bg: 'black' },
    transition: 'all 0.2s',
    fontWeight: 'medium',
  }

  const menuListStyle = {
    bg: 'red.900',
    borderColor: 'red.700',
    boxShadow: 'lg',
    mt: '2px',
  }

  const menuItemStyle = {
    bg: 'red.900',
    _hover: { bg: 'black' },
    transition: 'all 0.2s',
  }

  return (
    <Box bg="red.900" p={4} borderRadius="md" boxShadow="lg">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold" color="white">
          Filtros
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Menu placement="bottom" gutter={4}>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} {...menuButtonStyle}>
              {filter || 'Selecione o período'}
            </MenuButton>
            <Portal>
              <MenuList {...menuListStyle}>
                <MenuItem onClick={() => onFilterChange('Diaria')} {...menuItemStyle}>
                  Diária
                </MenuItem>
                <MenuItem onClick={() => onFilterChange('Semanal')} {...menuItemStyle}>
                  Semanal
                </MenuItem>
                <MenuItem onClick={() => onFilterChange('Mensal')} {...menuItemStyle}>
                  Mensal
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>

          <Menu placement="bottom" gutter={4}>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} {...menuButtonStyle}>
              {vocationFilter || 'Todas as vocações'}
            </MenuButton>
            <Portal>
              <MenuList {...menuListStyle}>
                <MenuItem onClick={() => onVocationFilterChange('')} {...menuItemStyle}>
                  Todas as vocações
                </MenuItem>
                {Object.keys(tableVocationIcons).map((vocation) => (
                  <MenuItem
                    key={vocation}
                    onClick={() => onVocationFilterChange(vocation)}
                    {...menuItemStyle}
                  >
                    <HStack spacing={2}>
                      <Image src={tableVocationIcons[vocation]} boxSize="20px" alt="" />
                      <Text>{capitalizeFirstLetter(vocation)}</Text>
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>

          <Flex>
            <InputGroup>
              <Input
                placeholder="Buscar personagem por nome"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                bg="red.800"
                color="white"
                borderColor="red.700"
                _hover={{ borderColor: 'red.600' }}
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #E53E3E' }}
              />
              <InputRightElement>
                <Button
                  onClick={handleSearch}
                  size="sm"
                  bg="red.700"
                  color="white"
                  _hover={{ bg: 'black' }}
                  transition="all 0.2s"
                >
                  <SearchIcon />
                </Button>
              </InputRightElement>
            </InputGroup>
          </Flex>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default FilterBar
