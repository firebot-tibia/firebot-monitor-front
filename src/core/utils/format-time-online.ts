export const formatTimeOnline = (startDate: Date, endDate: Date): string => {
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 1) {
    return '00:00:00'
  }

  const hours = Math.floor(diffSeconds / 3600)
  const remainingMinutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
