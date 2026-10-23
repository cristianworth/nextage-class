import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { scheduleLesson } from './lessons'

const now = new Date('2026-10-23T15:00:00Z')
const input = { studentId: 'student-lara', date: '2026-10-23', hour: 7 }

describe('aulas pontuais', () => {
  it('agenda sem modificar o estado original', () => {
    const state = createDemo(now)
    const next = scheduleLesson(state, input, now)
    expect(next.lessons).toHaveLength(state.lessons.length + 1)
    expect(next.lessons.at(-1)).toMatchObject(input)
  })
  it('impede conflito entre alunos e preserva as aulas', () => {
    const state = createDemo(now)
    const before = structuredClone(state)
    expect(() => scheduleLesson(state, { ...input, hour: 10, studentId: 'student-sofia' })).toThrow(
      'ocupado por Lara Santos',
    )
    expect(state).toEqual(before)
  })
  it('aceita bloco seguinte após o intervalo e o último horário', () => {
    const state = createDemo(now)
    expect(scheduleLesson(state, { ...input, hour: 11 }).lessons.at(-1)?.hour).toBe(11)
    expect(
      scheduleLesson(state, { ...input, date: '2026-10-22', hour: 22 }).lessons.at(-1)?.hour,
    ).toBe(22)
  })
  it.each([
    { date: '2026-10-24' },
    { hour: 23 },
    { hour: 6 },
    { hour: 9.5 },
    { date: '2026-02-30' },
  ])('recusa grade inválida %j', (override) => {
    expect(() => scheduleLesson(createDemo(now), { ...input, ...override })).toThrow()
  })
  it('recusa aluno inexistente', () => {
    expect(() => scheduleLesson(createDemo(now), { ...input, studentId: 'missing' })).toThrow(
      'aluno cadastrado',
    )
  })
})
