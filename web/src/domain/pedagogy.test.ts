import { describe, expect, it } from 'vitest'
import { createDemo } from './demo'
import { saveMaterial } from './materials'
import { saveLessonRecord } from './records'
import { saveLessonPlan, lessonContext } from './preparation'
import { setHomeworkCorrected } from './homework'
import { findLesson, lessonsInRange } from './agenda'
import { occurrenceAt } from './recurrence'
import { rescheduleLesson, scheduleWeekly } from './weekly-scheduling'
import { saveStudent } from './students'
import { scheduleLesson } from './lessons'
import { workspaceSchema } from './models'

const now = new Date('2026-10-23T15:00:00Z')
const input = {
  attendance: 'attended' as const,
  level: 'A2' as const,
  content: 'Conversação',
  material: '',
  reason: '',
}

describe('acervo e material utilizado', () => {
  it('cria e edita um material sem perder criação ou duplicar', () => {
    const state = saveMaterial(
      createDemo(now),
      { title: '  Airports  ', level: 'A2', content: ' Find the gate. ' },
      undefined,
      now,
    )
    const material = state.materials.at(-1)!
    const later = new Date('2026-10-24T15:00:00Z')
    const next = saveMaterial(state, { ...material, title: 'At the airport' }, material.id, later)
    expect(next.materials).toHaveLength(createDemo(now).materials.length + 1)
    expect(next.materials.at(-1)).toMatchObject({
      title: 'At the airport',
      content: 'Find the gate.',
      createdAt: material.createdAt,
      updatedAt: later.toISOString(),
    })
    expect(() => saveMaterial(state, { title: ' ', level: 'A2', content: 'Text' })).toThrow()
    expect(() => saveMaterial(state, { title: 'Title', level: 'A2', content: ' ' })).toThrow()
  })
  it('preserva cópia histórica ao editar acervo e outros campos do lançamento', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, usedMaterialId: 'material-a2' },
      now,
    )
    const snapshot = structuredClone(state.records.at(-1)!.materialSnapshot)
    const material = state.materials.find((item) => item.id === 'material-a2')!
    state = saveMaterial(
      state,
      { ...material, title: 'Título novo', content: 'Conteúdo novo' },
      material.id,
      now,
    )
    state = saveLessonRecord(state, 'lesson-0', { ...input, content: 'Registro corrigido' }, now)
    expect(state.records.at(-1)!.materialSnapshot).toEqual(snapshot)
    state = saveLessonRecord(state, 'lesson-0', { ...input, usedMaterialId: 'material-a2' }, now)
    expect(state.records.at(-1)!.materialSnapshot?.content).toBe('Conteúdo novo')
    state = saveLessonRecord(
      state,
      'lesson-0',
      { ...input, usedMaterialId: null, material: 'Texto livre' },
      now,
    )
    expect(state.records.at(-1)!.materialSnapshot).toBeUndefined()
    expect(state.records.at(-1)!.material).toBe('Texto livre')
  })
})

describe('homework simples', () => {
  it('corrige inteiro, desfaz e preserva ao editar outro campo', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, homework: 'Exercícios 1 a 5' },
      now,
    )
    const recordId = state.records.at(-1)!.id
    state = setHomeworkCorrected(state, recordId, true, now)
    state = saveLessonRecord(state, 'lesson-0', { ...input, content: 'Ajustado' }, now)
    expect(state.records.at(-1)!.homework).toEqual({
      description: 'Exercícios 1 a 5',
      correctedAt: now.toISOString(),
    })
    state = setHomeworkCorrected(state, recordId, false, now)
    expect(state.records.at(-1)!.homework?.correctedAt).toBeNull()
    expect(state.records.filter((item) => item.lessonId === 'lesson-0')).toHaveLength(1)
  })
  it('nova descrição volta a pendente e limpeza explícita remove a tarefa', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, homework: 'Tarefa antiga' },
      now,
    )
    state = setHomeworkCorrected(state, state.records.at(-1)!.id, true, now)
    state = saveLessonRecord(state, 'lesson-0', { ...input, homework: 'Tarefa nova' }, now)
    expect(state.records.at(-1)!.homework?.correctedAt).toBeNull()
    state = saveLessonRecord(state, 'lesson-0', { ...input, homework: '' }, now)
    expect(state.records.at(-1)!.homework).toBeUndefined()
  })
  it('consulta contexto cronológico sem misturar alunos ou aulas posteriores', () => {
    let state = saveLessonRecord(
      createDemo(now),
      'lesson-0',
      { ...input, homework: 'Tarefa Lara' },
      now,
    )
    state = saveLessonRecord(state, 'lesson-2', { ...input, homework: 'Tarefa Sofia' }, now)
    state = saveLessonRecord(state, 'lesson-4', { ...input, content: 'Conteúdo posterior' }, now)
    const target = findLesson(state, 'lesson-4')!
    const context = lessonContext(state, target)
    expect(context.lastAttended?.record.lessonId).toBe('lesson-0')
    expect(context.pending.map((item) => item.record.homework?.description)).toEqual([
      'Tarefa Lara',
    ])
    const corrected = setHomeworkCorrected(state, context.pending[0].record.id, true, now)
    expect(lessonContext(corrected, target).pending).toEqual([])
  })
})

