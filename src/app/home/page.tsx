'use client';

import { FC } from 'react';
import { Badge, Box, Flex, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, VStack } from '@chakra-ui/react';
import DashboardLayout from '../../components/layout';
import { DeathSection } from '../../components/guild/sections/death-section';
import GuildDataSection from '../../components/guild/sections/guild-data-section';
import InstructionsSection from '../../components/guild/sections/instructions-section';
import MonitorToggleSection from '../../components/guild/sections/monitor-toggle-section';
import { LevelUpSection } from '../../components/guild/sections/levelup-section';
import { useHomeLogic } from './hooks/useHome';

const Home: FC = () => {
  const {
    mode,
    setMode,
    newDeathCount,
    newLevelUpCount,
    newLevelDownCount,
    deathList,
    levelUpList,
    levelDownList,
    guildData,
    isLoading,
    status,
    firstAudioEnabled,
    playFirstAudio,
    secondAudioEnabled,
    playSecondAudio,
    types,
    addType,
    handleLocalChange,
    handleClassificationChange,
    groupedData,
    handleStartMonitoring
  } = useHomeLogic();


  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout mode={mode} setMode={setMode}>
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode={mode} setMode={setMode}>
      <InstructionsSection />
      <Box maxWidth="100%" overflow="hidden" fontSize={["xs", "sm", "md"]}>
        <VStack spacing={4} align="stretch">
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab>Monitoramento de Guilds</Tab>
              <Tab>
                Lista de Mortes
                {newDeathCount > 0 && (
                  <Badge ml={2} colorScheme="red" borderRadius="full">
                    {newDeathCount}
                  </Badge>
                )}
              </Tab>
              <Tab>
                Lista de Level Up
                {(newLevelUpCount > 0 || newLevelDownCount > 0) && (
                  <Badge ml={2} colorScheme="green" borderRadius="full">
                    {newLevelUpCount + newLevelDownCount}
                  </Badge>
                )}
              </Tab>
              <Tab>Gerenciamento de alertas</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <GuildDataSection
                  isLoading={isLoading}
                  guildData={guildData}
                  groupedData={groupedData}
                  handleLocalChange={handleLocalChange}
                  handleClassificationChange={handleClassificationChange}
                  types={types}
                  addType={addType}
                />
              </TabPanel>
              <TabPanel>
                <DeathSection
                  deathList={deathList}
                  playAudio={playFirstAudio}
                  audioEnabled={firstAudioEnabled}
                />
              </TabPanel>
              <TabPanel>
                <LevelUpSection
                  levelUpList={levelUpList}
                  levelDownList={levelDownList}
                  playAudio={playSecondAudio}
                  audioEnabled={secondAudioEnabled}
                />
              </TabPanel>
              <TabPanel>
                <MonitorToggleSection
                  guildData={guildData}
                  isLoading={isLoading}
                  onStartMonitoring={handleStartMonitoring}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default Home;