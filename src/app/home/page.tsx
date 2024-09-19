'use client';

import React, { FC, useState, useMemo } from 'react';
import { 
  Box, 
  VStack, 
  Flex, 
  Text, 
  Spinner, 
  SimpleGrid, 
  Button, 
  Collapse, 
  Accordion, 
  AccordionItem, 
  AccordionButton, 
  AccordionPanel, 
  AccordionIcon,
  Badge,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { InfoIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import DashboardLayout from '../../components/dashboard';
import { BombaMakerMonitor } from '../../components/guild/character-monitor';
import { DeathTable } from '../../components/death';
import { GuildMemberTable } from '../../components/guild/guild-table';
import { useCharacterTypes } from '../../hooks/characters/types/useType';
import InstructionsBox from '../../components/guild/instructions-box';
import { normalizeTimeOnline, isOnline } from '../../shared/utils/guild-utils';
import { useSSEData } from '../../hooks/useSSEData';

const Home: FC = () => {
  const [showMonitor, setShowMonitor] = useState(false);
  const { 
    guildData, 
    deathList, 
    newDeathCount, 
    isLoading, 
    handleLocalChange, 
    handleClassificationChange, 
    status 
  } = useSSEData();
  const { types, addType } = useCharacterTypes(guildData);

  const groupedData = useMemo(() => {
    const grouped = types.map(type => ({
      type,
      data: guildData.filter(member => member.Kind === type).map(member => ({
        ...member,
        TimeOnline: normalizeTimeOnline(member.TimeOnline)
      })),
      onlineCount: guildData.filter(member => member.Kind === type && isOnline(member)).length
    }));

    const unclassified = {
      type: 'unclassified',
      data: guildData.filter(member => !member.Kind || !types.includes(member.Kind)).map(member => ({
        ...member,
        TimeOnline: normalizeTimeOnline(member.TimeOnline)
      })),
      onlineCount: guildData.filter(member => 
        (!member.Kind || !types.includes(member.Kind)) && isOnline(member)
      ).length
    };

    return [...grouped, unclassified].filter(group => group.data.length > 0);
  }, [guildData, types]);

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box maxWidth="100%" overflow="hidden" fontSize="xs">
        <VStack spacing={1} align="stretch">
          <Flex justify="space-between" bg="blue.900" p={2} mt={4} rounded="md">
            <InstructionsBox />
          </Flex>

          <Button
            onClick={() => setShowMonitor(!showMonitor)}
            rightIcon={showMonitor ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="sm"
            width="100%"
            variant="outline"
            bg="gray.700"
            _hover={{ bg: 'gray.600' }}
          >
            {showMonitor ? 'Esconder' : 'Mostrar'} Monitor de Masslog nas listas
          </Button>
          <Collapse in={showMonitor} animateOpacity>
            <Box
              p={2}
              color="white"
              bg="gray.700"
              rounded="md"
              shadow="md"
            >
              <BombaMakerMonitor
                characters={guildData}
                isLoading={isLoading}
              />
            </Box>
          </Collapse>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <Spinner size="xl" />
            </Box>
          ) : guildData.length === 0 ? (
            <Box textAlign="center" fontSize="xl" mt={10}>
              <Text>Nenhum dado de guilda disponível.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={3} spacing={1}>
              {groupedData.map(({ type, data, onlineCount }) => (
                <Box 
                  key={type} 
                  bg="gray.800" 
                  p={2} 
                  rounded="lg" 
                  shadow="md" 
                  height="100%"
                  minHeight="200px"
                  display="flex"
                  flexDirection="column"
                >
                  <Flex justify="space-between" align="center" mb={1}>
                    <Tooltip label={`Personagens ${type === 'unclassified' ? 'não classificados' : `classificados como ${type}`}`} placement="top">
                      <Text fontWeight="bold" cursor="help" fontSize="xs">
                        {type === 'unclassified' ? 'Sem Classificação' : type.charAt(0).toUpperCase() + type.slice(1)}
                        <Icon as={InfoIcon} ml={1} w={2} h={2} />
                      </Text>
                    </Tooltip>
                    <Badge colorScheme="green" fontSize="xx-small">
                      {onlineCount} online
                    </Badge>
                  </Flex>
                  {type === 'exitados' && (
                    <Badge colorScheme="purple" mb={1} fontSize="xx-small">
                      Geralmente em Robson Isle, Thais
                    </Badge>
                  )}
                  <Box flexGrow={1} overflowY="auto">
                    <GuildMemberTable
                      data={data}
                      onLocalChange={handleLocalChange}
                      onClassificationChange={handleClassificationChange}
                      showExivaInput={type !== 'exitados'}
                      fontSize="xs"
                      types={types}
                      addType={addType}
                      isLoading={isLoading}
                    />
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}

          <Accordion allowToggle>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="center">
                      Mortes Recentes
                    </Box>
                    <AccordionIcon />
                    {newDeathCount > 0 && (
                      <Badge ml={2} colorScheme="red" borderRadius="full">
                        {newDeathCount}
                      </Badge>
                    )}
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <DeathTable deathList={deathList} />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default Home;