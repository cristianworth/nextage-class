import { hasLessonEnded } from './dates'
import { recordInputSchema } from './models'
import type { RecordInput, Workspace } from './models'

export function saveLessonRecord(
  state: Workspace,
  lessonId: string,
  input: RecordInput,
  now = new Date(),
): Workspace {
  const lesson = state.lessons.find((item) => item.id === lessonId)
  if (!lesson) throw new Error('Esta aula não foi encontrada.')
  if (!hasLessonEnded(lesson.date, lesson.hour, now))
    throw new Error('Você pode lançar a aula somente após seu término, no horário de Brasília.')
  const values = recordInputSchema.parse(input)
  const student = state.students.find((item) => item.id === lesson.studentId)
  if (!student) throw new Error('O aluno desta aula não foi encontrado.')
  const previous = state.records.find((record) => record.lessonId === lessonId)
  const record = {
    ...values,
    reason: values.attendance === 'attended' ? '' : values.reason,
    id: previous?.id ?? crypto.randomUUID(),
    lessonId,
    studentName: previous?.studentName ?? student.name,
    createdAt: previous?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  }
  return {
    ...state,
    records: previous
      ? state.records.map((item) => (item.id === record.id ? record : item))
      : [...state.records, record],
  }
}
