import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Flex justify="center" align="center" mt={4}>
      <Button
        onClick={handlePrevious}
        isDisabled={currentPage === 1}
        mr={2}
        size="sm"
      >
        <ChevronLeftIcon />
      </Button>
      <Text fontSize="sm">
        Página {currentPage} de {totalPages}
      </Text>
      <Button
        onClick={handleNext}
        isDisabled={currentPage === totalPages}
        ml={2}
        size="sm"
      >
        <ChevronRightIcon />
      </Button>
    </Flex>
  );
};