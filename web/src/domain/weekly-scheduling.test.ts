import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { addDays } from './dates'
import { blockAt, findLesson, lessonsInRange, upcomingLessons } from './agenda'
import { scheduleLesson } from './lessons'
import { saveLessonRecord } from './records'
import { occurrenceAt } from './recurrence'
import { addBlock, removeBlock, rescheduleLesson, scheduleWeekly } from './weekly-scheduling'
import { workspaceSchema } from './models'

const now = new Date('2026-10-23T15:00:00Z')
function empty() {
  return { ...createDemo(now), lessons: [], records: [] }
}
function weekly(date = '2026-10-27', endDate: string | null = null) {
  const state = empty()
  return scheduleWeekly(state, { studentId: state.students[0].id, date, hour: 10, endDate }, now)
}

describe('horários semanais', () => {
  it('consulta qualquer semana sem término, sem gravar ocorrências virtuais', () => {
    const state = weekly()
    const date = addDays('2026-10-27', 7 * 2000)
    expect(lessonsInRange(state, date, date)).toHaveLength(1)
    expect(state.lessons).toEqual([])
    expect(upcomingLessons(state, now)).toHaveLength(3)
  })
  it('respeita o término inclusivo e mantém horários independentes do mesmo aluno', () => {
    let state = weekly('2026-10-27', '2026-11-03')
    state = scheduleWeekly(
      state,
      { studentId: state.students[0].id, date: '2026-10-29', hour: 10, endDate: null },
      now,
    )
    expect(lessonsInRange(state, '2026-11-02', '2026-11-06').map((item) => item.date)).toEqual([
      '2026-11-03',
      '2026-11-05',
    ])
    expect(lessonsInRange(state, '2026-11-09', '2026-11-13').map((item) => item.date)).toEqual([
      '2026-11-12',
    ])
  })
  it('recusa data final anterior ao início, finais de semana e horas fora da grade', () => {
    const state = empty()
    const input = { studentId: state.students[0].id, date: '2026-10-27', hour: 10, endDate: null }
    for (const change of [{ endDate: '2026-10-26' }, { date: '2026-10-25' }, { hour: 23 }]) {
      expect(() => scheduleWeekly(state, { ...input, ...change }, now)).toThrow()
    }
  })
  it('materializa registro com identidade estável e não duplica ao consultar ou editar', () => {
    let state = weekly('2026-10-20')
    const lesson = occurrenceAt(state.series[0], 0)!
    const input = {
      attendance: 'attended' as const,
      level: 'A2' as const,
      content: 'Past simple',
      material: '',
      reason: '',
    }
    state = saveLessonRecord(state, lesson.id, input, now)
    state = saveLessonRecord(state, lesson.id, { ...input, content: 'Past simple revisado' }, now)
    expect(workspaceSchema.parse(state)).toEqual(state)
    expect(state.lessons).toHaveLength(1)
    expect(state.records).toHaveLength(1)
    expect(lessonsInRange(state, '2026-10-19', '2026-10-23')).toEqual([lesson])
  })
})

describe('conflitos e bloqueios', () => {
  it('recusa série que atingiria aula distante, mantendo estado inteiro', () => {
    const state = empty()
    const date = addDays('2026-10-27', 7 * 1500)
    const booked = scheduleLesson(state, { studentId: state.students[0].id, date, hour: 10 }, now)
    const before = structuredClone(booked)
    expect(() =>
      scheduleWeekly(
        booked,
        { studentId: state.students[1].id, date: '2026-10-27', hour: 10, endDate: null },
        now,
      ),
    ).toThrow('Conflito')
    expect(booked).toEqual(before)
  })
  it('bloqueia intervalo semanal, aceita horário adjacente e remove só o bloqueio', () => {
    const state = addBlock(
      empty(),
      {
        date: '2026-10-27',
        startHour: 7,
        endHour: 10,
        repeat: 'weekly',
        endDate: null,
        title: 'Férias',
      },
      now,
    )
    expect(blockAt(state, '2026-11-03', 9)?.title).toBe('Férias')
    expect(blockAt(state, '2026-11-03', 10)).toBeUndefined()
    expect(() =>
      scheduleLesson(state, { studentId: state.students[0].id, date: '2026-11-03', hour: 9 }, now),
    ).toThrow('Férias')
    const booked = scheduleLesson(
      state,
      { studentId: state.students[0].id, date: '2026-11-03', hour: 10 },
      now,
    )
    const removed = removeBlock(booked, booked.blocks[0].id)
    expect(removed.lessons).toEqual(booked.lessons)
    expect(blockAt(removed, '2026-11-03', 9)).toBeUndefined()
  })
  it('recusa bloqueio sobre aula distante e outro bloqueio, sem alteração parcial', () => {
    const state = weekly()
    const before = structuredClone(state)
    const input = {
      date: addDays('2026-10-27', 7 * 1400),
      startHour: 9,
      endHour: 11,
      repeat: 'once' as const,
      endDate: null,
      title: '',
    }
    expect(() => addBlock(state, input, now)).toThrow('Conflito')
    expect(state).toEqual(before)
    const blocked = addBlock(empty(), input, now)
    expect(() => addBlock(blocked, { ...input, repeat: 'weekly' }, now)).toThrow('Conflito')
  })
  it('permite dia inteiro, respeita término e impede intervalos inválidos', () => {
    const input = {
      date: '2026-10-27',
      startHour: 7,
      endHour: 23,
      repeat: 'weekly' as const,
      endDate: '2026-11-03',
      title: '',
    }
    const state = addBlock(empty(), input, now)
    expect(blockAt(state, '2026-11-03', 22)).toBeDefined()
    expect(blockAt(state, '2026-11-10', 22)).toBeUndefined()
    expect(() => addBlock(empty(), { ...input, endHour: 7 }, now)).toThrow()
  })
})

