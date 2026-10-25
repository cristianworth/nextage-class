import { z } from 'zod'
import { addDays, isValidDate, isWeekday } from './dates'

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
  primaryBookId: idSchema.nullable().optional(),
  meetingUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      } catch {
        return false
      }
    }, 'Informe um link HTTP ou HTTPS válido, sem usuário ou senha.')
    .optional(),
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
export const lessonSchema = lessonInputSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  seriesId: idSchema.optional(),
  occurrenceIndex: z.number().int().nonnegative().optional(),
  rescheduledAt: timestampSchema.optional(),
})

const optionalEndDate = dateSchema.nullable()
export const seriesInputSchema = lessonInputSchema
  .extend({ endDate: optionalEndDate })
  .refine((input) => !input.endDate || input.endDate >= input.date, {
    message: 'O término não pode ser anterior à primeira aula.',
  })

const segmentSchema = z.object({
  fromIndex: z.number().int().nonnegative(),
  date: dateSchema.refine(isWeekday),
  hour: z.number().int().min(7).max(22),
})
export const seriesSchema = z
  .object({
    id: idSchema,
    studentId: idSchema,
    createdAt: timestampSchema,
    endDate: optionalEndDate,
    segments: z.array(segmentSchema).min(1),
  })
  .refine(
    (series) => {
      if (series.segments[0].fromIndex !== 0) return false
      if (series.endDate && series.endDate < series.segments[0].date) return false
      return series.segments.every((segment, index) => {
        if (index === 0) return true
        const previous = series.segments[index - 1]
        return (
          segment.fromIndex > previous.fromIndex &&
          segment.date > addDays(previous.date, (segment.fromIndex - previous.fromIndex - 1) * 7)
        )
      })
    },
    { message: 'Os períodos do horário semanal estão inconsistentes.' },
  )

export const blockInputSchema = z
  .object({
    date: dateSchema.refine(isWeekday, 'Escolha um dia de segunda a sexta.'),
    startHour: z.number().int().min(7).max(22),
    endHour: z.number().int().min(8).max(23),
    repeat: z.enum(['once', 'weekly']),
    endDate: optionalEndDate,
    title: z.string().trim().max(100),
  })
  .refine((input) => input.endHour > input.startHour, {
    message: 'O fim do bloqueio deve ser depois do início.',
  })
  .refine((input) => !input.endDate || input.endDate >= input.date, {
    message: 'O término não pode ser anterior ao início do bloqueio.',
  })

export const blockSchema = blockInputSchema.safeExtend({ id: idSchema, createdAt: timestampSchema })
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

const legacyRecordSchema = recordInputSchema.extend({
  id: idSchema,
  lessonId: idSchema,
  studentName: z.string().min(1),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

export const materialInputSchema = z.object({
  bookId: idSchema.optional(),
  levels: z.array(z.enum(LEVELS)).min(1).optional(),
  lessonNumber: z.number().int().min(1, 'O número da aula deve ser positivo.').max(9999).optional(),
  title: z.string().trim().min(1, 'Informe o título do material.').max(150),
  level: z.enum(LEVELS),
  content: z
    .string()
    .trim()
    .min(1, 'Informe o conteúdo do material.')
    .max(20000, 'Use até 20.000 caracteres no material.'),
})
export const materialSchema = materialInputSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})
export const materialSnapshotSchema = materialInputSchema.extend({
  id: idSchema,
  updatedAt: timestampSchema,
  bookTitle: z.string().min(1).max(150).optional(),
})
export const homeworkSchema = z.object({
  description: z.string().trim().min(1).max(2000),
  correctedAt: timestampSchema.nullable(),
})
export const courseReferenceSchema = z.object({
  bookId: idSchema.optional(),
  bookTitle: z.string().min(1).max(150).optional(),
  id: idSchema,
  title: z.string().min(1).max(150),
  level: z.enum(LEVELS),
  lessonNumber: z.number().int().min(1).max(9999),
})
export const courseProgressSchema = z.object({
  completed: z.boolean(),
  next: courseReferenceSchema.nullable(),
})
export const recordSchema = legacyRecordSchema.extend({
  materialSnapshot: materialSnapshotSchema.optional(),
  homework: homeworkSchema.optional(),
  courseProgress: courseProgressSchema.optional(),
})
export const recordSubmissionSchema = recordInputSchema.safeExtend({
  usedMaterialId: idSchema.nullable().optional(),
  homework: z.string().trim().max(2000, 'Use até 2.000 caracteres no homework.').optional(),
  courseCompleted: z.boolean().optional(),
})
export const planInputSchema = z.object({
  materialId: idSchema.nullable(),
  notes: z.string().trim().max(5000),
})
export const planSchema = planInputSchema.extend({ lessonId: idSchema, updatedAt: timestampSchema })

