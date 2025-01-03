import { format } from 'date-fns'

export const formatDateForAPI = (date: Date): string => {
  return format(date, 'dd/MM/yyyy-HH:mm')
}
