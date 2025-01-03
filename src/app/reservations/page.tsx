import { Box, Heading } from '@chakra-ui/react'
import DashboardLayout from '../../components/layout'
import { ReservationsManager } from '../../components/reservations'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Respawns = () => {
  const now = new Date()
  const currentMonth = format(now, 'MMMM', { locale: ptBR })

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mb={6} textAlign="center">
          Respawns Planilhados - {currentMonth}
        </Heading>
        <ReservationsManager />
      </Box>
    </DashboardLayout>
  )
}

export default Respawns
