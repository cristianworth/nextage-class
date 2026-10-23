import { addDays, daysBetween } from './dates'
import type { Lesson, WeeklySeries } from './models'

export function occurrenceId(seriesId: string, index: number) {
  return `weekly/${seriesId}/${index}`
}

export function occurrenceAt(series: WeeklySeries, index: number): Lesson | undefined {
  if (!Number.isSafeInteger(index) || index < 0) return undefined
  const segment = series.segments.findLast((segment) => segment.fromIndex <= index)
  if (!segment) return undefined
  const date = addDays(segment.date, (index - segment.fromIndex) * 7)
  if (series.endDate && date > series.endDate) return undefined
  return {
    id: occurrenceId(series.id, index),
    studentId: series.studentId,
    date,
    hour: segment.hour,
    seriesId: series.id,
    occurrenceIndex: index,
    createdAt: series.createdAt,
  }
}

export function occurrencesInRange(series: WeeklySeries, start: string, end: string): Lesson[] {
  const lessons: Lesson[] = []
  for (const [position, segment] of series.segments.entries()) {
    const firstIndex = Math.max(
      segment.fromIndex,
      segment.fromIndex + Math.ceil(daysBetween(segment.date, start) / 7),
    )
    const lastIndex = Math.min(
      (series.segments[position + 1]?.fromIndex ?? Number.MAX_SAFE_INTEGER) - 1,
      segment.fromIndex + Math.floor(daysBetween(segment.date, end) / 7),
    )
    for (let index = firstIndex; index <= lastIndex; index++) {
      const lesson = occurrenceAt(series, index)
      if (lesson) lessons.push(lesson)
    }
  }
  return lessons
}
