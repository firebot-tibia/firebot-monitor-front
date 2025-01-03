export const getTimeColor = (timeOnline: string | null): string => {
  try {
    if (!timeOnline) return 'red.500'

    const [hours, minutes] = timeOnline.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes

    if (totalMinutes <= 5) return 'red.500'
    if (totalMinutes <= 15) return 'orange.500'
    if (totalMinutes <= 30) return 'yellow.500'
    return 'inherit'
  } catch (error) {
    console.error('Error in getTimeColor:', error)
    return 'red.500'
  }
}
