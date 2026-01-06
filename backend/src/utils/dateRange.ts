export type TypeDate = 'day' | 'week' | 'month' | 'year'

export const getDateRangeByType = (type: TypeDate, now = new Date()) => {
  let start: Date
  let end: Date

  switch (type) {
    case 'day': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      break
    }

    case 'week': {
      const day = now.getDay() || 7 
      start = new Date(now)
      start.setDate(now.getDate() - day + 1)
      start.setHours(0, 0, 0, 0)

      end = new Date(start)
      end.setDate(start.getDate() + 7)
      break
    }

    case 'month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      break
    }

    case 'year': {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear() + 1, 0, 1)
      break
    }

    default: {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear() + 1, 0, 1)
    }
  }

  return { start, end }
}
