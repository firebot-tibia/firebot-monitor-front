import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
    <Button
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}>
      Anterior
    </Button>
    <Text>Página {currentPage} de {totalPages}</Text>
    <Button
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}>
      Próxima
    </Button>
  </Box>
);