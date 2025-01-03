import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  VStack,
  Spinner,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { CreateReservationData } from '../../../types/interfaces/reservations.interface'
import {
  endOfMonth,
  addDays,
  isBefore,
  max,
  parse,
  endOfWeek,
  getDaysInMonth,
  isSameDay,
  startOfDay,
} from 'date-fns'
import { useTokenStore } from '../../../stores/token-decoded-store'
import { formatDateForAPI } from '../../../utils/format-date-api'

interface AddReservationFormProps {
  onSubmit: (data: Omit<CreateReservationData, 'world'> & { respawn_id: string }) => Promise<void>
  respawnId: string
  timeSlot: string
}

export const AddReservationForm: React.FC<AddReservationFormProps> = ({
  onSubmit,
  respawnId,
  timeSlot,
}) => {
  const [reservedFor, setReservedFor] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'monthly'>('weekly')
  const [isLoading, setIsLoading] = useState(false)
  const { mode } = useTokenStore()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const [start_time, end_time] = timeSlot.split(' - ')
    const startDate = parse(start_time, 'dd/MM/yyyy-HH:mm', new Date())
    const endDate = parse(end_time, 'dd/MM/yyyy-HH:mm', new Date())
    const today = startOfDay(new Date())

    try {
      if (!isRecurring) {
        await onSubmit({
          start_time: formatDateForAPI(startDate),
          end_time: formatDateForAPI(endDate),
          reserved_for: reservedFor,
          respawn_id: respawnId,
          kind: mode,
        })
        toast({
          title: 'Reserva criada',
          description: 'A reserva foi criada com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        const reservationPromises = []
        let currentDate = max([today, startDate])
        const durationInMs = endDate.getTime() - startDate.getTime()

        if (recurrenceType === 'weekly') {
          const endOfCurrentWeek = endOfWeek(currentDate)

          while (
            isBefore(currentDate, endOfCurrentWeek) ||
            isSameDay(currentDate, endOfCurrentWeek)
          ) {
            const currentEndDate = new Date(currentDate.getTime() + durationInMs)

            reservationPromises.push(
              onSubmit({
                start_time: formatDateForAPI(currentDate),
                end_time: formatDateForAPI(currentEndDate),
                reserved_for: reservedFor,
                respawn_id: respawnId,
                kind: mode,
              }),
            )

            currentDate = addDays(currentDate, 1)
          }
        } else {
          const lastDayOfMonth = endOfMonth(currentDate)
          const totalDays = getDaysInMonth(currentDate)

          for (let i = 0; i < totalDays; i++) {
            if (isBefore(currentDate, lastDayOfMonth) || isSameDay(currentDate, lastDayOfMonth)) {
              const currentEndDate = new Date(currentDate.getTime() + durationInMs)

              reservationPromises.push(
                onSubmit({
                  start_time: formatDateForAPI(currentDate),
                  end_time: formatDateForAPI(currentEndDate),
                  reserved_for: reservedFor,
                  respawn_id: respawnId,
                  kind: mode,
                }),
              )
            }
            currentDate = addDays(currentDate, 1)
          }
        }

        await Promise.all(reservationPromises)

        toast({
          title: 'Reservas recorrentes criadas',
          description: `Todas as reservas ${recurrenceType === 'weekly' ? 'da semana atual' : 'do mês atual'} foram criadas com sucesso.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error creating reservations:', error)
      toast({
        title: 'Erro ao criar reservas',
        description: 'Ocorreu um erro ao criar as reservas. Por favor, tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Reservado para</FormLabel>
          <Input
            value={reservedFor}
            onChange={(e) => setReservedFor(e.target.value)}
            placeholder="Nome do jogador"
          />
        </FormControl>
        <FormControl>
          <Checkbox isChecked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)}>
            Reserva recorrente
          </Checkbox>
        </FormControl>
        {isRecurring && (
          <FormControl>
            <FormLabel>Tipo de recorrência</FormLabel>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} w="full">
                {recurrenceType === 'weekly' ? 'Semanal' : 'Mensal'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setRecurrenceType('weekly')}>Semanal</MenuItem>
                <MenuItem onClick={() => setRecurrenceType('monthly')}>Mensal</MenuItem>
              </MenuList>
            </Menu>
          </FormControl>
        )}
        <Button
          mt={4}
          colorScheme="blue"
          type="submit"
          isLoading={isLoading}
          loadingText="Criando reservas..."
        >
          {isLoading ? <Spinner size="sm" /> : 'Adicionar Reserva'}
        </Button>
      </VStack>
    </Box>
  )
}
