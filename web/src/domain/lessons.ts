import { lessonInputSchema } from './models'
import type { LessonInput, Workspace } from './models'
import { assertAvailable } from './availability'

export function scheduleLesson(state: Workspace, input: LessonInput, now = new Date()): Workspace {
  const values = lessonInputSchema.parse(input)
  if (!state.students.some((student) => student.id === values.studentId))
    throw new Error('Selecione um aluno cadastrado.')
  const next = {
    ...state,
    lessons: [
      ...state.lessons,
      { ...values, id: crypto.randomUUID(), createdAt: now.toISOString() },
    ],
  }
  assertAvailable(next)
  return next
}
