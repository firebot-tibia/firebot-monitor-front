'use client';

import { FC } from 'react';
import { Box } from '@chakra-ui/react';
import DashboardLayout from '../../components/layout';
import DescriptionEditor from '../../components/tools';

const Settings: FC = () => {
  return (
    <DashboardLayout>
      <Box maxWidth="100%" overflow="hidden" fontSize={["xs", "sm", "md"]}>
        <DescriptionEditor />
      </Box>
    </DashboardLayout>
  );
};

export default Settings;