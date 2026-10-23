import { addDays, referenceClock, weekStart } from './dates'
import type { Workspace } from './models'

export function createDemo(now = new Date()): Workspace {
  const today = referenceClock(now).date
  const monday = weekStart(today)
  const createdAt = `${addDays(monday, -14)}T12:00:00.000Z`
  const students: Workspace['students'] = [
    {
      id: 'student-lara',
      name: 'Lara Santos',
      level: 'A2',
      occupation: 'Designer',
      interests: 'Viagens, cinema e novas culturas',
      phone: '',
      startDate: addDays(monday, -60),
      createdAt,
    },
    {
      id: 'student-mateus',
      name: 'Mateus Costa',
      level: 'B1',
      occupation: 'Desenvolvedor',
      interests: 'Tecnologia e conversação profissional',
      phone: '',
      startDate: addDays(monday, -90),
      createdAt,
    },
    {
      id: 'student-sofia',
      name: 'Sofia Lima',
      level: 'A1',
      occupation: 'Arquiteta',
      interests: 'Arte, gastronomia e viagens',
      phone: '',
      startDate: addDays(monday, -20),
      createdAt,
    },
    {
      id: 'student-diego',
      name: 'Diego Alves',
      level: 'B2',
      occupation: 'Analista de negócios',
      interests: 'Negociação e apresentações',
      phone: '',
      startDate: addDays(monday, -120),
      createdAt,
    },
  ]
  const examples: [string, number, number][] = [
    ['student-lara', 0, 9],
    ['student-mateus', 0, 14],
    ['student-sofia', 1, 10],
    ['student-diego', 1, 16],
    ['student-lara', 2, 9],
    ['student-mateus', 2, 14],
    ['student-sofia', 3, 10],
    ['student-diego', 3, 16],
    ['student-lara', 4, 10],
    ['student-mateus', 4, 22],
  ]
  const lessons = examples.map(([studentId, day, hour], index) => ({
    id: `lesson-${index}`,
    studentId,
    date: addDays(monday, day),
    hour,
    createdAt,
  }))
  const previousLesson = {
    id: 'lesson-previous',
    studentId: 'student-lara',
    date: addDays(monday, -3),
    hour: 9,
    createdAt,
  }
  return {
    version: 1,
    students,
    lessons: [previousLesson, ...lessons],
    records: [
      {
        id: 'record-previous',
        lessonId: previousLesson.id,
        studentName: 'Lara Santos',
        attendance: 'attended',
        level: 'A2',
        material: 'Travel essentials · Unidade 2',
        content:
          'Conversamos sobre viagens e praticamos perguntas para pedir informações. Revisamos vocabulário de aeroportos e situações do cotidiano.',
        reason: '',
        createdAt: `${previousLesson.date}T13:00:00.000Z`,
        updatedAt: `${previousLesson.date}T13:00:00.000Z`,
      },
    ],
  }
}
