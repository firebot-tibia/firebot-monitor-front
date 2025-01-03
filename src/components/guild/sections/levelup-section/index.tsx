import React from 'react'
import { Box, Flex, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import { Level } from '../../../../types/interfaces/level.interface'
import LevelTable from '../../../lists/level-list/level-table'

interface LevelUpSectionProps {
  levelUpList: Level[]
  levelDownList: Level[]
  playAudio: () => void
  audioEnabled: boolean
}

export const LevelUpSection: React.FC<LevelUpSectionProps> = ({
  levelUpList,
  levelDownList,
  playAudio,
  audioEnabled,
}) => {
  return (
    <Box>
      <Flex align="center" justify="center" mb={4}>
        <Heading as="h2" size="md">
          Alterações de Nível Recentes
        </Heading>
      </Flex>
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Level Up</Tab>
          <Tab>Level Down</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <LevelTable levelList={levelUpList} audioEnabled={audioEnabled} />
          </TabPanel>
          <TabPanel>
            <LevelTable levelList={levelDownList} audioEnabled={audioEnabled} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
