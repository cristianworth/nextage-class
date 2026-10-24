import { describe, expect, it } from 'vitest'
import { createDemo } from '../domain/demo'
import { addBlock, rescheduleLesson, scheduleWeekly } from '../domain/weekly-scheduling'
import { occurrenceAt } from '../domain/recurrence'
import { saveLessonRecord } from '../domain/records'
import { saveLessonPlan } from '../domain/preparation'
import { loadWorkspace, saveWorkspace, STORAGE_KEY } from './workspace-storage'

function memoryStorage(initial?: string) {
  const entries = new Map<string, string>(initial === undefined ? [] : [[STORAGE_KEY, initial]])
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
  }
}
const now = new Date('2026-10-23T15:00:00Z')

describe('persistência da demo', () => {
  it('migra v3 sem presumir ordem ou conclusão e preserva cópias, homework e plano', () => {
    let state = createDemo(now)
    state.materials = state.materials.map(({ lessonNumber: _number, ...material }) => material)
    state = saveLessonRecord(
      state,
      'lesson-0',
      {
        attendance: 'attended',
        level: 'A2',
        material: '',
        content: 'Texto anterior',
        reason: '',
        usedMaterialId: 'material-a2',
        homework: 'Tarefa anterior',
      },
      now,
    )
    state = saveLessonPlan(
      state,
      'lesson-9',
      { materialId: 'material-b1', notes: 'Planejado' },
      now,
    )
    const legacy = { ...state, version: 3 }
    const raw = JSON.stringify(legacy)
    const storage = memoryStorage(raw)
    const migrated = loadWorkspace(storage, now).state!
    expect(migrated).toEqual({ ...legacy, version: 4 })
    expect(migrated.materials.every((material) => material.lessonNumber === undefined)).toBe(true)
    expect(migrated.records.every((record) => !record.courseProgress)).toBe(true)
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    saveWorkspace(storage, migrated)
    expect(loadWorkspace(storage, now).state).toEqual(migrated)
  })
  it('migra v1 sem gravar durante a leitura e conserva histórico na próxima gravação', () => {
    const {
      series: _series,
      blocks: _blocks,
      materials: _materials,
      plans: _plans,
      ...data
    } = createDemo(now)
    const legacy = { ...data, version: 1 }
    const raw = JSON.stringify(legacy)
    const storage = memoryStorage(raw)
    const migrated = loadWorkspace(storage, now).state!
    expect(migrated).toEqual({
      ...legacy,
      version: 4,
      series: [],
      blocks: [],
      materials: [],
      plans: [],
    })
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    saveWorkspace(storage, migrated)
    expect(loadWorkspace(storage, now).state).toEqual(migrated)
  })
  it('oferece exemplos sem modificar armazenamento ausente', () => {
    const storage = memoryStorage()
    expect(loadWorkspace(storage, now).state?.students).toHaveLength(4)
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
  })
  it('migra v2 com série, bloqueio e remarcação sem alterar agenda ou gravar ao ler', () => {
    let state = scheduleWeekly(
      createDemo(now),
      { studentId: 'student-lara', date: '2026-10-27', hour: 8, endDate: null },
      now,
    )
    state = addBlock(
      state,
      {
        date: '2026-10-26',
        startHour: 7,
        endHour: 8,
        repeat: 'weekly',
        endDate: null,
        title: 'Pausa',
      },
      now,
    )
    state = rescheduleLesson(
      state,
      occurrenceAt(state.series[0], 0)!.id,
      { date: '2026-10-29', hour: 11 },
      'single',
      now,
    )
    const { materials: _materials, plans: _plans, ...data } = state
    const raw = JSON.stringify({ ...data, version: 2 })
    const storage = memoryStorage(raw)
    const migrated = loadWorkspace(storage, now).state!
    expect(migrated).toEqual({ ...data, version: 4, materials: [], plans: [] })
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    saveWorkspace(storage, migrated)
    expect(loadWorkspace(storage, now).state).toEqual(migrated)
  })
  it('recusa plano órfão e versões desconhecidas sem sobrescrever dados brutos', () => {
    const state = createDemo(now)
    for (const data of [
      { ...state, version: 99 },
      {
        ...state,
        plans: [
          {
            lessonId: 'missing',
            materialId: 'material-a2',
            notes: '',
            updatedAt: now.toISOString(),
          },
        ],
      },
    ]) {
      const raw = JSON.stringify(data)
      const storage = memoryStorage(raw)
      expect(loadWorkspace(storage, now).state).toBeNull()
      expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    }
  })
  it('preserva estado válido em uma nova leitura', () => {
    const storage = memoryStorage()
    const state = createDemo(now)
    saveWorkspace(storage, state)
    expect(loadWorkspace(storage, now)).toEqual({ state, error: null })
  })
  it('preserva dados brutos quando séries salvas possuem conflito', () => {
    let state = createDemo(now)
    state = scheduleWeekly(
      state,
      { studentId: state.students[0].id, date: '2026-10-27', hour: 8, endDate: null },
      now,
    )
    state.series.push({ ...state.series[0], id: 'conflicting-series' })
    const raw = JSON.stringify(state)
    const storage = memoryStorage(raw)
    expect(loadWorkspace(storage, now).state).toBeNull()
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
  })
  it.each(['{invalid', '{"version":2}', '{"version":1,"students":[]}'])(
    'preserva o valor inválido %s',
    (raw) => {
      const storage = memoryStorage(raw)
      expect(loadWorkspace(storage, now).state).toBeNull()
      expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    },
  )
  it('recusa referências órfãs e registros duplicados', () => {
    const state = createDemo(now)
    state.records.push({ ...state.records[0], id: 'another-record' })
    expect(loadWorkspace(memoryStorage(JSON.stringify(state)), now).state).toBeNull()
  })
  it('informa falha de leitura', () => {
    expect(
      loadWorkspace(
        {
          getItem() {
            throw new Error('blocked')
          },
          setItem() {},
        },
        now,
      ).state,
    ).toBeNull()
  })
  it('informa falha de gravação sem modificar o estado recebido', () => {
    const state = createDemo(now)
    const before = structuredClone(state)
    expect(() =>
      saveWorkspace(
        {
          getItem: () => null,
          setItem() {
            throw new Error('quota')
          },
        },
        state,
      ),
    ).toThrow('não conseguiu salvar')
    expect(state).toEqual(before)
  })
})