const workspaceDataSchema = z
  .object({
    students: z.array(studentSchema),
    lessons: z.array(lessonSchema),
    records: z.array(legacyRecordSchema),
  })
  .strict()
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

export const legacyWorkspaceSchema = workspaceDataSchema.safeExtend({ version: z.literal(1) })

const weeklyWorkspaceSchema = workspaceDataSchema
  .safeExtend({
    series: z.array(seriesSchema),
    blocks: z.array(blockSchema),
  })
  .superRefine((state, context) => {
    const unique = (values: string[]) => new Set(values).size === values.length
    const students = new Set(state.students.map((student) => student.id))
    const seriesIds = new Set(state.series.map((series) => series.id))
    const valid =
      unique(state.series.map((series) => series.id)) &&
      unique(state.blocks.map((block) => block.id)) &&
      state.series.every((series) => students.has(series.studentId)) &&
      state.lessons.every((lesson) =>
        lesson.seriesId === undefined
          ? lesson.occurrenceIndex === undefined
          : seriesIds.has(lesson.seriesId) &&
            lesson.occurrenceIndex !== undefined &&
            lesson.id === `weekly/${lesson.seriesId}/${lesson.occurrenceIndex}` &&
            state.series.find((series) => series.id === lesson.seriesId)?.studentId ===
              lesson.studentId,
      )
    if (!valid)
      context.addIssue({
        code: 'custom',
        message: 'As referências dos horários semanais estão inconsistentes.',
      })
  })

export const previousWorkspaceSchema = weeklyWorkspaceSchema.safeExtend({ version: z.literal(2) })
const pedagogyWorkspaceSchema = weeklyWorkspaceSchema
  .safeExtend({
    records: z.array(recordSchema),
    materials: z.array(materialSchema),
    plans: z.array(planSchema),
  })

  .superRefine((state, context) => {
    const materialIds = new Set(state.materials.map((material) => material.id))
    const lessonIds = new Set(state.lessons.map((lesson) => lesson.id))
    if (
      materialIds.size !== state.materials.length ||
      new Set(state.plans.map((plan) => plan.lessonId)).size !== state.plans.length ||
      !state.plans.every(
        (plan) =>
          lessonIds.has(plan.lessonId) && (!plan.materialId || materialIds.has(plan.materialId)),
      )
    ) {
      context.addIssue({
        code: 'custom',
        message: 'As referências de materiais ou preparação estão inconsistentes.',
      })
    }
  })

