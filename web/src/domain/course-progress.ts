import type { CourseReference, Lesson, MaterialSnapshot, Workspace } from './models'
import { findLesson } from './agenda'
import { compareMaterials } from './materials'

export function courseReference(
  material: Pick<MaterialSnapshot, 'id' | 'title' | 'level' | 'lessonNumber'>,
): CourseReference {
  if (!material.lessonNumber) throw new Error('Escolha uma unidade numerada do material.')
  return {
    id: material.id,
    title: material.title,
    level: material.level,
    lessonNumber: material.lessonNumber,
  }
}

export function nextCourseMaterial(
  state: Workspace,
  used: Pick<MaterialSnapshot, 'level' | 'lessonNumber'>,
) {
  return state.materials
    .filter(
      (material) =>
        material.level === used.level &&
        material.lessonNumber !== undefined &&
        material.lessonNumber > (used.lessonNumber ?? Infinity),
    )
    .sort(compareMaterials)[0]
}

export function courseSuggestion(
  state: Workspace,
  studentId: string,
  level: MaterialSnapshot['level'],
  before?: Lesson,
) {
  const latest = state.records
    .filter(
      (record) =>
        record.attendance === 'attended' &&
        record.courseProgress &&
        record.materialSnapshot?.level === level,
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
  if (!latest?.courseProgress) {
    return {
      material: state.materials
        .filter((material) => material.level === level && material.lessonNumber !== undefined)
        .sort(compareMaterials)[0],
      finished: false,
      unavailable: false,
    }
  }
  const progress = latest.courseProgress
  if (!progress.next) {
    const material = nextCourseMaterial(state, latest.materialSnapshot!)
    return { material, finished: !material, unavailable: false }
  }
  const material = state.materials.find(
    (material) =>
      material.id === progress.next!.id &&
      material.level === level &&
      material.lessonNumber !== undefined,
  )
  return { material, finished: false, unavailable: !material }
}
