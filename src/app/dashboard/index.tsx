import { Box, Flex } from '@chakra-ui/react';
import DashboardLayout from '../../components/layout';
import { tools } from '../../components/unauthenticated/tools/config/toolbar.config';

const Dashboard = () => {
  const ActiveToolComponent = tools.find((tool) => tool.id === 'description')?.component;

  return (
    <DashboardLayout>
      <Flex>
        <Box ml="60px" flex={1} p={6}>
          {ActiveToolComponent && <ActiveToolComponent />}
        </Box>
      </Flex>
    </DashboardLayout>
  );
};

export default Dashboard;
