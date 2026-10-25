import { describe, expect, it } from 'vitest'
import { studentLibrary } from './student-library'
import { studentOverview } from './student-overview'
import { createDemo } from './demo'
import { saveBook } from './books'
import { saveMaterial } from './materials'
import { saveStudent } from './students'
import { saveLessonRecord } from './records'
const now = new Date('2026-10-23T15:00:00Z')
const input = {
  attendance: 'attended' as const,
  level: 'A1' as const,
  material: '',
  content: 'PRIVATE_CLASS_NOTES',
  reason: '',
}

describe('acervo do aluno', () => {
  it('filtra o nível atual e entrega só campos do catálogo, sem dados de pessoas ou planos', () => {
    const state = createDemo(now)
    state.students[0].phone = 'PRIVATE_PHONE'
    state.records[0].content = 'PRIVATE_CLASS_NOTES'
    state.records[0].reason = 'PRIVATE_REASON'
    state.plans.push({
      lessonId: 'lesson-9',
      materialId: 'material-b1',
      notes: 'PRIVATE_PLAN',
      updatedAt: now.toISOString(),
    })
    const view = studentLibrary(state, 'student-lara')!
    expect(view.level).toBe('A2')
    expect(view.materials.map((item) => item.id)).toEqual(['material-a2'])
    expect(view.sequences).toEqual([])
    expect(Object.keys(view).sort()).toEqual(['level', 'materials', 'primary', 'sequences'])
    expect(Object.keys(view.materials[0]).sort()).toEqual([
      'content',
      'id',
      'lessonNumber',
      'levels',
      'sequenceId',
      'sequenceTitle',
      'title',
      'updatedAt',
    ])
    for (const hidden of [
      'PRIVATE_PHONE',
      'PRIVATE_CLASS_NOTES',
      'PRIVATE_REASON',
      'PRIVATE_PLAN',
      'Lara Santos',
      'Mateus Costa',
      'records',
      'plans',
      'homework',
      'Planning is private',
    ])
      expect(JSON.stringify(view)).not.toContain(hidden)
    expect(studentLibrary(state, 'missing')).toBeNull()
  })
  it('herda níveis da sequência e inclui apoio compartilhado uma vez, sem usar metadado antigo', () => {
    let state = createDemo(now)
    state = saveBook(
      state,
      { title: 'Shared sequence', levels: ['A1', 'A2'] },
      state.books[0].id,
      now,
    )
    state = saveMaterial(
      state,
      { title: 'Shared support', level: 'A1', levels: ['A1', 'A2'], content: 'Support text' },
      undefined,
      now,
    )
    const support = state.materials.at(-1)!.id
    let view = studentLibrary(state, 'student-lara')!
    expect(view.materials.filter((item) => item.id === 'material-a1')).toHaveLength(1)
    expect(view.materials.filter((item) => item.id === support)).toHaveLength(1)
    expect(view.materials.find((item) => item.id === 'material-a1')!.levels).toEqual(['A1', 'A2'])
    state = saveBook(state, { title: 'Shared sequence', levels: ['B1'] }, state.books[0].id, now)
    view = studentLibrary(state, 'student-lara')!
    expect(view.materials.some((item) => item.id === 'material-a1')).toBe(false)
    expect(
      studentLibrary(state, 'student-mateus')!.materials.some((item) => item.id === 'material-a1'),
    ).toBe(true)
  })
  it('inclui sequências além da principal e ordena unidades 2 antes de 10', () => {
    let state = saveBook(
      createDemo(now),
      { title: 'Another sequence', levels: ['A1'] },
      undefined,
      now,
    )
    const book = state.books.at(-1)!
    for (const lessonNumber of [10, 2])
      state = saveMaterial(
        state,
        {
          title: lessonNumber === 2 ? 'Z topic' : 'A topic',
          level: 'A1',
          bookId: book.id,
          lessonNumber,
          content: 'Unused content',
        },
        undefined,
        now,
      )
    const view = studentLibrary(state, 'student-sofia')!
    expect(
      view.materials.filter((item) => item.sequenceId === book.id).map((item) => item.lessonNumber),
    ).toEqual([2, 10])
    expect(view.sequences).toHaveLength(2)
    expect(view.primary).toMatchObject({ status: 'current', currentItemId: 'material-a1' })
  })
  it('retoma unidade longa, avança após conclusão e indica fim sem concluir unidades omitidas', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-2',
      { ...input, usedMaterialId: 'material-a1-3' },
      now,
    )
    expect(studentLibrary(state, 'student-sofia')!.primary).toMatchObject({
      status: 'current',
      currentItemId: 'material-a1-3',
    })
    state = saveLessonRecord(
      state,
      'lesson-6',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: true },
      now,
    )
    expect(studentLibrary(state, 'student-sofia')!.primary).toMatchObject({
      status: 'current',
      currentItemId: 'material-a1-4',
    })
    state.lessons.push({
      id: 'last',
      studentId: 'student-sofia',
      date: '2026-10-23',
      hour: 7,
      createdAt: now.toISOString(),
    })
    state = saveLessonRecord(
      state,
      'last',
      { ...input, usedMaterialId: 'material-a1-4', courseCompleted: true },
      now,
    )
    const view = studentLibrary(state, 'student-sofia')!
    expect(view.primary).toMatchObject({ status: 'finished', currentItemId: null })
    expect(view.materials.some((item) => item.id === 'material-a1-2')).toBe(true)
    expect(state.records.some((record) => record.materialSnapshot?.id === 'material-a1-2')).toBe(
      false,
    )
    expect(studentLibrary(state, 'student-lara')!.primary.status).toBe('unassigned')
  })
  it('após promoção, retira catálogo anterior mas mantém a cópia usada no histórico', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-2',
      { ...input, usedMaterialId: 'material-a1-3', homework: 'Private classroom task' },
      now,
    )
    const student = state.students.find((item) => item.id === 'student-sofia')!
    state = saveStudent(state, { ...student, level: 'A2' }, student.id, now)
    const view = studentLibrary(state, student.id)!
    expect(view.materials.map((item) => item.id)).toEqual(['material-a2'])
    expect(view.primary).toEqual({ status: 'unavailable' })
    expect(JSON.stringify(view)).not.toContain('PRIVATE_CLASS_NOTES')
    expect(JSON.stringify(view)).not.toContain('Private classroom task')
    expect(JSON.stringify(view)).not.toContain('Sequência A1')
    const history = studentOverview(state, student.id, now)!.history
    expect(history[0].level).toBe('A1')
    expect(history[0].materialSnapshot?.title).toBe('Around the neighborhood')
  })
  it('distingue principal ausente, vazio e continuidade indisponível', () => {
    let state = saveBook(
      createDemo(now),
      { title: 'Empty sequence', levels: ['A2'] },
      undefined,
      now,
    )
    state = saveStudent(
      state,
      { ...state.students[0], primaryBookId: state.books.at(-1)!.id },
      'student-lara',
      now,
    )
    expect(studentLibrary(state, 'student-lara')!.primary).toMatchObject({
      status: 'empty',
      title: 'Empty sequence',
    })
    state = saveLessonRecord(
      state,
      'lesson-2',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: true },
      now,
    )
    state = saveBook(state, { title: 'Alternative', levels: ['A1'] }, undefined, now)
    const fourth = state.materials.find((item) => item.id === 'material-a1-4')!
    state = saveMaterial(state, { ...fourth, bookId: state.books.at(-1)!.id }, fourth.id, now)
    expect(studentLibrary(state, 'student-sofia')!.primary).toEqual({ status: 'unavailable' })
    const empty = { ...state, materials: [] }
    expect(studentLibrary(empty, 'student-lara')!.materials).toEqual([])
  })
  it('não modifica a base e entrega cópias dos níveis e metadados', () => {
    const state = createDemo(now)
    const before = structuredClone(state)
    const view = studentLibrary(state, 'student-sofia')!
    view.materials[0].content = 'Changed preview'
    view.materials[0].levels.push('C2')
    view.sequences[0].levels.push('C2')
    if ('title' in view.primary) view.primary.title = 'Changed preview title'
    expect(state).toEqual(before)
  })
})
