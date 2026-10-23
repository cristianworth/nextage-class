import { daysBetween, hasLessonEnded, referenceClock } from './dates'
import type { Lesson, ScheduleBlock, Workspace } from './models'
import { occurrenceAt, occurrencesInRange } from './recurrence'

export function findLesson(state: Workspace, id: string): Lesson | undefined {
  const stored = state.lessons.find((lesson) => lesson.id === id)
  if (stored) return stored
  const match = /^weekly\/(.+)\/(\d+)$/.exec(id)
  const series = match && state.series.find((series) => series.id === match[1])
  return series ? occurrenceAt(series, Number(match![2])) : undefined
}

export function lessonsInRange(state: Workspace, start: string, end: string) {
  const materializedIds = new Set(state.lessons.map((lesson) => lesson.id))
  const generated = state.series
    .flatMap((series) => occurrencesInRange(series, start, end))
    .filter((lesson) => !materializedIds.has(lesson.id))
  return [
    ...state.lessons.filter((lesson) => lesson.date >= start && lesson.date <= end),
    ...generated,
  ].sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour)
}

export function upcomingLessons(state: Workspace, now = new Date(), studentId?: string, limit = 3) {
  const today = referenceClock(now).date
  const materializedIds = new Set(state.lessons.map((lesson) => lesson.id))
  const candidates = state.lessons.filter(
    (lesson) => !hasLessonEnded(lesson.date, lesson.hour, now),
  )
  for (const series of state.series) {
    if (studentId && series.studentId !== studentId) continue
    for (const [position, segment] of series.segments.entries()) {
      let index = Math.max(
        segment.fromIndex,
        segment.fromIndex + Math.floor(daysBetween(segment.date, today) / 7),
      )
      const lastIndex = (series.segments[position + 1]?.fromIndex ?? Number.MAX_SAFE_INTEGER) - 1
      let added = 0
      while (index <= lastIndex && added < limit) {
        const lesson = occurrenceAt(series, index++)
        if (!lesson) break
        if (!materializedIds.has(lesson.id) && !hasLessonEnded(lesson.date, lesson.hour, now)) {
          candidates.push(lesson)
          added++
        }
      }
    }
  }
  return candidates
    .filter((lesson) => !studentId || lesson.studentId === studentId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour)
    .slice(0, limit)
}

export function blockApplies(block: ScheduleBlock, date: string) {
  if (date < block.date || (block.endDate && date > block.endDate)) return false
  return block.repeat === 'once' ? date === block.date : daysBetween(block.date, date) % 7 === 0
}

export function blockAt(state: Workspace, date: string, hour: number) {
  return state.blocks.find(
    (block) => blockApplies(block, date) && hour >= block.startHour && hour < block.endHour,
  )
}

export function ensureMaterialized(state: Workspace, lesson: Lesson): Workspace {
  return state.lessons.some((item) => item.id === lesson.id)
    ? state
    : { ...state, lessons: [...state.lessons, lesson] }
}
