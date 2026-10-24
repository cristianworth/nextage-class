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
  if (
    values.lessonNumber !== undefined &&
    state.materials.some(
      (material) =>
        material.id !== id &&
        material.level === values.level &&
        material.lessonNumber === values.lessonNumber,
    )
  )
    throw new Error(
      `Já existe a Unidade ${values.lessonNumber} no nível ${values.level}. Escolha outro número.`,
    )
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
    lessonNumber: material.lessonNumber,
  }
}

export function compareMaterials(a: Material, b: Material) {
  return (
    a.level.localeCompare(b.level) ||
    (a.lessonNumber ?? Infinity) - (b.lessonNumber ?? Infinity) ||
    a.title.localeCompare(b.title, 'pt-BR')
  )
}

export function materialLabel(material: Pick<Material, 'title' | 'lessonNumber'>) {
  return material.lessonNumber
    ? `Unidade ${material.lessonNumber} — ${material.title}`
    : material.title
}

export function materialsForLevel(materials: Material[], level: Material['level']) {
  return materials.filter((material) => material.level === level).sort(compareMaterials)
}
