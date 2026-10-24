import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { courseSuggestion } from './course-progress'
import { saveLessonRecord } from './records'
import { compareMaterials, saveMaterial } from './materials'
import { setHomeworkCorrected } from './homework'
import { workspaceSchema } from './models'
import type { Workspace } from './models'

const now = new Date('2026-10-23T15:00:00Z')
const input = {
  attendance: 'attended' as const,
  level: 'A1' as const,
  material: '',
  content: 'Conteúdo e temas adicionais',
  reason: '',
}
function fixture(): Workspace {
  return {
    ...createDemo(now),
    records: [],
    lessons: ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22'].map((date, index) => ({
      id: `meeting-${index}`,
      studentId: 'student-sofia',
      date,
      hour: 10,
      createdAt: now.toISOString(),
    })),
  }
}

describe('sequência do aluno', () => {
  it('retoma a Aula 3 por vários encontros, avança para 4 e preserva a trabalhada', () => {
    let state = fixture()
    expect(courseSuggestion(state, 'student-sofia', 'A1').material?.lessonNumber).toBe(1)
    state = saveLessonRecord(
      state,
      'meeting-0',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: false },
      now,
    )
    expect(courseSuggestion(state, 'student-sofia', 'A1').material?.lessonNumber).toBe(3)
    state = saveLessonRecord(
      state,
      'meeting-1',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: true },
      now,
    )
    expect(courseSuggestion(state, 'student-sofia', 'A1').material?.lessonNumber).toBe(4)
    expect(state.records[1].materialSnapshot?.lessonNumber).toBe(3)
    expect(state.records[1].courseProgress?.next?.lessonNumber).toBe(4)
    expect(workspaceSchema.parse(state)).toEqual(state)
  })
  it('faltas e complementares compatíveis não apagam o progresso', () => {
    let state = saveLessonRecord(
      fixture(),
      'meeting-0',
      { ...input, usedMaterialId: 'material-a1-3' },
      now,
    )
    state = saveLessonRecord(
      state,
      'meeting-1',
      {
        ...input,
        attendance: 'student-absent',
        content: '',
        usedMaterialId: 'material-a1-4',
        courseCompleted: true,
      },
      now,
    )
    state = saveMaterial(
      state,
      { title: 'Apoio', level: 'A1', content: 'Conversação' },
      undefined,
      now,
    )
    state = saveLessonRecord(
      state,
      'meeting-2',
      { ...input, usedMaterialId: state.materials.at(-1)!.id, courseCompleted: true },
      now,
    )
    expect(courseSuggestion(state, 'student-sofia', 'A1').material?.lessonNumber).toBe(3)
    expect(state.records.slice(1).every((record) => !record.courseProgress)).toBe(true)
  })
  it('usa cronologia dos encontros mesmo com edição ou criação fora de ordem', () => {
    let state = saveLessonRecord(
      fixture(),
      'meeting-2',
      { ...input, usedMaterialId: 'material-a1-4' },
      now,
    )
    state = saveLessonRecord(
      state,
      'meeting-0',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: true },
      now,
    )
    state = saveLessonRecord(
      state,
      'meeting-0',
      { ...input, content: 'Correção antiga', courseCompleted: false },
      new Date('2026-10-24T15:00:00Z'),
    )
    expect(courseSuggestion(state, 'student-sofia', 'A1').material?.lessonNumber).toBe(4)
    expect(
      courseSuggestion(state, 'student-sofia', 'A1', state.lessons[1]).material?.lessonNumber,
    ).toBe(3)
    expect(
      courseSuggestion(state, 'student-sofia', 'A1', state.lessons[0]).material?.lessonNumber,
    ).toBe(1)
  })
  it('preserva continuidade histórica ao editar texto, homework ou acervo', () => {
    let state = saveLessonRecord(
      fixture(),
      'meeting-0',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: true, homework: 'Revisar' },
      now,
    )
    const progress = structuredClone(state.records[0].courseProgress)
    const material = state.materials.find((item) => item.id === 'material-a1-4')!
    state = saveMaterial(state, { ...material, title: 'Título atualizado' }, material.id, now)
    state = saveLessonRecord(
      state,
      'meeting-0',
      { ...input, content: 'Texto corrigido', courseCompleted: true },
      now,
    )
    state = setHomeworkCorrected(state, state.records[0].id, true, now)
    expect(state.records[0].courseProgress).toEqual(progress)
    expect(state.records[0].materialSnapshot?.lessonNumber).toBe(3)
  })
  it('isola aluno/nível e informa fim sem mudar o nível; novo conteúdo pode estender sequência', () => {
    let state = saveLessonRecord(
      fixture(),
      'meeting-0',
      { ...input, usedMaterialId: 'material-a1-4', courseCompleted: true },
      now,
    )
    expect(courseSuggestion(state, 'student-sofia', 'A1').finished).toBe(true)
    expect(state.students.find((item) => item.id === 'student-sofia')?.level).toBe('A1')
    expect(courseSuggestion(state, 'student-lara', 'A1').material?.lessonNumber).toBe(1)
    expect(courseSuggestion(state, 'student-sofia', 'A2').material).toBeUndefined()
    state = saveMaterial(
      state,
      { title: 'A new topic', content: 'Practice', level: 'A1', lessonNumber: 5 },
      undefined,
      now,
    )
    expect(courseSuggestion(state, 'student-sofia', 'A1').material?.lessonNumber).toBe(5)
    expect(state.records[0].courseProgress?.next).toBeNull()
  })
  it('avisa quando continuidade deixou o nível, sem sugerir outro nível', () => {
    let state = saveLessonRecord(
      fixture(),
      'meeting-0',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: true },
      now,
    )
    const material = state.materials.find((item) => item.id === 'material-a1-4')!
    state = saveMaterial(state, { ...material, level: 'A2' }, material.id, now)
    expect(courseSuggestion(state, 'student-sofia', 'A1')).toMatchObject({
      material: undefined,
      unavailable: true,
    })
  })
  it('ordena numericamente e recusa duplicados somente no mesmo nível', () => {
    let state = { ...fixture(), materials: [] as ReturnType<typeof createDemo>['materials'] }
    for (const lessonNumber of [10, 2])
      state = saveMaterial(
        state,
        { title: `Topic ${lessonNumber}`, content: 'Text', level: 'A1', lessonNumber },
        undefined,
        now,
      )
    state = saveMaterial(state, { title: 'Extra', content: 'Text', level: 'A1' }, undefined, now)
    expect([...state.materials].sort(compareMaterials).map((item) => item.lessonNumber)).toEqual([
      2,
      10,
      undefined,
    ])
    expect(() =>
      saveMaterial(state, { title: 'Duplicate', content: 'Text', level: 'A1', lessonNumber: 2 }),
    ).toThrow('Já existe')
    expect(() =>
      saveMaterial(state, { title: 'Other level', content: 'Text', level: 'A2', lessonNumber: 2 }),
    ).not.toThrow()
    expect(() =>
      saveMaterial(state, { title: 'Invalid', content: 'Text', level: 'A1', lessonNumber: 0 }),
    ).toThrow()
  })
  it('recusa dados salvos com número duplicado ou resultado inconsistente', () => {
    const state = fixture()
    state.materials.push({ ...state.materials[0], id: 'duplicate' })
    expect(workspaceSchema.safeParse(state).success).toBe(false)
    const valid = saveLessonRecord(
      fixture(),
      'meeting-0',
      { ...input, usedMaterialId: 'material-a1-3' },
      now,
    )
    valid.records[0].courseProgress = { completed: false, next: null }
    expect(workspaceSchema.safeParse(valid).success).toBe(false)
  })
})
