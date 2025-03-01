import { Box, Container, VStack, Skeleton, Grid, GridItem } from '@chakra-ui/react'

export const DescriptionEditorSkeleton = () => {
  return (
    <Container maxW={{ base: '95%', sm: '85%', md: 'container.md' }} py={{ base: 4, md: 10 }}>
      <VStack spacing={{ base: 4, md: 8 }} align="stretch">
        <Box textAlign="center">
          <Skeleton height="30px" width="200px" mx="auto" mb={2} />
          <Skeleton height="20px" width="150px" mx="auto" />
        </Box>

        <Box
          p={{ base: 4, md: 8 }}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.200"
        >
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={{ base: 4, md: 6 }}>
            <GridItem>
              <VStack spacing={4}>
                <Skeleton height="70px" width="100%" />
                <Skeleton height="70px" width="100%" />
                <Skeleton height="70px" width="100%" />
              </VStack>
            </GridItem>
            <GridItem>
              <Skeleton height="70px" width="100%" />
            </GridItem>
          </Grid>

          <Skeleton height="100px" width="100%" mt={6} />
          <Skeleton height="50px" width="100%" mt={6} />
        </Box>
      </VStack>
    </Container>
  )
}