export const pedagogyWorkspaceV3Schema = pedagogyWorkspaceSchema.safeExtend({
  version: z.literal(3),
})
export const workspaceV4Schema = pedagogyWorkspaceSchema
  .safeExtend({ version: z.literal(4) })
  .superRefine((state, context) => {
    const numbers = state.materials
      .filter((material) => material.lessonNumber !== undefined)
      .map((material) => `${material.level}:${material.lessonNumber}`)
    const validProgress = state.records.every((record) => {
      const progress = record.courseProgress
      if (!progress) return true
      const used = record.materialSnapshot
      if (record.attendance !== 'attended' || !used?.lessonNumber || used.level !== record.level)
        return false
      return progress.completed
        ? !progress.next ||
            (progress.next.level === used.level && progress.next.lessonNumber > used.lessonNumber)
        : !!progress.next &&
            progress.next.id === used.id &&
            progress.next.level === used.level &&
            progress.next.lessonNumber === used.lessonNumber
    })
    if (new Set(numbers).size !== numbers.length || !validProgress)
      context.addIssue({
        code: 'custom',
        message: 'A sequência ou os resultados pedagógicos estão inconsistentes.',
      })
  })

export const bookInputSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título da sequência.').max(150),
  levels: z
    .array(z.enum(LEVELS))
    .min(1, 'Selecione ao menos um nível.')
    .refine((levels) => new Set(levels).size === levels.length, 'Não repita níveis na sequência.'),
})
export const bookSchema = bookInputSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})
export const workspaceSchema = pedagogyWorkspaceSchema
  .safeExtend({ version: z.literal(5), books: z.array(bookSchema) })
  .superRefine((state, context) => {
    const books = new Map(state.books.map((book) => [book.id, book]))
    const numbers = state.materials
      .filter((item) => item.lessonNumber !== undefined)
      .map((item) => `${item.bookId}:${item.lessonNumber}`)
    const valid =
      books.size === state.books.length &&
      new Set(numbers).size === numbers.length &&
      state.materials.every((item) =>
        item.bookId
          ? books.has(item.bookId) && item.lessonNumber !== undefined
          : item.lessonNumber === undefined,
      ) &&
      state.materials.every(
        (item) => !item.levels || new Set(item.levels).size === item.levels.length,
      ) &&
      state.students.every(
        (student) => !student.primaryBookId || books.has(student.primaryBookId),
      ) &&
      state.records.every((record) => {
        const progress = record.courseProgress
        if (!progress) return true
        const used = record.materialSnapshot
        if (
          record.attendance !== 'attended' ||
          !used?.bookId ||
          !used.lessonNumber ||
          used.level !== record.level
        )
          return false
        return progress.completed
          ? !progress.next ||
              (progress.next.bookId === used.bookId &&
                progress.next.lessonNumber > used.lessonNumber)
          : !!progress.next &&
              progress.next.id === used.id &&
              progress.next.bookId === used.bookId &&
              progress.next.lessonNumber === used.lessonNumber
      })
    if (!valid)
      context.addIssue({
        code: 'custom',
        message: 'As sequências, unidades ou progressos estão inconsistentes.',
      })
  })

export type Book = z.infer<typeof bookSchema>
export type BookInput = z.infer<typeof bookInputSchema>
export type StudentInput = z.infer<typeof studentInputSchema>
export type Student = z.infer<typeof studentSchema>
export type LessonInput = z.infer<typeof lessonInputSchema>
export type Lesson = z.infer<typeof lessonSchema>
export type RecordInput = z.infer<typeof recordInputSchema>
export type LessonRecord = z.infer<typeof recordSchema>
export type RecordSubmission = z.infer<typeof recordSubmissionSchema>
export type Material = z.infer<typeof materialSchema>
export type MaterialInput = z.infer<typeof materialInputSchema>
export type MaterialSnapshot = z.infer<typeof materialSnapshotSchema>
export type CourseReference = z.infer<typeof courseReferenceSchema>
export type LessonPlanInput = z.infer<typeof planInputSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export type WeeklySeries = z.infer<typeof seriesSchema>
export type SeriesInput = z.infer<typeof seriesInputSchema>
export type ScheduleBlock = z.infer<typeof blockSchema>
export type BlockInput = z.infer<typeof blockInputSchema>

export function errorMessage(error: unknown) {
  if (error instanceof z.ZodError)
    return error.issues[0]?.message ?? 'Confira os campos informados.'
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.'
}
