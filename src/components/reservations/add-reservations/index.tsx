import React from 'react';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { CreateReservationData } from '../../../shared/interface/reservations.interface';

interface AddReservationFormProps {
  onSubmit: (data: CreateReservationData) => void;
  respawnName: string;
  timeSlot: string;
}

export const AddReservationForm: React.FC<AddReservationFormProps> = ({ onSubmit, respawnName, timeSlot }) => {
  const [reservedFor, setReservedFor] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start_time = timeSlot.split(' - ')[0];
    const end_time = timeSlot.split(' - ')[1];

    onSubmit({
      start_time,
      end_time,
      reserved_for: reservedFor,
      respawn_id: respawnName,
      kind: 'ally'
    });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel>Reservado para</FormLabel>
        <Input
          value={reservedFor}
          onChange={(e) => setReservedFor(e.target.value)}
          placeholder="Nome do jogador"
        />
      </FormControl>
      <Button mt={4} colorScheme="blue" type="submit">Adicionar Reserva</Button>
    </Box>
  );
};