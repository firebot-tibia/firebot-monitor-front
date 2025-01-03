export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const gmt3Date = new Date(date.getTime() - 3 * 60 * 60 * 1000)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }

  return new Intl.DateTimeFormat('pt-BR', options).format(gmt3Date)
}
