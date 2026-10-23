import { addDays, daysBetween, formatDate, formatHour } from './dates'
import type { Workspace } from './models'
import { occurrenceAt } from './recurrence'

type Occupancy = {
  label: string
  first: string
  last: string
  weekly: boolean
  startHour: number
  endHour: number
  excluded: Set<string>
}
const LAST_DATE = '9999-12-31'

function occupancyRules(state: Workspace): Occupancy[] {
  const names = new Map(state.students.map((student) => [student.id, student.name]))
  const rules: Occupancy[] = state.lessons.map((lesson) => ({
    label: names.get(lesson.studentId) ?? 'outra aula',
    first: lesson.date,
    last: lesson.date,
    weekly: false,
    startHour: lesson.hour,
    endHour: lesson.hour + 1,
    excluded: new Set(),
  }))
  for (const series of state.series) {
    for (const [position, segment] of series.segments.entries()) {
      const nextIndex = series.segments[position + 1]?.fromIndex
      const segmentEnd =
        nextIndex === undefined
          ? LAST_DATE
          : addDays(segment.date, (nextIndex - segment.fromIndex - 1) * 7)
      const last = series.endDate && series.endDate < segmentEnd ? series.endDate : segmentEnd
      const excluded = new Set<string>()
      for (const lesson of state.lessons) {
        if (
          lesson.seriesId !== series.id ||
          lesson.occurrenceIndex! < segment.fromIndex ||
          (nextIndex !== undefined && lesson.occurrenceIndex! >= nextIndex)
        )
          continue
        const original = occurrenceAt(series, lesson.occurrenceIndex!)
        if (original) excluded.add(original.date)
      }
      rules.push({
        label: names.get(series.studentId) ?? 'horário semanal',
        first: segment.date,
        last,
        weekly: true,
        startHour: segment.hour,
        endHour: segment.hour + 1,
        excluded,
      })
    }
  }
  for (const block of state.blocks)
    rules.push({
      label: block.title || 'Horário ocupado',
      first: block.date,
      last: block.repeat === 'once' ? block.date : (block.endDate ?? LAST_DATE),
      weekly: block.repeat === 'weekly',
      startHour: block.startHour,
      endHour: block.endHour,
      excluded: new Set(),
    })
  return rules
}

function intersect(a: Occupancy, b: Occupancy): string | undefined {
  if (a.endHour <= b.startHour || b.endHour <= a.startHour) return undefined
  const first = a.first > b.first ? a.first : b.first
  const last = a.last < b.last ? a.last : b.last
  if (first > last) return undefined
  if (a.weekly && b.weekly && daysBetween(a.first, b.first) % 7 !== 0) return undefined
  const weekly = a.weekly ? a : b.weekly ? b : undefined
  let candidate = weekly
    ? addDays(first, (7 - (((daysBetween(weekly.first, first) % 7) + 7) % 7)) % 7)
    : first
  while (candidate <= last) {
    if (!a.excluded.has(candidate) && !b.excluded.has(candidate)) return candidate
    if (!a.weekly || !b.weekly) return undefined
    candidate = addDays(candidate, 7)
  }
  return undefined
}

export function assertAvailable(state: Workspace) {
  const rules = occupancyRules(state)
  for (let index = 0; index < rules.length; index++) {
    for (let other = index + 1; other < rules.length; other++) {
      const date = intersect(rules[index], rules[other])
      if (date)
        throw new Error(
          `Conflito em ${formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' })} às ${formatHour(Math.max(rules[index].startHour, rules[other].startHour))}: horário já está ocupado por ${rules[index].label} e ${rules[other].label}. Nada foi alterado.`,
        )
    }
  }
}
