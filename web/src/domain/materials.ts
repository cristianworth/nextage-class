import { materialInputSchema } from './models'
import type { Material, MaterialInput, MaterialSnapshot, Workspace } from './models'

export function saveMaterial(
  state: Workspace,
  input: MaterialInput,
  id?: string,
  now = new Date(),
): Workspace {
  const values = materialInputSchema.parse(input)
  const previous = state.materials.find((material) => material.id === id)
  if (id && !previous) throw new Error('Este material não foi encontrado.')
  const material = {
    ...values,
    id: previous?.id ?? crypto.randomUUID(),
    createdAt: previous?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  }
  return {
    ...state,
    materials: previous
      ? state.materials.map((item) => (item.id === id ? material : item))
      : [...state.materials, material],
  }
}

export function snapshotMaterial(material: Material): MaterialSnapshot {
  return {
    id: material.id,
    title: material.title,
    level: material.level,
    content: material.content,
    updatedAt: material.updatedAt,
  }
}
