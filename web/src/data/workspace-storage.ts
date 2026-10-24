import { createDemo } from '../domain/demo'
import { assertAvailable } from '../domain/availability'
import {
  legacyWorkspaceSchema,
  previousWorkspaceSchema,
  pedagogyWorkspaceV3Schema,
  workspaceV4Schema,
  workspaceSchema,
} from '../domain/models'
import type { Workspace } from '../domain/models'
import { migrateCatalog } from '../domain/catalog-migration'

export const STORAGE_KEY = 'nextage-class:workspace:v1'
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>
export type LoadResult = { state: Workspace; error: null } | { state: null; error: string }

export function loadWorkspace(storage: StoragePort, now = new Date()): LoadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return { state: createDemo(now), error: null }
    const value: unknown = JSON.parse(raw)
    const legacy = legacyWorkspaceSchema.safeParse(value)
    const previous = previousWorkspaceSchema.safeParse(value)
    const pedagogy = pedagogyWorkspaceV3Schema.safeParse(value)
    const upgraded = legacy.success
      ? { ...legacy.data, series: [], blocks: [] }
      : previous.success
        ? previous.data
        : null
    const current = upgraded
      ? { ...upgraded, version: 4, materials: [], plans: [] }
      : pedagogy.success
        ? { ...pedagogy.data, version: 4 }
        : value
    const v4 = workspaceV4Schema.safeParse(current)
    const state = workspaceSchema.parse(v4.success ? migrateCatalog(v4.data) : current)
    assertAvailable(state)
    return { state, error: null }
  } catch {
    return {
      state: null,
      error:
        'Não foi possível ler os dados locais. Eles foram preservados. Confira o armazenamento do navegador ou reinicie a demo para voltar aos exemplos.',
    }
  }
}

export function saveWorkspace(storage: StoragePort, state: Workspace) {
  const validState = workspaceSchema.parse(state)
  assertAvailable(validState)
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(validState))
  } catch {
    throw new Error(
      'O navegador não conseguiu salvar. Seus dados anteriores foram mantidos. Libere espaço ou permita o armazenamento e tente novamente.',
    )
  }
}

export function loadBrowserWorkspace(): LoadResult {
  try {
    return loadWorkspace(window.localStorage)
  } catch {
    return {
      state: null,
      error:
        'O armazenamento deste navegador está indisponível. Permita o armazenamento local para usar a demo.',
    }
  }
}
