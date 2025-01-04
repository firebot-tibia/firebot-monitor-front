import React from 'react'
import { Button, Flex, Text } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons'
import { PaginationProps } from './types'

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handleFirst = () => {
    onPageChange(1)
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handleLast = () => {
    onPageChange(totalPages)
  }

  return (
    <Flex justify="center" align="center" mt={4}>
      <Button
        onClick={handleFirst}
        isDisabled={currentPage === 1}
        mr={1}
        size="sm"
        aria-label="Primeira página"
      >
        <ArrowLeftIcon />
      </Button>
      <Button
        onClick={handlePrevious}
        isDisabled={currentPage === 1}
        mr={2}
        size="sm"
        aria-label="Página anterior"
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
        aria-label="Próxima página"
      >
        <ChevronRightIcon />
      </Button>
      <Button
        onClick={handleLast}
        isDisabled={currentPage === totalPages}
        ml={1}
        size="sm"
        aria-label="Última página"
      >
        <ArrowRightIcon />
      </Button>
    </Flex>
  )
}

export default Pagination
