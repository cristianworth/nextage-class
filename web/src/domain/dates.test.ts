import { describe, expect, it } from 'vitest'
import { addDays, hasLessonEnded, isValidDate, referenceClock, weekDays, weekStart } from './dates'

describe('datas no fuso de referência', () => {
  it('usa São Paulo mesmo quando o dia UTC já mudou', () => {
    expect(referenceClock(new Date('2026-10-24T01:30:00Z'))).toEqual({
      date: '2026-10-23',
      minutes: 22 * 60 + 30,
    })
  })
  it('não aceita datas impossíveis', () => {
    expect(isValidDate('2026-02-30')).toBe(false)
    expect(isValidDate('2028-02-29')).toBe(true)
  })
  it('atravessa mês/ano e mantém a semana de segunda a sexta', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(weekStart('2026-10-25')).toBe('2026-10-19')
    expect(weekDays('2026-10-23')).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
    ])
  })
  it('libera lançamento somente após os 55 minutos', () => {
    expect(hasLessonEnded('2026-10-23', 10, new Date('2026-10-23T13:54:00Z'))).toBe(false)
    expect(hasLessonEnded('2026-10-23', 10, new Date('2026-10-23T13:55:00Z'))).toBe(true)
    expect(hasLessonEnded('2026-10-24', 7, new Date('2026-10-23T20:00:00Z'))).toBe(false)
  })
})
