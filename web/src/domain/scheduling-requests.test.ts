import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { availableRequestHours } from './availability'
import { scheduleLesson } from './lessons'
import { addBlock, rescheduleLesson, scheduleWeekly } from './weekly-scheduling'
import { occurrenceAt } from './recurrence'
import {
  decideSchedulingRequest,
  studentRequests,
  submitSchedulingRequest,
} from './scheduling-requests'
import { workspaceSchema } from './models'

const now = new Date('2026-10-23T15:00:00Z')
const input = { kind: 'once' as const, date: '2026-10-26', hour: 10, endDate: null }
const weekly = { ...input, kind: 'weekly' as const }
function empty() {
  return { ...createDemo(now), lessons: [], records: [] }
}

describe('solicitações de horário', () => {
  it('combina vários dias semanais e avulsos sem reservar, inclusive pedidos de outros alunos', () => {
    const original = empty()
    let state = submitSchedulingRequest(original, 'student-lara', weekly, now)
    state = submitSchedulingRequest(state, 'student-lara', { ...weekly, date: '2026-10-27' }, now)
    state = submitSchedulingRequest(
      state,
      'student-lara',
      { ...weekly, date: '2026-10-28', hour: 11 },
      now,
    )
    state = submitSchedulingRequest(state, 'student-lara', { ...input, date: '2026-10-30' }, now)
    state = submitSchedulingRequest(state, 'student-mateus', weekly, now)
    expect(state.requests).toHaveLength(5)
    expect(state.lessons).toEqual(original.lessons)
    expect(state.series).toEqual([])
    expect(availableRequestHours(state, weekly, now)).toContain(10)
    expect(original.requests).toEqual([])
    expect(() => submitSchedulingRequest(state, 'student-lara', weekly, now)).toThrow(
      'já tem um pedido',
    )
    expect(studentRequests(state, 'student-lara')).toHaveLength(4)
    expect(studentRequests(state, 'unknown')).toEqual([])
    const dto = studentRequests(state, 'student-mateus')[0]
    expect(Object.keys(dto).sort()).toEqual(
      ['id', 'kind', 'date', 'hour', 'endDate', 'status', 'createdAt', 'decidedAt'].sort(),
    )
  })
  it('considera conflitos distantes e término inclusivo sem impor horizonte', () => {
    let state = scheduleLesson(
      empty(),
      { studentId: 'student-mateus', date: '2030-10-28', hour: 10 },
      now,
    )
    expect(availableRequestHours(state, weekly, now)).not.toContain(10)
    expect(availableRequestHours(state, input, now)).toContain(10)
    expect(availableRequestHours(state, { ...weekly, endDate: '2030-10-27' }, now)).toContain(10)
    expect(availableRequestHours(state, { ...weekly, endDate: '2030-10-28' }, now)).not.toContain(
      10,
    )
    state = addBlock(
      state,
      {
        date: '2026-10-27',
        startHour: 7,
        endHour: 23,
        repeat: 'weekly',
        endDate: null,
        title: 'PRIVATE_BLOCK',
      },
      now,
    )
    expect(availableRequestHours(state, { ...weekly, date: '2026-10-27' }, now)).toEqual([])
    expect(() =>
      submitSchedulingRequest(state, 'student-lara', { ...input, date: '2026-10-27' }, now),
    ).toThrow('não está mais disponível')
    try {
      submitSchedulingRequest(state, 'student-lara', { ...input, date: '2026-10-27' }, now)
    } catch (error) {
      expect(String(error)).not.toMatch(/PRIVATE_BLOCK|Mateus/)
    }
  })
  it('considera exceções de remarcação sem liberar a série inteira', () => {
    let state = scheduleWeekly(empty(), { ...weekly, studentId: 'student-mateus' }, now)
    state = rescheduleLesson(
      state,
      occurrenceAt(state.series[0], 0)!.id,
      { date: '2026-10-27', hour: 11 },
      'single',
      now,
    )
    expect(availableRequestHours(state, input, now)).toContain(10)
    expect(availableRequestHours(state, weekly, now)).not.toContain(10)
    expect(availableRequestHours(state, { ...input, date: '2026-10-27' }, now)).not.toContain(11)
  })
  it('limita dias, horas, início e período; desconhecidos não podem pedir', () => {
    const state = empty()
    expect(availableRequestHours(state, { ...input, date: 'invalid' }, now)).toEqual([])
    expect(availableRequestHours(state, { ...input, date: '2026-10-24' }, now)).toEqual([])
    expect(availableRequestHours(state, { ...input, date: '2026-10-23' }, now)).toEqual([
      13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ])
    for (const invalid of [
      { ...input, hour: 23 },
      { ...input, hour: 6 },
      { ...input, date: '2026-10-24' },
      { ...input, date: '2026-10-22' },
      { ...weekly, endDate: '2026-10-25' },
      { ...input, endDate: input.date },
    ])
      expect(() => submitSchedulingRequest(state, 'student-lara', invalid, now)).toThrow()
    expect(() => submitSchedulingRequest(state, 'missing', input, now)).toThrow(
      'Aluno não encontrado',
    )
  })
  it('aprova uma avulsa e uma série uma única vez; recusa não cria encontros', () => {
    let state = submitSchedulingRequest(empty(), 'student-lara', input, now)
    const id = state.requests[0].id
    state = decideSchedulingRequest(state, id, 'approved', now)
    expect(state.lessons).toHaveLength(1)
    expect(state.requests[0]).toMatchObject({
      status: 'approved',
      bookingId: state.lessons[0].id,
      decidedAt: now.toISOString(),
    })
    expect(() => decideSchedulingRequest(state, id, 'approved', now)).toThrow('já foi decidido')
    expect(() => decideSchedulingRequest(state, id, 'declined', now)).toThrow('já foi decidido')
    state = submitSchedulingRequest(
      state,
      'student-lara',
      { ...weekly, date: '2026-10-27', endDate: '2026-11-17' },
      now,
    )
    state = decideSchedulingRequest(state, state.requests[1].id, 'approved', now)
    expect(state.series[0]).toMatchObject({
      studentId: 'student-lara',
      endDate: '2026-11-17',
      segments: [{ date: '2026-10-27', hour: 10, fromIndex: 0 }],
    })
    state = submitSchedulingRequest(state, 'student-lara', { ...input, hour: 11 }, now)
    state = decideSchedulingRequest(state, state.requests[2].id, 'declined', now)
    expect(state.requests[2]).toMatchObject({ status: 'declined', bookingId: null })
    expect(state.lessons).toHaveLength(1)
    expect(state.series).toHaveLength(1)
    expect(workspaceSchema.safeParse(state).success).toBe(true)
  })
  it('aprovação revalida ocupação, bloqueio e tempo sem alterar pendências', () => {
    let state = submitSchedulingRequest(empty(), 'student-lara', weekly, now)
    state = submitSchedulingRequest(state, 'student-mateus', weekly, now)
    const secondId = state.requests[1].id
    state = decideSchedulingRequest(state, state.requests[0].id, 'approved', now)
    const before = structuredClone(state)
    expect(() => decideSchedulingRequest(state, secondId, 'approved', now)).toThrow('Conflito')
    expect(state).toEqual(before)
    const pending = submitSchedulingRequest(empty(), 'student-lara', input, now)
    const blocked = addBlock(
      pending,
      {
        date: input.date,
        startHour: 10,
        endHour: 11,
        repeat: 'once',
        endDate: null,
        title: 'Pausa',
      },
      now,
    )
    expect(() => decideSchedulingRequest(blocked, pending.requests[0].id, 'approved', now)).toThrow(
      'Conflito',
    )
    expect(() =>
      decideSchedulingRequest(
        pending,
        pending.requests[0].id,
        'approved',
        new Date('2026-10-26T13:00:00Z'),
      ),
    ).toThrow('já começou')
    expect(() => decideSchedulingRequest(pending, 'unknown', 'approved', now)).toThrow(
      'não encontrada',
    )
    expect(
      decideSchedulingRequest(
        pending,
        pending.requests[0].id,
        'declined',
        new Date('2026-10-27T13:00:00Z'),
      ).requests[0].status,
    ).toBe('declined')
  })
})