describe('preparação por ocorrência', () => {
  function recurring(endDate: string | null = null) {
    const state = createDemo(now)
    return scheduleWeekly(
      state,
      { studentId: 'student-lara', date: '2026-10-27', hour: 8, endDate },
      now,
    )
  }
  it('materializa apenas a ocorrência planejada e preserva nos dois alcances', () => {
    let state = recurring()
    const first = occurrenceAt(state.series[0], 0)!
    const second = occurrenceAt(state.series[0], 1)!
    state = saveLessonPlan(
      state,
      second.id,
      { materialId: 'material-a2', notes: 'Praticar perguntas' },
      now,
    )
    expect(state.plans).toHaveLength(1)
    expect(state.records).toHaveLength(1)
    state = rescheduleLesson(state, second.id, { date: '2026-11-05', hour: 11 }, 'single', now)
    state = rescheduleLesson(state, first.id, { date: '2026-10-28', hour: 9 }, 'following', now)
    expect(findLesson(state, second.id)?.date).toBe('2026-11-04')
    expect(lessonsInRange(state, '2026-11-02', '2026-11-06')).toHaveLength(1)
    expect(state.plans[0]).toMatchObject({ lessonId: second.id, notes: 'Praticar perguntas' })
    expect(workspaceSchema.parse(state)).toEqual(state)
  })
  it('mantém plano e agenda inteiros se o término impedir nova ocorrência', () => {
    let state = recurring('2026-11-03')
    const first = occurrenceAt(state.series[0], 0)!
    const second = occurrenceAt(state.series[0], 1)!
    state = saveLessonPlan(state, second.id, { materialId: 'material-a2', notes: '' }, now)
    const before = structuredClone(state)
    expect(() =>
      rescheduleLesson(state, first.id, { date: '2026-10-28', hour: 9 }, 'following', now),
    ).toThrow('planejamento fora do término')
    expect(state).toEqual(before)
  })
  it('permite anotações sem material, retirar plano e recusa aula encerrada', () => {
    let state = recurring()
    const lesson = occurrenceAt(state.series[0], 0)!
    state = saveLessonPlan(state, lesson.id, { materialId: null, notes: 'Retomar perguntas' }, now)
    expect(state.plans[0].materialId).toBeNull()
    state = saveLessonPlan(state, lesson.id, { materialId: null, notes: '' }, now)
    expect(state.plans).toEqual([])
    expect(() =>
      saveLessonPlan(state, 'lesson-0', { materialId: 'material-a2', notes: '' }, now),
    ).toThrow('término')
  })
  it('recusa remarcação com conflito sem alterar plano nem ocorrência planejada', () => {
    let state = recurring()
    const first = occurrenceAt(state.series[0], 0)!
    const second = occurrenceAt(state.series[0], 1)!
    state = saveLessonPlan(state, second.id, { materialId: 'material-a2', notes: 'Preservar' }, now)
    state = scheduleLesson(state, { studentId: 'student-sofia', date: '2026-11-04', hour: 9 }, now)
    const before = structuredClone(state)
    expect(() =>
      rescheduleLesson(state, first.id, { date: '2026-10-28', hour: 9 }, 'following', now),
    ).toThrow('Conflito')
    expect(state).toEqual(before)
  })
  it('planejar não declara material utilizado nem impede escolher outro no lançamento', () => {
    const early = new Date('2026-10-19T10:00:00Z')
    let state = saveLessonPlan(
      createDemo(now),
      'lesson-0',
      { materialId: 'material-a2', notes: 'Planejado' },
      early,
    )
    state = saveMaterial(
      state,
      { title: 'Outro material A2', level: 'A2', content: 'Texto alternativo' },
      undefined,
      now,
    )
    const alternativeId = state.materials.at(-1)!.id
    state = saveLessonRecord(state, 'lesson-0', { ...input, usedMaterialId: alternativeId }, now)
    expect(state.plans[0].materialId).toBe('material-a2')
    expect(state.records.at(-1)!.materialSnapshot?.id).toBe(alternativeId)
  })
})

describe('link manual', () => {
  it('aceita HTTP/HTTPS ou vazio e recusa scripts, credenciais e URL inválida', () => {
    const state = createDemo(now)
    for (const meetingUrl of ['https://meet.example.test/lesson', 'http://localhost:3000', '']) {
      expect(
        saveStudent(state, { ...state.students[0], meetingUrl }, 'student-lara', now).students[0]
          .meetingUrl,
      ).toBe(meetingUrl)
    }
    for (const meetingUrl of [
      'javascript:alert(1)',
      'data:text/html,Hello',
      'https://user:pass@example.test',
      'not a URL',
    ]) {
      expect(() =>
        saveStudent(state, { ...state.students[0], meetingUrl }, 'student-lara', now),
      ).toThrow()
    }
  })
})
