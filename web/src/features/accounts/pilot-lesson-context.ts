import type { Lesson } from '../../domain/models'
import type { PilotRecord } from './TeacherRecords'

export function previousAttendedRecord(records: PilotRecord[], target: Lesson) {
  return records
    .filter(
      (record) =>
        record.attendance === 'attended' &&
        record.lesson.studentId === target.studentId &&
        (record.lesson.date < target.date ||
          (record.lesson.date === target.date && record.lesson.hour < target.hour)),
    )
    .sort((a, b) => b.lesson.date.localeCompare(a.lesson.date) || b.lesson.hour - a.lesson.hour)[0]
}

export function pendingHomework(records: PilotRecord[], target: Lesson) {
  return records
    .filter(
      (record) =>
        record.lesson.studentId === target.studentId &&
        !!record.homework &&
        !record.homework.correctedAt &&
        (record.lesson.date < target.date ||
          (record.lesson.date === target.date && record.lesson.hour < target.hour)),
    )
    .sort((a, b) => b.lesson.date.localeCompare(a.lesson.date) || b.lesson.hour - a.lesson.hour)
}
