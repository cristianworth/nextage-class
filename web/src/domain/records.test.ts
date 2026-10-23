import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { saveLessonRecord } from './records'
import { saveStudent } from './students'
import type { RecordInput } from './models'

const now = new Date('2026-10-23T15:00:00Z')
const input: RecordInput = {
  attendance: 'attended',
  level: 'A2',
  material: 'Unidade 3',
  content: 'Praticamos conversação.',
  reason: '',
}

describe('registros de aula', () => {
  it('registra aula ocorrida e preserva original', () => {
    const state = createDemo(now)
    const next = saveLessonRecord(state, 'lesson-0', input, now)
    expect(next.records.at(-1)).toMatchObject({
      ...input,
      lessonId: 'lesson-0',
      studentName: 'Lara Santos',
    })
    expect(state.records).toHaveLength(1)
  })
  it('impede aula futura inclusive hoje antes do término', () => {
    expect(() => saveLessonRecord(createDemo(now), 'lesson-9', input, now)).toThrow(
      'após seu término',
    )
    expect(() =>
      saveLessonRecord(createDemo(now), 'lesson-8', input, new Date('2026-10-23T13:54:00Z')),
    ).toThrow()
  })
  it('exige conteúdo não vazio em presença', () => {
    expect(() =>
      saveLessonRecord(createDemo(now), 'lesson-0', { ...input, content: '  ' }, now),
    ).toThrow()
  })
  it('aceita falta sem justificativa ou conteúdo e não cria crédito', () => {
    const next = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, attendance: 'student-absent', content: '', reason: '' },
      now,
    )
    expect(next.records.at(-1)?.attendance).toBe('student-absent')
    expect(Object.keys(next).sort()).toEqual(['lessons', 'records', 'students', 'version'])
  })
  it('edita o mesmo registro preservando criação e atualizando data', () => {
    const state = saveLessonRecord(createDemo(now), 'lesson-0', input, now)
    const later = new Date('2026-10-23T16:00:00Z')
    const next = saveLessonRecord(
      state,
      'lesson-0',
      { ...input, content: 'Conteúdo corrigido.' },
      later,
    )
    expect(next.records).toHaveLength(2)
    expect(next.records.at(-1)).toMatchObject({
      id: state.records.at(-1)!.id,
      createdAt: now.toISOString(),
      updatedAt: later.toISOString(),
      content: 'Conteúdo corrigido.',
    })
  })
  it('preserva snapshot após editar cadastro e corrigir lançamento', () => {
    const state = createDemo(now)
    const updatedStudent = saveStudent(
      state,
      { ...state.students[0], name: 'Nome atualizado', level: 'C1' },
      state.students[0].id,
      now,
    )
    const next = saveLessonRecord(updatedStudent, 'lesson-previous', input, now)
    expect(next.records[0].studentName).toBe('Lara Santos')
    expect(next.records[0].level).toBe('A2')
  })
  it('informa referência de aula inexistente', () => {
    expect(() => saveLessonRecord(createDemo(now), 'missing', input, now)).toThrow(
      'não foi encontrada',
    )
  })
})
