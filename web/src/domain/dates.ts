export const TIME_ZONE = 'America/Sao_Paulo'
export const HOURS = Array.from({ length: 16 }, (_, index) => index + 7)

export function referenceClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const value = (type: string) => parts.find((part) => part.type === type)!.value
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  }
}

function civilDate(value: string) {
  return new Date(`${value}T12:00:00Z`)
}

export function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = civilDate(value)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function addDays(value: string, days: number) {
  const date = civilDate(value)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function daysBetween(start: string, end: string) {
  return Math.round((civilDate(end).getTime() - civilDate(start).getTime()) / 86_400_000)
}

export function hasLessonStarted(date: string, hour: number, now = new Date()) {
  const clock = referenceClock(now)
  return date < clock.date || (date === clock.date && hour * 60 <= clock.minutes)
}

export function weekday(value: string) {
  return civilDate(value).getUTCDay()
}
export function weekStart(value: string) {
  return addDays(value, -((weekday(value) + 6) % 7))
}
export function weekDays(value: string) {
  return Array.from({ length: 5 }, (_, index) => addDays(weekStart(value), index))
}
export function isWeekday(value: string) {
  return weekday(value) > 0 && weekday(value) < 6
}
export function nextWeekday(value: string) {
  let date = value
  while (!isWeekday(date)) date = addDays(date, 1)
  return date
}

export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' },
) {
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'UTC' }).format(civilDate(value))
}

export function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}
export function lessonTime(hour: number) {
  return `${formatHour(hour)} – ${String(hour).padStart(2, '0')}:55`
}

export function hasLessonEnded(date: string, hour: number, now = new Date()) {
  const clock = referenceClock(now)
  return date < clock.date || (date === clock.date && hour * 60 + 55 <= clock.minutes)
}

export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
