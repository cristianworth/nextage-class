import { z } from 'zod'
import { createPublicDemo } from '../domain/public-demo'
import { assertAvailable } from '../domain/availability'
import { workspaceSchema } from '../domain/models'
import type { Workspace } from '../domain/models'
import type { LoadResult, StoragePort } from './workspace-storage'

export const PUBLIC_STORAGE_KEY = 'nextage-class:public-demo:v1'

const publicEnvelopeSchema = z.object({
  version: z.literal(1),
  createdAt: z.iso.datetime(),
  workspace: workspaceSchema,
})

export function savePublicWorkspace(storage: StoragePort, state: Workspace, createdAt: string) {
  const envelope = publicEnvelopeSchema.parse({ version: 1, createdAt, workspace: state })
  assertAvailable(envelope.workspace)
  try {
    storage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    throw new Error(
      'O navegador não conseguiu salvar. Seus dados anteriores foram mantidos. Libere espaço ou permita o armazenamento e tente novamente.',
    )
  }
}

export function loadPublicWorkspace(storage: StoragePort, now = new Date()): LoadResult {
  try {
    const raw = storage.getItem(PUBLIC_STORAGE_KEY)
    if (raw === null) {
      const state = createPublicDemo(now)
      const demoCreatedAt = now.toISOString()
      savePublicWorkspace(storage, state, demoCreatedAt)
      return { state, error: null, demoCreatedAt }
    }
    const envelope = publicEnvelopeSchema.parse(JSON.parse(raw))
    assertAvailable(envelope.workspace)
    return { state: envelope.workspace, error: null, demoCreatedAt: envelope.createdAt }
  } catch (cause) {
    return {
      state: null,
      error:
        cause instanceof Error && cause.message.startsWith('O navegador não conseguiu salvar')
          ? cause.message
          : 'Não foi possível ler os exemplos salvos. Eles foram preservados. Permita o armazenamento ou reinicie a demo para restaurar os exemplos.',
    }
  }
}
