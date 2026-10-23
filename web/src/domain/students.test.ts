import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { matchesSearch, saveStudent } from './students'
import type { StudentInput } from './models'

const now = new Date('2026-10-23T15:00:00Z')
const input: StudentInput = {
  name: '  Ana Demo  ',
  level: 'A1',
  startDate: '2026-11-02',
  phone: '',
  occupation: '',
  interests: '',
}

describe('alunos', () => {
  it('exige só nome e nível além da data preenchida por padrão', () => {
    const state = createDemo(now)
    const next = saveStudent(state, input, undefined, now)
    expect(next.students.at(-1)).toMatchObject({
      name: 'Ana Demo',
      level: 'A1',
      startDate: '2026-11-02',
      createdAt: now.toISOString(),
    })
    expect(state.students).toHaveLength(4)
  })
  it('recusa nome em branco', () => {
    expect(() => saveStudent(createDemo(now), { ...input, name: '  ' })).toThrow()
  })
  it('edita sem alterar histórico ou data de cadastro', () => {
    const state = createDemo(now)
    const original = state.students[0]
    const next = saveStudent(
      state,
      { ...original, name: 'Novo nome', level: 'C1' },
      original.id,
      now,
    )
    expect(next.students[0].createdAt).toBe(original.createdAt)
    expect(next.records).toEqual(state.records)
    expect(next.records[0].studentName).toBe('Lara Santos')
    expect(next.records[0].level).toBe('A2')
  })
  it('não recria um aluno inexistente durante a edição', () => {
    expect(() => saveStudent(createDemo(now), input, 'missing')).toThrow('não foi encontrado')
  })
  it('pesquisa sem diferenciar caixa ou acentos', () => {
    expect(matchesSearch('João de Sá', 'JOAO')).toBe(true)
    expect(matchesSearch('João de Sá', 'Maria')).toBe(false)
  })
})
