import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { saveBook } from './books'
import { saveMaterial, materialsForLevel } from './materials'
import { saveStudent } from './students'
import { saveLessonRecord } from './records'
import { courseSuggestion } from './course-progress'
import { setHomeworkCorrected } from './homework'
import { workspaceSchema } from './models'
import type { Workspace } from './models'
import { migrateCatalog } from './catalog-migration'
import { loadWorkspace, saveWorkspace, STORAGE_KEY } from '../data/workspace-storage'

const now = new Date('2026-10-23T15:00:00Z')
const record = {
  attendance: 'attended' as const,
  level: 'A1' as const,
  material: '',
  content: 'Conteúdo estudado',
  reason: '',
}
function fixture(): Workspace {
  return { ...createDemo(now), records: [] }
}
function shared() {
  const state = fixture()
  return saveBook(state, { title: 'Shared book', levels: ['A1', 'A2'] }, state.books[0].id, now)
}

describe('livros e principal', () => {
  it('migração mantém o livro histórico mesmo se o catálogo tiver mudado de nível', () => {
    const state = saveLessonRecord(
      fixture(),
      'lesson-2',
      { ...record, usedMaterialId: 'material-a1-3' },
      now,
    )
    const { books: _books, ...data } = state
    const migrated = migrateCatalog({
      ...data,
      version: 4,
      materials: data.materials.map((item) => ({ ...item, level: 'A2' })),
    })
    expect(migrated.books.some((book) => book.id === 'legacy-book/A1')).toBe(true)
    expect(migrated.students.find((student) => student.id === 'student-sofia')?.primaryBookId).toBe(
      'legacy-book/A1',
    )
    expect(courseSuggestion(migrated, 'student-sofia', 'A1')).toMatchObject({
      material: undefined,
      unavailable: true,
    })
    expect(workspaceSchema.safeParse(migrated).success).toBe(true)
  })
  it('exige título/níveis, número único por livro e permite unidade repetida em outro livro', () => {
    let state = shared()
    expect(() => saveBook(state, { title: '', levels: [] })).toThrow()
    expect(() => saveBook(state, { title: 'Invalid', levels: ['A1', 'A1'] })).toThrow()
    state = saveBook(state, { title: 'Second book', levels: ['A1'] }, undefined, now)
    const unit = { title: 'Unit', content: 'Text', level: 'A1' as const, lessonNumber: 1 }
    expect(() => saveMaterial(state, { ...unit, bookId: state.books[0].id })).toThrow('Já existe')
    state = saveMaterial(state, { ...unit, bookId: state.books[1].id }, undefined, now)
    expect(state.materials.filter((item) => item.lessonNumber === 1)).toHaveLength(2)
    expect(() => saveMaterial(state, unit)).toThrow('sequência e número')
    expect(workspaceSchema.safeParse(state).success).toBe(true)
  })
  it('herda níveis do livro sem duplicar conteúdo e aceita apoio com vários níveis', () => {
    let state = shared()
    const first = state.materials[0].id
    expect(
      materialsForLevel(state.materials, 'A2', state.books).some((item) => item.id === first),
    ).toBe(true)
    state = saveMaterial(
      state,
      { title: 'Extra practice', content: 'Text', level: 'A1', levels: ['A1', 'B1'] },
      undefined,
      now,
    )
    const support = state.materials.at(-1)!
    expect(materialsForLevel(state.materials, 'B1', state.books)).toContain(support)
    expect(materialsForLevel(state.materials, 'A2', state.books)).not.toContain(support)
    expect(state.materials.filter((item) => item.id === first)).toHaveLength(1)
  })
  it('retoma cada livro e apoio não altera o progresso principal', () => {
    let state = saveLessonRecord(
      shared(),
      'lesson-2',
      { ...record, usedMaterialId: 'material-a1-3' },
      now,
    )
    const first = state.books[0].id
    state = saveBook(state, { title: 'Second book', levels: ['A1'] }, undefined, now)
    const second = state.books[1].id
    state = saveMaterial(
      state,
      { title: 'Different unit', level: 'A1', content: 'Text', bookId: second, lessonNumber: 1 },
      undefined,
      now,
    )
    let student = state.students.find((item) => item.id === 'student-sofia')!
    state = saveStudent(state, { ...student, primaryBookId: second }, student.id, now)
    expect(courseSuggestion(state, student.id, 'A1').material?.title).toBe('Different unit')
    state = saveLessonRecord(
      state,
      'lesson-6',
      { ...record, usedMaterialId: state.materials.at(-1)!.id, courseCompleted: true },
      now,
    )
    student = state.students.find((item) => item.id === student.id)!
    state = saveStudent(state, { ...student, primaryBookId: first }, student.id, now)
    expect(courseSuggestion(state, student.id, 'A1').material?.id).toBe('material-a1-3')
    state = saveMaterial(state, { title: 'Support', level: 'A1', content: 'Text' }, undefined, now)
    state.lessons.push({
      id: 'extra',
      studentId: student.id,
      date: '2026-10-23',
      hour: 7,
      createdAt: now.toISOString(),
    })
    state = saveLessonRecord(
      state,
      'extra',
      { ...record, usedMaterialId: state.materials.at(-1)!.id },
      now,
    )
    expect(courseSuggestion(state, student.id, 'A1').material?.id).toBe('material-a1-3')
    expect(state.records.at(-1)?.courseProgress).toBeUndefined()
    state = saveStudent(state, { ...student, primaryBookId: second }, student.id, now)
    expect(courseSuggestion(state, student.id, 'A1').finished).toBe(true)
  })
  it('promover nível em livro compartilhado preserva continuidade, nível histórico e nome do livro', () => {
    let state = saveLessonRecord(
      shared(),
      'lesson-2',
      { ...record, usedMaterialId: 'material-a1-3', courseCompleted: true },
      now,
    )
    const original = structuredClone(state.records[0])
    const student = state.students.find((item) => item.id === 'student-sofia')!
    state = saveStudent(state, { ...student, level: 'A2' }, student.id, now)
    state = saveBook(state, { title: 'Renamed', levels: ['A1', 'A2'] }, state.books[0].id, now)
    expect(courseSuggestion(state, student.id, 'A2').material?.id).toBe('material-a1-4')
    state = saveLessonRecord(state, 'lesson-2', { ...record, content: 'Correção de texto' }, now)
    expect(state.records[0].materialSnapshot).toEqual(original.materialSnapshot)
    expect(state.records[0].courseProgress).toEqual(original.courseProgress)
    state = saveLessonRecord(state, 'lesson-6', { ...record, usedMaterialId: 'material-a1-4' }, now)
    expect(state.records[1].level).toBe('A2')
    expect(state.records[1].materialSnapshot?.bookTitle).toBe('Renamed')
    expect(workspaceSchema.safeParse(state).success).toBe(true)
  })
  it('indica principal incompatível sem apagar o vínculo e rejeita novas escolhas', () => {
    let state = fixture()
    const student = state.students.find((item) => item.id === 'student-sofia')!
    state = saveStudent(state, { ...student, level: 'C1' }, student.id, now)
    expect(state.students.find((item) => item.id === student.id)?.primaryBookId).toBe(
      student.primaryBookId,
    )
    expect(courseSuggestion(state, student.id, 'C1')).toMatchObject({
      material: undefined,
      unavailable: true,
    })
    expect(() =>
      saveLessonRecord(state, 'lesson-2', { ...record, usedMaterialId: 'material-a1' }, now),
    ).toThrow('nível C1')
    const lara = state.students[0]
    expect(() =>
      saveStudent(state, { ...lara, primaryBookId: student.primaryBookId }, lara.id, now),
    ).toThrow('compatível')
  })
  it('recusa referências órfãs e progresso que atravessa livros no armazenamento', () => {
    const state = shared()
    state.materials[0].bookId = 'missing'
    expect(workspaceSchema.safeParse(state).success).toBe(false)
    const recorded = saveLessonRecord(
      shared(),
      'lesson-2',
      { ...record, usedMaterialId: 'material-a1-3' },
      now,
    )
    recorded.records[0].courseProgress!.next!.bookId = 'other'
    expect(workspaceSchema.safeParse(recorded).success).toBe(false)
  })
  it('migra v4 com continuidade e homework corrigido sem gravar na leitura', () => {
    let state = saveLessonRecord(
      fixture(),
      'lesson-2',
      { ...record, usedMaterialId: 'material-a1-3', homework: 'Practice' },
      now,
    )
    state = setHomeworkCorrected(state, state.records[0].id, true, now)
    const { books: _books, ...data } = state
    const stripBook = <T extends { bookId?: string; bookTitle?: string }>(item: T) => {
      const { bookId: _id, bookTitle: _title, ...rest } = item
      return rest
    }
    const old = {
      ...data,
      version: 4,
      materials: data.materials.map(stripBook),
      records: data.records.map((item) => ({
        ...item,
        materialSnapshot: stripBook(item.materialSnapshot!),
        courseProgress: { ...item.courseProgress!, next: stripBook(item.courseProgress!.next!) },
      })),
    }
    let raw = JSON.stringify(old)
    const original = raw
    const storage = {
      getItem: (_key: string) => raw,
      setItem: (_key: string, value: string) => {
        raw = value
      },
    }
    const result = loadWorkspace(storage, now)
    expect(result.error).toBeNull()
    expect(raw).toBe(original)
    const migrated = result.state!
    expect(migrated.version).toBe(5)
    expect(courseSuggestion(migrated, 'student-sofia', 'A1').material?.id).toBe('material-a1-3')
    expect(migrated.records[0].homework).toEqual(state.records[0].homework)
    expect(migrated.lessons).toEqual(state.lessons)
    saveWorkspace(storage, migrated)
    expect(loadWorkspace(storage, now).state).toEqual(migrated)
    const corrupt = JSON.stringify({ ...migrated, books: [] })
    raw = corrupt
    expect(loadWorkspace(storage, now).state).toBeNull()
    expect(raw).toBe(corrupt)
    expect(STORAGE_KEY).toBe('nextage-class:workspace:v1')
  })
})
