import { describe, expect, it } from 'vitest'
import type { Lesson } from '../../domain/models'
import type { PilotRecord } from './TeacherRecords'
import { pendingHomework, previousAttendedRecord } from './pilot-lesson-context'

const lesson = (id: string, studentId: string, date: string, hour: number): Lesson => ({
  id,
  studentId,
  date,
  hour,
  createdAt: '2026-10-01T12:00:00Z',
})
const record = (target: Lesson, attendance: PilotRecord['attendance']): PilotRecord => ({
  id: target.id,
  lessonId: target.id,
  studentName: 'Aluno',
  level: 'A1',
  attendance,
  content: target.id,
  reason: '',
  materialSnapshot: null,
  homework: null,
  courseProgress: null,
  createdAt: target.createdAt,
  updatedAt: target.createdAt,
  lesson: target,
})

describe('contexto anterior no piloto', () => {
  it('escolhe a presença mais recente do mesmo aluno estritamente anterior ao encontro', () => {
    const target = lesson('target', 'student', '2026-11-05', 12)
    const expected = record(lesson('earlier', 'student', target.date, 10), 'attended')
    const records = [
      expected,
      record(lesson('later', 'student', target.date, 13), 'attended'),
      record(lesson('other', 'other', target.date, 11), 'attended'),
      record(lesson('absence', 'student', target.date, 11), 'student-absent'),
      record(lesson('old', 'student', '2026-11-04', 18), 'attended'),
      record(target, 'attended'),
    ]
    expect(previousAttendedRecord(records, target)).toBe(expected)
  })

  it('não retorna falta ou aula futura quando não há presença anterior', () => {
    const target = lesson('target', 'student', '2026-11-05', 12)
    expect(
      previousAttendedRecord(
        [
          record(lesson('absence', 'student', '2026-11-04', 10), 'teacher-absent'),
          record(lesson('future', 'student', '2026-11-06', 10), 'attended'),
        ],
        target,
      ),
    ).toBeUndefined()
  })

  it('mostra somente tarefas pendentes anteriores do aluno da ocorrência', () => {
    const target = lesson('target', 'student', '2026-11-05', 12)
    const pending = {
      ...record(lesson('pending', 'student', target.date, 10), 'attended'),
      homework: { description: 'Praticar', correctedAt: null },
    }
    const corrected = {
      ...record(lesson('corrected', 'student', target.date, 9), 'attended'),
      homework: { description: 'Feito', correctedAt: '2026-11-05T12:00:00Z' },
    }
    const future = {
      ...record(lesson('future', 'student', target.date, 13), 'attended'),
      homework: { description: 'Depois', correctedAt: null },
    }
    const other = {
      ...record(lesson('other', 'other', target.date, 11), 'attended'),
      homework: { description: 'Outro aluno', correctedAt: null },
    }
    expect(pendingHomework([corrected, future, other, pending], target)).toEqual([pending])
  })
})
