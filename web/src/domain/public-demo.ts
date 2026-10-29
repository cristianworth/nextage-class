import { createDemo } from './demo'
import { addDays, referenceClock, weekStart } from './dates'
import { workspaceSchema } from './models'
import type { Material, Workspace } from './models'
import { saveLessonPlan } from './preparation'
import { saveLessonRecord } from './records'
import { submitSchedulingRequest } from './scheduling-requests'

export function createPublicDemo(now = new Date()): Workspace {
  const original = createDemo(now)
  const monday = weekStart(referenceClock(now).date)
  const timestamp = `${addDays(monday, -14)}T12:00:00.000Z`
  const bookId = 'public-book-travel'
  const travelUnits: Material[] = [
    {
      id: 'public-travel-1',
      title: 'At the station',
      content:
        'Ask for information at a train station.\n\nPractice: Which platform does the train leave from? Is this a direct train? Could you repeat that, please?\n\nIn pairs, choose a destination and take turns asking for a ticket and giving directions.',
      lessonNumber: 1,
      bookId,
      level: 'A2',
      levels: ['A2'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'public-travel-2',
      title: 'Making a travel plan',
      content:
        'Plan a short trip and explain your choices.\n\nPractice: We are going to stay near the station. I would like to visit the museum on Saturday. How long does the journey take?\n\nCompare two routes and agree on transport, accommodation and one activity.',
      lessonNumber: 2,
      bookId,
      level: 'A2',
      levels: ['A2'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'public-travel-3',
      title: 'Changing a booking',
      content:
        'Explain a change of plans and ask for help.\n\nPractice: I need to change my booking. Is there another train in the afternoon? How much is the difference?\n\nRole-play a conversation with a receptionist and confirm the new date and time.',
      lessonNumber: 3,
      bookId,
      level: 'A2',
      levels: ['A2'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]
  const nextLessons = original.lessons
    .filter((lesson) => lesson.id !== 'lesson-previous')
    .map((lesson) => ({
      ...lesson,
      id: `public-next-${lesson.id}`,
      date: addDays(lesson.date, 7),
    }))
  let state: Workspace = {
    ...original,
    books: [
      ...original.books.map((book) => ({ ...book, title: 'Primeiras conversas' })),
      {
        id: bookId,
        title: 'Inglês para viajar',
        levels: ['A2'],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    students: original.students.map((student) =>
      student.id === 'student-lara' ? { ...student, primaryBookId: bookId } : student,
    ),
    materials: [...original.materials, ...travelUnits],
    lessons: [
      ...original.lessons,
      ...nextLessons,
      {
        id: 'public-sofia-history',
        studentId: 'student-sofia',
        date: addDays(monday, -7),
        hour: 10,
        createdAt: timestamp,
      },
      {
        id: 'public-lesson-to-record',
        studentId: 'student-sofia',
        date: addDays(monday, -5),
        hour: 10,
        createdAt: timestamp,
      },
    ],
    records: [],
  }
  const laraLesson = state.lessons.find((lesson) => lesson.id === 'lesson-previous')!
  state = saveLessonRecord(
    state,
    laraLesson.id,
    {
      attendance: 'attended',
      level: 'A2',
      material: '',
      usedMaterialId: travelUnits[0].id,
      content:
        'Lara pediu informações e confirmou horários com autonomia. Na próxima aula, retomar perguntas de duração antes de comparar duas rotas.',
      reason: '',
      homework: 'Escrever quatro perguntas para pedir informações sobre uma viagem de trem.',
      courseCompleted: true,
    },
    new Date(`${laraLesson.date}T18:00:00.000Z`),
  )
  state = saveLessonRecord(
    state,
    'public-sofia-history',
    {
      attendance: 'attended',
      level: 'A1',
      material: '',
      usedMaterialId: 'material-a1',
      content:
        'Sofia apresentou seu trabalho e interesses. Continuar a prática de perguntas antes de concluir a unidade.',
      reason: '',
      homework: 'Preparar uma apresentação de cinco frases sobre sua rotina e interesses.',
      courseCompleted: false,
    },
    new Date(`${addDays(monday, -7)}T18:00:00.000Z`),
  )
  state = saveLessonPlan(
    state,
    'public-next-lesson-0',
    {
      materialId: travelUnits[1].id,
      notes:
        'Conferir as perguntas do homework, comparar duas opções de viagem e praticar perguntas sobre duração e preço.',
    },
    now,
  )
  state = submitSchedulingRequest(
    state,
    'student-lara',
    { kind: 'once', date: addDays(monday, 8), hour: 11, endDate: null },
    now,
  )
  // Stable example identifiers make an explicit restoration reproducible for the same date.
  return workspaceSchema.parse({
    ...state,
    records: state.records.map((record) => ({ ...record, id: `public-record-${record.lessonId}` })),
    requests: state.requests.map((request) => ({ ...request, id: 'public-request-lara' })),
  })
}
