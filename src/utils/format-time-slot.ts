import { format } from 'date-fns'

export const formatTimeSlot = (timeString: string): string => {
  const [start, end] = timeString.split(' - ')
  const currentDate = new Date()
  const startDate = new Date(
    currentDate.setHours(parseInt(start.split(':')[0]), parseInt(start.split(':')[1])),
  )
  const endDate = new Date(
    currentDate.setHours(parseInt(end.split(':')[0]), parseInt(end.split(':')[1])),
  )

  return `${format(startDate, 'dd/MM/yyyy-HH:mm')} - ${format(endDate, 'dd/MM/yyyy-HH:mm')}`
}

export const defaultTimeSlots = [
  '05:30 - 09:00',
  '09:01 - 12:30',
  '12:31 - 16:00',
  '16:01 - 19:30',
  '19:31 - 23:00',
  '23:01 - 02:30',
  '02:31 - 05:00',
].map(formatTimeSlot)
