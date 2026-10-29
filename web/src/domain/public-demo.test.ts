import { describe, expect, it } from 'vitest'
import { assertAvailable, availableRequestHours } from './availability'
import { upcomingLessons } from './agenda'
import { courseSuggestion } from './course-progress'
import { addDays, hasLessonEnded, referenceClock, weekStart } from './dates'
import { workspaceSchema } from './models'
import { createPublicDemo } from './public-demo'
import { decideSchedulingRequest } from './scheduling-requests'
import { studentOverview } from './student-overview'

describe('public demonstration examples', () => {
  it.each([
    '2026-10-26T09:00:00.000Z',
    '2026-10-29T15:00:00.000Z',
    '2026-10-24T02:30:00.000Z',
    '2026-10-24T15:00:00.000Z',
    '2026-10-25T23:00:00.000Z',
    '2027-01-01T02:30:00.000Z',
  ])('provides usable past and future examples when created at %s', (timestamp) => {
    const now = new Date(timestamp)
    const state = createPublicDemo(now)
    const monday = weekStart(referenceClock(now).date)

    expect(workspaceSchema.safeParse(state).success).toBe(true)
    expect(() => assertAvailable(state)).not.toThrow()
    expect(
      state.lessons.filter((lesson) => lesson.date >= monday && lesson.date <= addDays(monday, 4)),
    ).toHaveLength(10)
    for (const student of state.students) {
      expect(upcomingLessons(state, now, student.id).length).toBeGreaterThan(0)
    }
    expect(
      state.lessons.some(
        (lesson) =>
          hasLessonEnded(lesson.date, lesson.hour, now) &&
          !state.records.some((record) => record.lessonId === lesson.id),
      ),
    ).toBe(true)
  })

  it('connects Lara’s previous lesson, homework, next unit and future preparation', () => {
    const now = new Date('2026-10-29T15:00:00.000Z')
    const state = createPublicDemo(now)
    const view = studentOverview(state, 'student-lara', now)!
    const next = courseSuggestion(state, 'student-lara', 'A2')
    const plan = state.plans.find((item) => item.lessonId === 'public-next-lesson-0')!

    expect(view.history[0].materialSnapshot?.title).toBe('At the station')
    expect(view.history[0].materialSnapshot?.sequenceTitle).toBe('Inglês para viajar')
    expect(view.pendingHomework).toHaveLength(1)
    expect(next.material?.id).toBe('public-travel-2')
    expect(plan.materialId).toBe(next.material?.id)
    expect(JSON.stringify(view)).not.toContain('Lara pediu informações e confirmou horários')
    expect(JSON.stringify(view)).not.toContain(plan.notes)
  })

  it('keeps a pending example available and turns it into a lesson only on approval', () => {
    const now = new Date('2026-10-29T15:00:00.000Z')
    const state = createPublicDemo(now)
    const request = state.requests[0]

    expect(availableRequestHours(state, request, now)).toContain(request.hour)
    expect(
      state.lessons.some((lesson) => lesson.date === request.date && lesson.hour === request.hour),
    ).toBe(false)
    const approved = decideSchedulingRequest(state, request.id, 'approved', now)
    expect(approved.requests[0].status).toBe('approved')
    expect(approved.lessons.at(-1)?.studentId).toBe('student-lara')
    expect(availableRequestHours(approved, request, now)).not.toContain(request.hour)
  })

  it('restores the same examples for the same instant without retaining visitor changes', () => {
    const now = new Date('2026-10-29T15:00:00.000Z')
    const original = createPublicDemo(now)
    const edited = createPublicDemo(now)
    edited.students[0].name = 'Edited during the visit'
    edited.records[0].content = 'Visitor notes'

    expect(createPublicDemo(now)).toEqual(original)
    expect(original.students[0].name).toBe('Lara Santos')
    expect(createPublicDemo(new Date('2026-11-05T15:00:00.000Z')).lessons[0].date).toBe(
      addDays(original.lessons[0].date, 7),
    )
  })
})
