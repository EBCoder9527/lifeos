import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

export function getMondayOfWeek(d: dayjs.Dayjs): dayjs.Dayjs {
  return d.isoWeekday(1)
}

export function getMondayOfCurrentWeek(): dayjs.Dayjs {
  return getMondayOfWeek(dayjs())
}

export function getWeekDates(startDate: string): string[] {
  const d = dayjs(startDate)
  return Array.from({ length: 7 }, (_, i) => d.add(i, 'day').format('YYYY-MM-DD'))
}

export function getCurrentWeekInfo() {
  const monday = getMondayOfCurrentWeek()
  const sunday = monday.add(6, 'day')
  return {
    monday,
    sunday,
    weekNumber: monday.isoWeek(),
    year: monday.year(),
    startDate: monday.format('YYYY-MM-DD'),
    endDate: sunday.format('YYYY-MM-DD'),
    weekDates: getWeekDates(monday.format('YYYY-MM-DD')),
  }
}
