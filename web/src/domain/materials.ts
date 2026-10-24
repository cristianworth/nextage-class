import { materialInputSchema } from './models'
import type { Book, Material, MaterialInput, MaterialSnapshot, Workspace } from './models'

export function saveMaterial(
  state: Workspace,
  input: MaterialInput,
  id?: string,
  now = new Date(),
): Workspace {
  const parsed = materialInputSchema.parse(input)
  const book = parsed.bookId ? state.books.find((item) => item.id === parsed.bookId) : undefined
  if (parsed.bookId && !book) throw new Error('O livro selecionado não foi encontrado.')
  if ((book && parsed.lessonNumber === undefined) || (!book && parsed.lessonNumber !== undefined))
    throw new Error('Uma unidade precisa de livro e número. Para apoio, deixe ambos vazios.')
  const levels = book?.levels ?? parsed.levels ?? [parsed.level]
  if (new Set(levels).size !== levels.length) throw new Error('Não repita níveis no material.')
  const values = { ...parsed, level: levels[0], levels }
  const previous = state.materials.find((material) => material.id === id)
  if (id && !previous) throw new Error('Este material não foi encontrado.')
  if (
    values.lessonNumber !== undefined &&
    state.materials.some(
      (material) =>
        material.id !== id &&
        material.bookId === values.bookId &&
        material.lessonNumber === values.lessonNumber,
    )
  )
    throw new Error(`Já existe a Unidade ${values.lessonNumber} neste livro. Escolha outro número.`)
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

export function snapshotMaterial(
  material: Material,
  books: Book[] = [],
  level = material.level,
): MaterialSnapshot {
  return {
    id: material.id,
    title: material.title,
    level,
    levels: materialLevels(material, books),
    bookId: material.bookId,
    bookTitle: books.find((book) => book.id === material.bookId)?.title,
    content: material.content,
    updatedAt: material.updatedAt,
    lessonNumber: material.lessonNumber,
  }
}

export function compareMaterials(a: Material, b: Material) {
  return (
    (a.bookId ?? '').localeCompare(b.bookId ?? '') ||
    (a.lessonNumber ?? Infinity) - (b.lessonNumber ?? Infinity) ||
    a.title.localeCompare(b.title, 'pt-BR')
  )
}

export function materialLabel(material: Pick<Material, 'title' | 'lessonNumber'>) {
  return material.lessonNumber
    ? `Unidade ${material.lessonNumber} — ${material.title}`
    : material.title
}

export function materialLevels(material: Material, books: Book[] = []) {
  return (
    books.find((book) => book.id === material.bookId)?.levels ?? material.levels ?? [material.level]
  )
}

export function materialsForLevel(
  materials: Material[],
  level: Material['level'],
  books: Book[] = [],
) {
  return materials
    .filter((material) => materialLevels(material, books).includes(level))
    .sort(compareMaterials)
}

export function catalogLabel(
  material: Pick<Material, 'title' | 'lessonNumber' | 'bookId'> & { bookTitle?: string },
  books: Book[] = [],
) {
  const title = material.bookTitle ?? books.find((book) => book.id === material.bookId)?.title
  return title ? `${title} · ${materialLabel(material)}` : materialLabel(material)
}
