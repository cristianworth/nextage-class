import { courseSuggestion } from '../../domain/course-progress'
import type { Book, Lesson, Material, Student } from '../../domain/models'
import type { PilotRecord } from './TeacherRecords'

export function pilotCourseSuggestion(
  student: Pick<Student, 'id' | 'level' | 'primaryBookId'>,
  books: Book[],
  materials: Material[],
  records: PilotRecord[],
  before?: Lesson,
) {
  return courseSuggestion(
    {
      students: [student],
      books,
      materials,
      lessons: records.map((record) => record.lesson),
      series: [],
      records: records.map((record) => ({
        ...record,
        material: record.materialSnapshot?.title ?? '',
        materialSnapshot: record.materialSnapshot ?? undefined,
        homework: record.homework ?? undefined,
        courseProgress: record.courseProgress ?? undefined,
      })),
    },
    student.id,
    student.level,
    before,
  )
}
