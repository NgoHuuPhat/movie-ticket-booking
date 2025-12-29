
export const getDayRange = (date: Date = new Date()) => {
  const startDate = new Date(date)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(date)
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}

export const timeStringToDateTime = (timeStr: string): Date => {
  return new Date(`1970-01-01T${timeStr}:00`)
}