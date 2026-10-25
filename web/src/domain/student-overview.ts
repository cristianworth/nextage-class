import { findLesson, upcomingLessons } from './agenda'
import type { Workspace } from './models'

export function studentOverview(state: Workspace, studentId: string, now = new Date()) {
  const student = state.students.find((item) => item.id === studentId)
  if (!student) return null
  const history = state.records
    .flatMap((record) => {
      const lesson = findLesson(state, record.lessonId)
      if (!lesson || lesson.studentId !== studentId) return []
      const used = record.materialSnapshot
      return [
        {
          id: record.id,
          date: lesson.date,
          hour: lesson.hour,
          attendance: record.attendance,
          level: record.level,
          material: record.material,
          materialSnapshot: used
            ? {
                title: used.title,
                sequenceTitle: used.bookTitle,
                lessonNumber: used.lessonNumber,
                content: used.content,
              }
            : null,
          homework: record.homework
            ? {
                description: record.homework.description,
                correctedAt: record.homework.correctedAt,
              }
            : null,
        },
      ]
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.hour - a.hour)
  return {
    student: { id: student.id, name: student.name, level: student.level },
    meetingUrl: student.meetingUrl ?? '',
    upcoming: upcomingLessons(state, now, studentId, 6).map((lesson) => ({
      id: lesson.id,
      date: lesson.date,
      hour: lesson.hour,
    })),
    history,
    pendingHomework: history.flatMap((entry) =>
      entry.homework && !entry.homework.correctedAt
        ? [{ id: entry.id, date: entry.date, description: entry.homework.description }]
        : [],
    ),
  }
}

export type StudentOverview = NonNullable<ReturnType<typeof studentOverview>>
