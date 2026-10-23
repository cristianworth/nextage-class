import { describe, expect, it } from 'vitest'
import { createDemo } from '../domain/demo'
import { scheduleWeekly } from '../domain/weekly-scheduling'
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
  it('migra v1 sem gravar durante a leitura e conserva histórico na próxima gravação', () => {
    const { series: _series, blocks: _blocks, ...data } = createDemo(now)
    const legacy = { ...data, version: 1 }
    const raw = JSON.stringify(legacy)
    const storage = memoryStorage(raw)
    const migrated = loadWorkspace(storage, now).state!
    expect(migrated).toEqual({ ...legacy, version: 2, series: [], blocks: [] })
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    saveWorkspace(storage, migrated)
    expect(loadWorkspace(storage, now).state).toEqual(migrated)
  })
  it('oferece exemplos sem modificar armazenamento ausente', () => {
    const storage = memoryStorage()
    expect(loadWorkspace(storage, now).state?.students).toHaveLength(4)
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
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
