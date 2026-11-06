import { describe, expect, it } from 'vitest'
import { createDemo } from '../../domain/demo'
import { saveLessonRecord } from '../../domain/records'
import { pilotCourseSuggestion } from './pilot-course-progress'
import type { PilotRecord } from './TeacherRecords'
import { pilotRecordsSchema } from './TeacherRecords'
import type { Workspace } from '../../domain/models'

describe('continuidade conectada do piloto', () => {
  it('aceita cópia histórica com horário UTC expresso por deslocamento', () => {
    const now = new Date('2026-10-23T15:00:00Z')
    const state = createDemo(now)
    const snapshot = { ...state.materials[0], updatedAt: '2026-10-23T15:00:00+00:00' }
    const input = [
      {
        id: 'record',
        lessonId: state.lessons[0].id,
        studentName: 'Aluno',
        level: snapshot.level,
        attendance: 'attended',
        content: 'Conteúdo',
        reason: '',
        materialSnapshot: snapshot,
        homework: null,
        courseProgress: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        lesson: state.lessons[0],
      },
    ]
    expect(pilotRecordsSchema.parse(input)[0].materialSnapshot?.updatedAt).toBe(snapshot.updatedAt)
  })
  it('segue a cronologia, isola o aluno e preserva o resultado posterior ao editar o passado', () => {
    const now = new Date('2026-10-23T15:00:00Z')
    let state: Workspace = {
      ...createDemo(now),
      records: [],
      lessons: ['2026-10-19', '2026-10-20', '2026-10-21'].map((date, index) => ({
        id: `meeting-${index}`,
        studentId: 'student-sofia',
        date,
        hour: 10,
        createdAt: now.toISOString(),
      })),
    }
    const input = {
      attendance: 'attended' as const,
      level: 'A1' as const,
      material: '',
      content: 'Estudado',
      reason: '',
    }
    state = saveLessonRecord(
      state,
      'meeting-0',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: false },
      now,
    )
    state = saveLessonRecord(
      state,
      'meeting-1',
      { ...input, usedMaterialId: 'material-a1-3', courseCompleted: true },
      now,
    )
    state = saveLessonRecord(state, 'meeting-0', { ...input, content: 'Correção antiga' }, now)
    const records: PilotRecord[] = state.records.map((record) => ({
      ...record,
      lesson: state.lessons.find((lesson) => lesson.id === record.lessonId)!,
      materialSnapshot: record.materialSnapshot ?? null,
      homework: record.homework ?? null,
      courseProgress: record.courseProgress ?? null,
    }))
    const student = state.students.find((item) => item.id === 'student-sofia')!
    expect(
      pilotCourseSuggestion(student, state.books, state.materials, records).material?.lessonNumber,
    ).toBe(4)
    expect(
      pilotCourseSuggestion(student, state.books, state.materials, records, state.lessons[1])
        .material?.lessonNumber,
    ).toBe(3)
    expect(
      pilotCourseSuggestion(student, state.books, state.materials, records, state.lessons[0])
        .material?.lessonNumber,
    ).toBe(1)
    const other = { ...student, id: 'other' }
    expect(
      pilotCourseSuggestion(other, state.books, state.materials, records).material?.lessonNumber,
    ).toBe(1)
  })
})
