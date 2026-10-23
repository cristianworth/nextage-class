import { hasLessonStarted, referenceClock } from './dates'
import { assertAvailable } from './availability'
import { findLesson } from './agenda'
import { occurrenceAt, occurrencesInRange } from './recurrence'
import { blockInputSchema, lessonInputSchema, seriesInputSchema, workspaceSchema } from './models'
import type { BlockInput, LessonInput, SeriesInput, Workspace } from './models'

function checked(next: Workspace) {
  assertAvailable(next)
  workspaceSchema.parse(next)
  return next
}

export function scheduleWeekly(state: Workspace, input: SeriesInput, now = new Date()): Workspace {
  const values = seriesInputSchema.parse(input)
  if (!state.students.some((student) => student.id === values.studentId))
    throw new Error('Selecione um aluno cadastrado.')
  return checked({
    ...state,
    series: [
      ...state.series,
      {
        id: crypto.randomUUID(),
        studentId: values.studentId,
        createdAt: now.toISOString(),
        endDate: values.endDate,
        segments: [{ fromIndex: 0, date: values.date, hour: values.hour }],
      },
    ],
  })
}

export function addBlock(state: Workspace, input: BlockInput, now = new Date()): Workspace {
  const values = blockInputSchema.parse(input)
  return checked({
    ...state,
    blocks: [
      ...state.blocks,
      {
        ...values,
        title: values.title || 'Horário ocupado',
        id: crypto.randomUUID(),
        createdAt: now.toISOString(),
      },
    ],
  })
}

export function removeBlock(state: Workspace, id: string): Workspace {
  if (!state.blocks.some((block) => block.id === id))
    throw new Error('Este bloqueio não foi encontrado.')
  return { ...state, blocks: state.blocks.filter((block) => block.id !== id) }
}

export type RescheduleScope = 'single' | 'following'
export function rescheduleLesson(
  state: Workspace,
  id: string,
  target: Pick<LessonInput, 'date' | 'hour'>,
  scope: RescheduleScope,
  now = new Date(),
): Workspace {
  const lesson = findLesson(state, id)
  if (!lesson) throw new Error('Esta aula não foi encontrada.')
  if (
    hasLessonStarted(lesson.date, lesson.hour, now) ||
    state.records.some((record) => record.lessonId === id)
  )
    throw new Error('Aulas iniciadas ou registradas mantêm seu horário para preservar o histórico.')
  const values = lessonInputSchema.parse({ ...target, studentId: lesson.studentId })
  if (hasLessonStarted(values.date, values.hour, now))
    throw new Error('Escolha um novo horário que ainda não começou.')
  if (scope === 'single') {
    const updated = {
      ...lesson,
      date: values.date,
      hour: values.hour,
      rescheduledAt: now.toISOString(),
    }
    return checked({
      ...state,
      lessons: [...state.lessons.filter((item) => item.id !== id), updated],
    })
  }
  if (!lesson.seriesId || lesson.occurrenceIndex === undefined)
    throw new Error('Esta é uma aula pontual. Use somente esta aula.')
  const series = state.series.find((item) => item.id === lesson.seriesId)!
  const index = lesson.occurrenceIndex
  const previous = index > 0 ? occurrenceAt(series, index - 1) : undefined
  if (previous && values.date <= previous.date)
    throw new Error('O novo período deve começar depois da ocorrência anterior da série.')
  if (series.endDate && values.date > series.endDate)
    throw new Error('O novo horário está depois do término desta série.')
  const recordIds = new Set(state.records.map((record) => record.lessonId))
  const materializedIds = new Set(state.lessons.map((item) => item.id))
  // A postponed early occurrence can be selected after later occurrences have happened.
  const pastOccurrences = occurrencesInRange(
    series,
    series.segments[0].date,
    referenceClock(now).date,
  ).filter(
    (item) =>
      item.occurrenceIndex! >= index &&
      !materializedIds.has(item.id) &&
      hasLessonStarted(item.date, item.hour, now),
  )
  return checked({
    ...state,
    series: state.series.map((item) =>
      item.id !== series.id
        ? item
        : {
            ...item,
            segments: [
              ...item.segments.filter((segment) => segment.fromIndex < index),
              { fromIndex: index, date: values.date, hour: values.hour },
            ],
          },
    ),
    lessons: [
      ...pastOccurrences,
      ...state.lessons.filter(
        (item) =>
          item.seriesId !== series.id ||
          item.occurrenceIndex! < index ||
          recordIds.has(item.id) ||
          hasLessonStarted(item.date, item.hour, now),
      ),
    ],
  })
}