describe('remarcação sem reposição', () => {
  it('move somente uma ocorrência com mesmo ID e libera apenas sua posição anterior', () => {
    let state = weekly()
    const lesson = occurrenceAt(state.series[0], 0)!
    state = rescheduleLesson(state, lesson.id, { date: '2026-10-29', hour: 11 }, 'single', now)
    expect(findLesson(state, lesson.id)?.date).toBe('2026-10-29')
    expect(lessonsInRange(state, '2026-10-26', '2026-10-30')).toHaveLength(1)
    expect(lessonsInRange(state, '2026-11-02', '2026-11-06')[0].date).toBe('2026-11-03')
    expect(() =>
      scheduleLesson(state, { studentId: state.students[1].id, date: '2026-10-27', hour: 10 }, now),
    ).not.toThrow()
    expect(() =>
      scheduleWeekly(
        state,
        { studentId: state.students[1].id, date: '2026-10-27', hour: 10, endDate: null },
        now,
      ),
    ).toThrow('Conflito')
  })
  it('esta e próximas substitui a troca individual futura e preserva a série independente', () => {
    let state = weekly()
    state = scheduleWeekly(
      state,
      { studentId: state.students[0].id, date: '2026-10-30', hour: 8, endDate: null },
      now,
    )
    const first = occurrenceAt(state.series[0], 0)!
    const second = occurrenceAt(state.series[0], 1)!
    state = rescheduleLesson(state, second.id, { date: '2026-11-05', hour: 11 }, 'single', now)
    state = rescheduleLesson(state, first.id, { date: '2026-10-28', hour: 9 }, 'following', now)
    expect(findLesson(state, second.id)).toMatchObject({ date: '2026-11-04', hour: 9 })
    expect(lessonsInRange(state, '2026-11-02', '2026-11-06').map((item) => item.date)).toEqual([
      '2026-11-04',
      '2026-11-06',
    ])
  })
  it('mantém histórico e datas passadas ao alterar o futuro e recusa alterar aula iniciada', () => {
    let state = weekly('2026-10-20')
    const past = occurrenceAt(state.series[0], 0)!
    state = saveLessonRecord(
      state,
      past.id,
      { attendance: 'attended', level: 'A2', content: 'História', material: '', reason: '' },
      now,
    )
    const record = structuredClone(state.records[0])
    const future = occurrenceAt(state.series[0], 1)!
    state = rescheduleLesson(state, future.id, { date: '2026-10-28', hour: 9 }, 'following', now)
    expect(findLesson(state, past.id)).toEqual(past)
    expect(state.records[0]).toEqual(record)
    expect(() =>
      rescheduleLesson(state, past.id, { date: '2026-10-30', hour: 9 }, 'single', now),
    ).toThrow('histórico')
  })
  it('preserva exceção já iniciada mesmo quando seu índice está depois do início da mudança', () => {
    const earlier = new Date('2026-10-01T15:00:00Z')
    let state = weekly()
    const first = occurrenceAt(state.series[0], 0)!
    const second = occurrenceAt(state.series[0], 1)!
    state = rescheduleLesson(state, second.id, { date: '2026-10-22', hour: 8 }, 'single', earlier)
    state = rescheduleLesson(state, first.id, { date: '2026-10-28', hour: 9 }, 'following', now)
    expect(findLesson(state, second.id)?.date).toBe('2026-10-22')
    expect(lessonsInRange(state, '2026-11-02', '2026-11-06')).toHaveLength(0)
  })
  it('recusa conflito futuro em lote sem perder exceção ou alterar série', () => {
    let state = weekly()
    const first = occurrenceAt(state.series[0], 0)!
    const second = occurrenceAt(state.series[0], 1)!
    state = rescheduleLesson(state, second.id, { date: '2026-11-05', hour: 11 }, 'single', now)
    state = scheduleLesson(
      state,
      { studentId: state.students[1].id, date: addDays('2026-10-28', 7 * 400), hour: 9 },
      now,
    )
    const before = structuredClone(state)
    expect(() =>
      rescheduleLesson(state, first.id, { date: '2026-10-28', hour: 9 }, 'following', now),
    ).toThrow('Conflito')
    expect(state).toEqual(before)
  })
  it('preserva ocorrências passadas ainda virtuais quando a primeira aula foi adiada', () => {
    const earlier = new Date('2026-10-01T15:00:00Z')
    let state = weekly('2026-10-06')
    const first = occurrenceAt(state.series[0], 0)!
    const past = occurrenceAt(state.series[0], 1)!
    state = rescheduleLesson(state, first.id, { date: '2026-10-29', hour: 10 }, 'single', earlier)
    state = rescheduleLesson(state, first.id, { date: '2026-10-28', hour: 9 }, 'following', now)
    expect(findLesson(state, past.id)).toEqual(past)
    expect(lessonsInRange(state, '2026-10-12', '2026-10-23').map((item) => item.date)).toEqual([
      '2026-10-13',
      '2026-10-20',
    ])
  })
})
