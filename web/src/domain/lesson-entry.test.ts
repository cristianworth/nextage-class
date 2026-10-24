import { describe, expect, it } from 'vitest'
import { addDemoMaterials, createDemo } from './demo'
import { saveLessonRecord } from './records'
import { saveStudent } from './students'
import { materialsForLevel, materialLabel, saveMaterial } from './materials'

const now = new Date('2026-10-23T15:00:00Z')
const input = {
  attendance: 'attended' as const,
  level: 'C1' as const,
  material: '',
  content: 'Conteúdo válido',
  reason: '',
}

describe('lançamento consistente', () => {
  it('deriva nível do cadastro e não aceita override do formulário', () => {
    const state = createDemo(now)
    const next = saveLessonRecord(state, 'lesson-0', input, now)
    expect(next.records.at(-1)?.level).toBe('A2')
    expect(next.students).toEqual(state.students)
  })
  it('preserva nível e cópia antigos após promoção e rejeita nova seleção incompatível', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, usedMaterialId: 'material-a2' },
      now,
    )
    const snapshot = structuredClone(state.records.at(-1)!.materialSnapshot)
    const material = state.materials.find((item) => item.id === 'material-a2')!
    state = saveMaterial(state, { ...material, level: 'B1' }, material.id, now)
    state = saveStudent(state, { ...state.students[0], level: 'C1' }, 'student-lara', now)
    state = saveLessonRecord(state, 'lesson-0', { ...input, content: 'Texto corrigido' }, now)
    expect(state.records.at(-1)).toMatchObject({ level: 'A2', materialSnapshot: snapshot })
    expect(state.students[0].level).toBe('C1')
    expect(() =>
      saveLessonRecord(state, 'lesson-0', { ...input, usedMaterialId: 'material-c1' }, now),
    ).toThrow('nível A2')
  })
  it('recusa referência de outro nível mesmo que o input tente mudar o nível', () => {
    const state = createDemo(now)
    const before = structuredClone(state)
    expect(() =>
      saveLessonRecord(state, 'lesson-0', { ...input, usedMaterialId: 'material-c1' }, now),
    ).toThrow('nível A2')
    expect(state).toEqual(before)
  })
  it('preserva texto livre histórico e permite retirar material explicitamente', () => {
    const state = createDemo(now)
    const text = state.records[0].material
    const next = saveLessonRecord(state, 'lesson-previous', { ...input, material: text }, now)
    expect(next.records[0].material).toBe(text)
    const cleared = saveLessonRecord(
      next,
      'lesson-previous',
      { ...input, usedMaterialId: null, material: '' },
      now,
    )
    expect(cleared.records[0].material).toBe('')
  })
  it('filtra e ordena unidades 2 e 10 numericamente e identifica o título', () => {
    const material = createDemo(now).materials[0]
    const selected = materialsForLevel(
      [
        { ...material, id: 'ten', title: 'A', lessonNumber: 10 },
        { ...material, id: 'two', title: 'Z', lessonNumber: 2 },
        { ...material, id: 'other', level: 'A2', lessonNumber: 1 },
      ],
      'A1',
    )
    expect(selected.map((item) => item.id)).toEqual(['two', 'ten'])
    expect(materialLabel(selected[0])).toBe('Unidade 2 — Z')
  })
})

describe('exemplos sem reset', () => {
  it('preenche acervo vazio, mantém o restante e é idempotente', () => {
    const state = { ...createDemo(now), materials: [] }
    const next = addDemoMaterials(state, now)
    expect(next.materials).toHaveLength(9)
    expect(next.students).toBe(state.students)
    expect(next.lessons).toBe(state.lessons)
    expect(next.records).toBe(state.records)
    expect(addDemoMaterials(next, now)).toBe(next)
  })
  it('não sobrescreve nem duplica ID, título/nível ou número/nível existente', () => {
    const state = createDemo(now)
    state.materials = [
      { ...state.materials[0], title: 'Meu texto', content: 'Preservar' },
      { ...state.materials[1], id: 'custom-two', title: 'Meu conteúdo 2' },
      { ...state.materials[4], id: 'custom-a2', lessonNumber: undefined },
    ]
    const before = structuredClone(state.materials)
    const next = addDemoMaterials(state, now)
    expect(next.materials.slice(0, 3)).toEqual(before)
    expect(next.materials).toHaveLength(9)
    expect(new Set(next.materials.map((item) => item.id)).size).toBe(9)
  })
})
