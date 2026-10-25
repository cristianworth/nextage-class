import { courseSuggestion } from './course-progress'
import { materialLevels, materialsForLevel } from './materials'
import type { Workspace } from './models'

export type StudentPrimarySequence =
  | { status: 'unassigned' | 'unavailable' }
  | {
      status: 'current' | 'finished' | 'empty'
      id: string
      title: string
      currentItemId: string | null
    }

export function studentLibrary(state: Workspace, studentId: string) {
  const student = state.students.find((item) => item.id === studentId)
  if (!student) return null
  const sequences = state.books
    .filter((book) => book.levels.includes(student.level))
    .map((book) => ({ id: book.id, title: book.title, levels: [...book.levels] }))
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  const materials = materialsForLevel(state.materials, student.level, state.books).map(
    (material) => ({
      id: material.id,
      title: material.title,
      content: material.content,
      levels: [...materialLevels(material, state.books)],
      sequenceId: material.bookId ?? null,
      sequenceTitle: sequences.find((sequence) => sequence.id === material.bookId)?.title ?? null,
      lessonNumber: material.lessonNumber,
      updatedAt: material.updatedAt,
    }),
  )
  const suggestion = courseSuggestion(state, studentId, student.level)
  const selectedSequence = sequences.find((sequence) => sequence.id === student.primaryBookId)
  const currentItem = materials.find((material) => material.id === suggestion.material?.id)
  let primary: StudentPrimarySequence
  if (!student.primaryBookId) primary = { status: 'unassigned' }
  else if (!selectedSequence || suggestion.unavailable) primary = { status: 'unavailable' }
  else
    primary = {
      status: suggestion.finished ? 'finished' : currentItem ? 'current' : 'empty',
      id: selectedSequence.id,
      title: selectedSequence.title,
      currentItemId: currentItem?.id ?? null,
    }
  return { level: student.level, sequences, materials, primary }
}

export type StudentLibraryView = NonNullable<ReturnType<typeof studentLibrary>>
export type StudentLibraryItem = StudentLibraryView['materials'][number]
