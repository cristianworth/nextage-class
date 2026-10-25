import { availableRequestHours } from './availability'
import { hasLessonStarted } from './dates'
import { scheduleLesson } from './lessons'
import { requestInputSchema, workspaceSchema } from './models'
import type { SchedulingRequestInput, Workspace } from './models'
import { scheduleWeekly } from './weekly-scheduling'

export const REQUEST_STATUS = {
  pending: 'Pendente',
  approved: 'Aprovado',
  declined: 'Recusado',
} as const

export function studentRequests(state: Workspace, studentId: string) {
  if (!state.students.some((student) => student.id === studentId)) return []
  return state.requests
    .filter((request) => request.studentId === studentId)
    .map(({ id, kind, date, hour, endDate, status, createdAt, decidedAt }) => ({
      id,
      kind,
      date,
      hour,
      endDate,
      status,
      createdAt,
      decidedAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
}
export type StudentRequestView = ReturnType<typeof studentRequests>[number]

export function submitSchedulingRequest(
  state: Workspace,
  studentId: string,
  input: SchedulingRequestInput,
  now = new Date(),
): Workspace {
  const values = requestInputSchema.parse(input)
  if (!state.students.some((student) => student.id === studentId))
    throw new Error('Aluno não encontrado.')
  if (hasLessonStarted(values.date, values.hour, now))
    throw new Error('Escolha um horário que ainda não começou.')
  if (
    state.requests.some(
      (request) =>
        request.studentId === studentId &&
        request.status === 'pending' &&
        request.kind === values.kind &&
        request.date === values.date &&
        request.hour === values.hour &&
        request.endDate === values.endDate,
    )
  )
    throw new Error('Você já tem um pedido pendente para esse horário e período.')
  if (!availableRequestHours(state, values, now).includes(values.hour))
    throw new Error(
      'Esse horário não está mais disponível para o período escolhido. Consulte outros horários.',
    )
  return workspaceSchema.parse({
    ...state,
    requests: [
      ...state.requests,
      {
        ...values,
        id: crypto.randomUUID(),
        studentId,
        createdAt: now.toISOString(),
        status: 'pending',
        decidedAt: null,
        bookingId: null,
      },
    ],
  })
}

export function decideSchedulingRequest(
  state: Workspace,
  requestId: string,
  decision: 'approved' | 'declined',
  now = new Date(),
): Workspace {
  const request = state.requests.find((item) => item.id === requestId)
  if (!request) throw new Error('Solicitação não encontrada.')
  if (request.status !== 'pending')
    throw new Error('Esse pedido já foi decidido. A agenda não foi alterada.')
  if (decision !== 'approved' && decision !== 'declined')
    throw new Error('Escolha aprovar ou recusar.')
  let next = state
  let bookingId: string | null = null
  if (decision === 'approved') {
    if (hasLessonStarted(request.date, request.hour, now))
      throw new Error(
        'O primeiro horário já começou. Recuse este pedido e combine um novo início com o aluno.',
      )
    next =
      request.kind === 'once'
        ? scheduleLesson(state, request, now)
        : scheduleWeekly(state, request, now)
    bookingId = request.kind === 'once' ? next.lessons.at(-1)!.id : next.series.at(-1)!.id
  }
  return workspaceSchema.parse({
    ...next,
    requests: next.requests.map((item) =>
      item.id === requestId
        ? { ...item, status: decision, decidedAt: now.toISOString(), bookingId }
        : item,
    ),
  })
}
