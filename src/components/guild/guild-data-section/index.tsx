// components/GuildDataSection.tsx
import React from 'react';
import { Box, Text, Spinner, SimpleGrid } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { GuildMemberTable } from '../../guild-table';

interface GuildDataSectionProps {
  isLoading: boolean;
  guildData: GuildMemberResponse[];
  groupedData: Array<{
    type: string;
    data: GuildMemberResponse[];
    onlineCount: number;
  }>;
  handleLocalChange: (member: GuildMemberResponse, newLocal: string) => Promise<void>;
  handleClassificationChange: (member: GuildMemberResponse, newClassification: string) => Promise<void>;
  types: string[];
  addType: (type: string) => void;
}

const GuildDataSection: React.FC<GuildDataSectionProps> = React.memo(({
  isLoading,
  guildData,
  groupedData,
  handleLocalChange,
  handleClassificationChange,
  types,
  addType
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (guildData.length === 0) {
    return (
      <Box textAlign="center" fontSize="xl" mt={10}>
        <Text>Nenhum dado de guilda disponível.</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={3} spacing={1}>
      {groupedData.map(({ type, data, onlineCount }) => (
        <GuildMemberTable
          key={type}
          data={data}
          onlineCount={onlineCount}
          onLocalChange={handleLocalChange}
          onClassificationChange={handleClassificationChange}
          showExivaInput={type !== 'exitados'}
          fontSize="xs"
          types={types}
          addType={addType}
          isLoading={false}
        />
      ))}
    </SimpleGrid>
  );
});

GuildDataSection.displayName = 'GuildDataSection';

export default GuildDataSection;