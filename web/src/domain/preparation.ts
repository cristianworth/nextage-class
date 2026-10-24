import { ensureMaterialized, findLesson } from './agenda'
import { hasLessonEnded } from './dates'
import { planInputSchema } from './models'
import type { Lesson, LessonPlanInput, Workspace } from './models'

export function saveLessonPlan(
  state: Workspace,
  lessonId: string,
  input: LessonPlanInput,
  now = new Date(),
): Workspace {
  const lesson = findLesson(state, lessonId)
  if (!lesson) throw new Error('Esta aula não foi encontrada.')
  if (
    hasLessonEnded(lesson.date, lesson.hour, now) ||
    state.records.some((record) => record.lessonId === lessonId)
  )
    throw new Error('O planejamento pode ser alterado até o término de uma aula sem registro.')
  const values = planInputSchema.parse(input)
  if (values.materialId && !state.materials.some((material) => material.id === values.materialId))
    throw new Error('Selecione um material do acervo.')
  const plans = state.plans.filter((plan) => plan.lessonId !== lessonId)
  if (values.materialId || values.notes)
    plans.push({ ...values, lessonId, updatedAt: now.toISOString() })
  return { ...ensureMaterialized(state, lesson), plans }
}

export function lessonContext(state: Workspace, target: Lesson) {
  const previous = state.records
    .map((record) => ({ record, lesson: findLesson(state, record.lessonId)! }))
    .filter(
      ({ lesson }) =>
        lesson.studentId === target.studentId &&
        (lesson.date < target.date || (lesson.date === target.date && lesson.hour < target.hour)),
    )
    .sort((a, b) => b.lesson.date.localeCompare(a.lesson.date) || b.lesson.hour - a.lesson.hour)
  return {
    lastAttended: previous.find(({ record }) => record.attendance === 'attended'),
    pending: previous.filter(({ record }) => record.homework && !record.homework.correctedAt),
  }
}
