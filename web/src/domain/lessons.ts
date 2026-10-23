import { lessonInputSchema } from './models'
import type { LessonInput, Workspace } from './models'

export function scheduleLesson(state: Workspace, input: LessonInput, now = new Date()): Workspace {
  const values = lessonInputSchema.parse(input)
  if (!state.students.some((student) => student.id === values.studentId))
    throw new Error('Selecione um aluno cadastrado.')
  const conflict = state.lessons.find(
    (lesson) =>
      lesson.date === values.date &&
      values.hour * 60 < lesson.hour * 60 + 60 &&
      lesson.hour * 60 < values.hour * 60 + 60,
  )
  if (conflict) {
    const name =
      state.students.find((student) => student.id === conflict.studentId)?.name ?? 'outro aluno'
    throw new Error(`Esse horário já está ocupado por ${name}. Escolha outro bloco.`)
  }
  return {
    ...state,
    lessons: [
      ...state.lessons,
      { ...values, id: crypto.randomUUID(), createdAt: now.toISOString() },
    ],
  }
}
