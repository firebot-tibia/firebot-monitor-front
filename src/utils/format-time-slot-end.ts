import { format, parse } from 'date-fns'

export const formatTimeSlotEnd = (timeSlot: string) => {
  const [startTime, endTime] = timeSlot.split(' - ')
  const parseTimeString = (timeString: string) => {
    return parse(timeString, 'dd/MM/yyyy-HH:mm', new Date())
  }

  const formattedStart = format(parseTimeString(startTime), 'HH:mm')
  const formattedEnd = format(parseTimeString(endTime), 'HH:mm')

  return `${formattedStart} - ${formattedEnd}`
}
