import type { CourseReference, Lesson, MaterialSnapshot, Workspace } from './models'
import { findLesson } from './agenda'
import { compareMaterials } from './materials'

export function courseReference(
  material: Pick<
    MaterialSnapshot,
    'id' | 'title' | 'level' | 'lessonNumber' | 'bookId' | 'bookTitle'
  >,
): CourseReference {
  if (!material.lessonNumber || !material.bookId)
    throw new Error('Escolha uma unidade numerada de um livro.')
  return {
    id: material.id,
    title: material.title,
    level: material.level,
    lessonNumber: material.lessonNumber,
    bookId: material.bookId,
    bookTitle: material.bookTitle,
  }
}

export function nextCourseMaterial(
  state: Workspace,
  used: Pick<MaterialSnapshot, 'bookId' | 'lessonNumber' | 'level'>,
) {
  if (!used.bookId) return undefined
  const material = state.materials
    .filter(
      (material) =>
        material.bookId === used.bookId &&
        material.lessonNumber !== undefined &&
        material.lessonNumber > (used.lessonNumber ?? Infinity),
    )
    .sort(compareMaterials)[0]
  return material
    ? {
        ...material,
        level: used.level,
        bookTitle: state.books.find((book) => book.id === used.bookId)?.title,
      }
    : undefined
}

export function courseSuggestion(
  state: Workspace,
  studentId: string,
  level: MaterialSnapshot['level'],
  before?: Lesson,
) {
  const student = state.students.find((item) => item.id === studentId)
  const book = state.books.find((item) => item.id === student?.primaryBookId)
  if (!book || !book.levels.includes(level))
    return { material: undefined, finished: false, unavailable: !!student?.primaryBookId, book }
  const latest = state.records
    .filter(
      (record) =>
        record.attendance === 'attended' &&
        record.courseProgress &&
        record.materialSnapshot?.bookId === book.id,
    )
    .map((record) => ({ record, lesson: findLesson(state, record.lessonId)! }))
    .filter(
      ({ lesson }) =>
        lesson.studentId === studentId &&
        (!before ||
          lesson.date < before.date ||
          (lesson.date === before.date && lesson.hour < before.hour)),
    )
    .sort(
      (a, b) => b.lesson.date.localeCompare(a.lesson.date) || b.lesson.hour - a.lesson.hour,
    )[0]?.record
  if (!latest?.courseProgress)
    return {
      material: state.materials
        .filter((material) => material.bookId === book.id && material.lessonNumber !== undefined)
        .sort(compareMaterials)[0],
      finished: false,
      unavailable: false,
      book,
    }
  const progress = latest.courseProgress
  if (!progress.next) {
    const material = nextCourseMaterial(state, latest.materialSnapshot!)
    return { material, finished: !material, unavailable: false, book }
  }
  const material = state.materials.find(
    (material) =>
      material.id === progress.next!.id &&
      material.bookId === book.id &&
      material.lessonNumber !== undefined,
  )
  return { material, finished: false, unavailable: !material, book }
}
