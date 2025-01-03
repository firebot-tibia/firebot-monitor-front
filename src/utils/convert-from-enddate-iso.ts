export const convertFrontEndDateToISO = (frontEndDate: string): string => {
  const [datePart, timePart] = frontEndDate.split('-')
  const [day, month, year] = datePart.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00Z`
}
