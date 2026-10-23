import { z } from 'zod'
import { isValidDate, isWeekday } from './dates'

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export const ATTENDANCE = {
  attended: 'Presença',
  'student-absent': 'Falta do aluno',
  'teacher-absent': 'Falta da professora',
} as const

const dateSchema = z.string().refine(isValidDate, 'Informe uma data válida.')
const timestampSchema = z.iso.datetime()
const idSchema = z.string().min(1)

export const studentInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do aluno.')
    .max(100, 'Use até 100 caracteres no nome.'),
  level: z.enum(LEVELS, { error: 'Selecione um nível válido.' }),
  startDate: dateSchema,
  phone: z.string().trim().max(50),
  occupation: z.string().trim().max(150),
  interests: z.string().trim().max(1000),
})

export const studentSchema = studentInputSchema.extend({ id: idSchema, createdAt: timestampSchema })
export const lessonInputSchema = z.object({
  studentId: idSchema,
  date: dateSchema.refine(isWeekday, 'As aulas acontecem de segunda a sexta.'),
  hour: z
    .number()
    .int()
    .min(7, 'O primeiro horário é às 07h.')
    .max(22, 'O último horário é às 22h.'),
})
export const lessonSchema = lessonInputSchema.extend({ id: idSchema, createdAt: timestampSchema })
export const recordInputSchema = z
  .object({
    attendance: z.enum(['attended', 'student-absent', 'teacher-absent']),
    level: z.enum(LEVELS),
    material: z.string().trim().max(300, 'Use até 300 caracteres para o material.'),
    content: z.string().trim().max(10000, 'Use até 10.000 caracteres no conteúdo.'),
    reason: z.string().trim().max(1000),
  })
  .refine((input) => input.attendance !== 'attended' || input.content.length > 0, {
    message: 'Descreva o conteúdo trabalhado na aula.',
    path: ['content'],
  })

export const recordSchema = recordInputSchema.extend({
  id: idSchema,
  lessonId: idSchema,
  studentName: z.string().min(1),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

export const workspaceSchema = z
  .object({
    version: z.literal(1),
    students: z.array(studentSchema),
    lessons: z.array(lessonSchema),
    records: z.array(recordSchema),
  })
  .superRefine((state, context) => {
    const unique = (values: string[]) => new Set(values).size === values.length
    const studentIds = new Set(state.students.map((student) => student.id))
    const lessonIds = new Set(state.lessons.map((lesson) => lesson.id))
    const valid =
      unique(state.students.map((student) => student.id)) &&
      unique(state.lessons.map((lesson) => lesson.id)) &&
      unique(state.lessons.map((lesson) => `${lesson.date}:${lesson.hour}`)) &&
      unique(state.records.map((record) => record.id)) &&
      unique(state.records.map((record) => record.lessonId)) &&
      state.lessons.every((lesson) => studentIds.has(lesson.studentId)) &&
      state.records.every((record) => lessonIds.has(record.lessonId))
    if (!valid)
      context.addIssue({
        code: 'custom',
        message: 'Os dados possuem referências ou identificadores inconsistentes.',
      })
  })

export type StudentInput = z.infer<typeof studentInputSchema>
export type Student = z.infer<typeof studentSchema>
export type LessonInput = z.infer<typeof lessonInputSchema>
export type Lesson = z.infer<typeof lessonSchema>
export type RecordInput = z.infer<typeof recordInputSchema>
export type LessonRecord = z.infer<typeof recordSchema>
export type Workspace = z.infer<typeof workspaceSchema>

export function errorMessage(error: unknown) {
  if (error instanceof z.ZodError)
    return error.issues[0]?.message ?? 'Confira os campos informados.'
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.'
}
