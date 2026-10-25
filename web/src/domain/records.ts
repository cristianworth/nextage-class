import { hasLessonEnded } from './dates'
import { recordSubmissionSchema } from './models'
import type { RecordSubmission, Workspace } from './models'
import { snapshotMaterial, materialLevels } from './materials'
import { courseReference, nextCourseMaterial } from './course-progress'
import { ensureMaterialized, findLesson } from './agenda'

export function saveLessonRecord(
  state: Workspace,
  lessonId: string,
  input: RecordSubmission,
  now = new Date(),
): Workspace {
  const lesson = findLesson(state, lessonId)
  if (!lesson) throw new Error('Esta aula não foi encontrada.')
  if (!hasLessonEnded(lesson.date, lesson.hour, now))
    throw new Error('Você pode lançar a aula somente após seu término, no horário de Brasília.')
  const {
    usedMaterialId,
    homework: description,
    courseCompleted,
    ...submitted
  } = recordSubmissionSchema.parse(input)
  const student = state.students.find((item) => item.id === lesson.studentId)
  if (!student) throw new Error('O aluno desta aula não foi encontrado.')
  const previous = state.records.find((record) => record.lessonId === lessonId)
  const values = { ...submitted, level: previous?.level ?? student.level }
  let materialSnapshot = usedMaterialId === undefined ? previous?.materialSnapshot : undefined
  if (usedMaterialId) {
    const material = state.materials.find((item) => item.id === usedMaterialId)
    if (!material) throw new Error('O material selecionado não foi encontrado.')
    if (!materialLevels(material, state.books).includes(values.level))
      throw new Error(`Selecione um conteúdo compatível com o nível ${values.level}.`)
    materialSnapshot = snapshotMaterial(material, state.books, values.level)
  }
  const homework =
    description === undefined
      ? previous?.homework
      : description
        ? {
            description,
            correctedAt:
              description === previous?.homework?.description
                ? previous.homework.correctedAt
                : null,
          }
        : undefined
  let courseProgress =
    values.attendance === 'attended' &&
    materialSnapshot?.bookId &&
    materialSnapshot.lessonNumber &&
    materialSnapshot.level === values.level
      ? previous?.courseProgress
      : undefined
  if (
    values.attendance === 'attended' &&
    materialSnapshot?.bookId &&
    materialSnapshot.lessonNumber &&
    materialSnapshot.level === values.level
  ) {
    if (
      usedMaterialId !== undefined ||
      (courseCompleted !== undefined && courseCompleted !== previous?.courseProgress?.completed)
    ) {
      const completed = courseCompleted ?? false
      const next = completed ? nextCourseMaterial(state, materialSnapshot) : materialSnapshot
      courseProgress = { completed, next: next ? courseReference(next) : null }
    }
  }
  const record = {
    ...values,
    material: materialSnapshot?.title ?? values.material,
    materialSnapshot,
    homework,
    courseProgress,
    reason: values.attendance === 'attended' ? '' : values.reason,
    id: previous?.id ?? crypto.randomUUID(),
    lessonId,
    studentName: previous?.studentName ?? student.name,
    createdAt: previous?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  }
  return {
    ...ensureMaterialized(state, lesson),
    records: previous
      ? state.records.map((item) => (item.id === record.id ? record : item))
      : [...state.records, record],
  }
}
