import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { studentOverview } from './student-overview'
import { saveLessonRecord } from './records'
import { saveLessonPlan } from './preparation'
import { saveMaterial } from './materials'
import { saveStudent } from './students'
import { setHomeworkCorrected } from './homework'
import { scheduleLesson } from './lessons'
import { scheduleWeekly, rescheduleLesson } from './weekly-scheduling'
import { occurrenceAt } from './recurrence'

const now = new Date('2026-10-23T15:00:00Z')
const input = {
  attendance: 'attended' as const,
  level: 'A2' as const,
  material: '',
  content: 'PRIVATE_CLASS_NOTES',
  reason: '',
}

describe('consulta do aluno', () => {
  it('expõe material/homework próprios sem texto reservado, plano ou dados de outro aluno', () => {
    let state = createDemo(now)
    state.students[0] = {
      ...state.students[0],
      phone: 'PRIVATE_PHONE',
      occupation: 'PRIVATE_JOB',
      interests: 'PRIVATE_INTEREST',
      meetingUrl: 'https://meet.example.test/lara',
    }
    state.students[1].meetingUrl = 'https://meet.example.test/other-student'
    state = saveLessonRecord(
      state,
      'lesson-0',
      {
        ...input,
        attendance: 'student-absent',
        reason: 'PRIVATE_ABSENCE',
        usedMaterialId: 'material-a2',
        homework: 'Read the dialogue',
      },
      now,
    )
    state = scheduleLesson(state, { studentId: 'student-lara', date: '2026-10-26', hour: 7 }, now)
    state = saveLessonPlan(
      state,
      state.lessons.at(-1)!.id,
      { materialId: 'material-a2', notes: 'PRIVATE_PLAN' },
      now,
    )
    const view = studentOverview(state, 'student-lara', now)!
    const text = JSON.stringify(view)
    for (const hidden of [
      'PRIVATE_CLASS_NOTES',
      'PRIVATE_PHONE',
      'PRIVATE_JOB',
      'PRIVATE_INTEREST',
      'PRIVATE_ABSENCE',
      'PRIVATE_PLAN',
      'Mateus Costa',
      'other-student',
    ])
      expect(text).not.toContain(hidden)
    expect(Object.keys(view.student).sort()).toEqual(['id', 'level', 'name'])
    expect(Object.keys(view.history[0]).sort()).toEqual([
      'attendance',
      'date',
      'homework',
      'hour',
      'id',
      'level',
      'material',
      'materialSnapshot',
    ])
    expect(view.meetingUrl).toBe('https://meet.example.test/lara')
    expect(view.history[0].homework?.description).toBe('Read the dialogue')
    expect(view.history[0].materialSnapshot?.content).toContain('Plan a two-day trip')
  })
  it('reutiliza ocorrências semanais/remarcadas, sem duplicar ou listar aulas de outro aluno', () => {
    let state = scheduleWeekly(
      createDemo(now),
      { studentId: 'student-lara', date: '2026-10-27', hour: 8, endDate: null },
      now,
    )
    const first = occurrenceAt(state.series[0], 0)!
    state = rescheduleLesson(state, first.id, { date: '2026-10-29', hour: 11 }, 'single', now)
    const view = studentOverview(state, 'student-lara', now)!
    expect(view.upcoming).toHaveLength(6)
    expect(view.upcoming[0]).toEqual({ id: first.id, date: '2026-10-29', hour: 11 })
    expect(view.upcoming.filter((lesson) => lesson.id === first.id)).toHaveLength(1)
    expect(view.upcoming[1].date).toBe('2026-11-03')
    expect(view.upcoming.some((lesson) => lesson.id === 'lesson-9')).toBe(false)
  })
  it('preserva material e nível histórico após edição do acervo e promoção, mostrando correção atual', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, usedMaterialId: 'material-a2', homework: 'Practice' },
      now,
    )
    const original = structuredClone(state.records.at(-1)!.materialSnapshot!)
    const material = state.materials.find((item) => item.id === 'material-a2')!
    state = saveMaterial(
      state,
      { ...material, title: 'New title', content: 'New content' },
      material.id,
      now,
    )
    state = saveStudent(state, { ...state.students[0], level: 'C1' }, 'student-lara', now)
    state = setHomeworkCorrected(state, state.records.at(-1)!.id, true, now)
    const view = studentOverview(state, 'student-lara', now)!
    expect(view.student.level).toBe('C1')
    expect(view.history[0].level).toBe('A2')
    expect(view.history[0].materialSnapshot).toMatchObject({
      title: original.title,
      content: original.content,
    })
    expect(view.history[0].homework?.correctedAt).toBe(now.toISOString())
    expect(view.pendingHomework).toEqual([])
  })
  it('ordena pelo encontro efetivo, sem edição antiga passar à frente; pendências são próprias', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, homework: 'Monday task' },
      now,
    )
    state = saveLessonRecord(state, 'lesson-4', { ...input, homework: 'Wednesday task' }, now)
    state = saveLessonRecord(
      state,
      'lesson-0',
      { ...input, content: 'Updated private text' },
      new Date('2026-10-24T15:00:00Z'),
    )
    state = saveLessonRecord(state, 'lesson-1', { ...input, homework: 'Other student task' }, now)
    const view = studentOverview(state, 'student-lara', now)!
    expect(view.history.map((entry) => entry.date)).toEqual([
      '2026-10-21',
      '2026-10-19',
      '2026-10-16',
    ])
    expect(view.pendingHomework.map((task) => task.description)).toEqual([
      'Wednesday task',
      'Monday task',
    ])
  })
  it('não altera o documento e entrega cópias dos campos aninhados compartilhados', () => {
    const state = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, usedMaterialId: 'material-a2', homework: 'Original task' },
      now,
    )
    const before = structuredClone(state)
    const view = studentOverview(state, 'student-lara', now)!
    view.student.name = 'Changed preview'
    view.history[0].homework!.description = 'Changed preview task'
    view.history[0].materialSnapshot!.content = 'Changed preview content'
    expect(state).toEqual(before)
  })
  it('retorna vazio para aluno sem aulas e null para seleção inexistente, sem fallback', () => {
    let state = createDemo(now)
    state = saveStudent(
      state,
      {
        name: 'New student',
        level: 'A1',
        startDate: '2026-10-23',
        phone: '',
        occupation: '',
        interests: '',
      },
      undefined,
      now,
    )
    const view = studentOverview(state, state.students.at(-1)!.id, now)!
    expect(view.upcoming).toEqual([])
    expect(view.history).toEqual([])
    expect(view.pendingHomework).toEqual([])
    expect(studentOverview(state, 'missing', now)).toBeNull()
  })
  it('considera a aula em andamento até 55 minutos, usando Brasília mesmo com data UTC seguinte', () => {
    const state = createDemo(now)
    const during = new Date('2026-10-24T01:30:00Z')
    expect(
      studentOverview(state, 'student-mateus', during)!.upcoming.map((lesson) => lesson.id),
    ).toEqual(['lesson-9'])
    expect(
      studentOverview(state, 'student-mateus', new Date('2026-10-24T01:55:00Z'))!.upcoming,
    ).toEqual([])
  })
})
