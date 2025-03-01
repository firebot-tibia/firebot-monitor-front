export const formatTimeOnline = (minutes: number): string => {
  if (minutes < 0.0167) {
    // Less than 1 second
    return '00:00:00'
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.floor(minutes % 60)
  const seconds = Math.floor((minutes % 1) * 60)
  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
