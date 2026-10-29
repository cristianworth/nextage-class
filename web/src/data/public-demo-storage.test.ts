import { describe, expect, it } from 'vitest'
import { loadPublicWorkspace, PUBLIC_STORAGE_KEY, savePublicWorkspace } from './public-demo-storage'
import { STORAGE_KEY } from './workspace-storage'

const now = new Date('2026-10-29T15:00:00Z')

function memoryStorage() {
  const entries = new Map([[STORAGE_KEY, 'previous-local-data']])
  return {
    entries,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
  }
}

describe('public demonstration storage', () => {
  it('persists the first examples without reading or replacing the previous local workspace', () => {
    const storage = memoryStorage()
    const first = loadPublicWorkspace(storage, now)
    expect(first.state?.students.length).toBeGreaterThan(0)
    expect(first.demoCreatedAt).toBe(now.toISOString())
    expect(storage.getItem(STORAGE_KEY)).toBe('previous-local-data')
    expect(JSON.parse(storage.getItem(PUBLIC_STORAGE_KEY)!)).toMatchObject({
      version: 1,
      createdAt: now.toISOString(),
      workspace: first.state,
    })
  })

  it('preserves edited examples and their original dates on a later visit', () => {
    const storage = memoryStorage()
    const first = loadPublicWorkspace(storage, now)
    const edited = {
      ...first.state!,
      students: first.state!.students.map((student) => ({
        ...student,
        name: `${student.name} Demo`,
      })),
    }
    savePublicWorkspace(storage, edited, first.demoCreatedAt!)
    const reloaded = loadPublicWorkspace(storage, new Date('2027-02-15T15:00:00Z'))
    expect(reloaded.state).toEqual(edited)
    expect(reloaded.demoCreatedAt).toBe(first.demoCreatedAt)
    expect(storage.getItem(STORAGE_KEY)).toBe('previous-local-data')
  })

  it.each(['not json', '{"version":2}', '{"version":1,"createdAt":"invalid"}'])(
    'preserves an unreadable public value instead of resetting it: %s',
    (raw) => {
      const storage = memoryStorage()
      storage.entries.set(PUBLIC_STORAGE_KEY, raw)
      expect(loadPublicWorkspace(storage, now).state).toBeNull()
      expect(storage.getItem(PUBLIC_STORAGE_KEY)).toBe(raw)
      expect(storage.getItem(STORAGE_KEY)).toBe('previous-local-data')
    },
  )

  it('reports a failed save without changing either previous value', () => {
    const storage = memoryStorage()
    const first = loadPublicWorkspace(storage, now)
    const raw = storage.getItem(PUBLIC_STORAGE_KEY)
    const refusing = {
      ...storage,
      setItem: () => {
        throw new Error('Quota exceeded')
      },
    }
    expect(() => savePublicWorkspace(refusing, first.state!, first.demoCreatedAt!)).toThrow(
      'não conseguiu salvar',
    )
    expect(storage.getItem(PUBLIC_STORAGE_KEY)).toBe(raw)
    expect(storage.getItem(STORAGE_KEY)).toBe('previous-local-data')
  })

  it('explains when the browser cannot persist the initial examples', () => {
    const refusing = {
      getItem: () => null,
      setItem: () => {
        throw new Error('Storage denied')
      },
    }
    expect(loadPublicWorkspace(refusing, now)).toMatchObject({
      state: null,
      error: expect.stringContaining('não conseguiu salvar'),
    })
  })
})
