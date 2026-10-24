import { addDays, referenceClock, weekStart } from './dates'
import type { Workspace } from './models'

export function addDemoMaterials(state: Workspace, now = new Date()): Workspace {
  const materials = [...state.materials]
  for (const example of createDemo(now).materials) {
    const exists = materials.some(
      (material) =>
        material.id === example.id ||
        (material.level === example.level &&
          (material.title === example.title ||
            (example.lessonNumber !== undefined &&
              material.lessonNumber === example.lessonNumber))),
    )
    if (!exists) materials.push(example)
  }
  return materials.length === state.materials.length ? state : { ...state, materials }
}

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
    version: 4,
    materials: [
      {
        id: 'material-a1',
        lessonNumber: 1,
        title: 'Meeting someone new',
        level: 'A1',
        content:
          'Introduce yourself with your name, city and one interest.\n\nPractice: What is your name? Where are you from? What do you enjoy?',
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'material-a1-2',
        lessonNumber: 2,
        title: 'Everyday routines',
        level: 'A1',
        content: 'Describe a normal day.\n\nPractice: I wake up at… I work in… In the evening, I…',
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'material-a1-3',
        lessonNumber: 3,
        title: 'Around the neighborhood',
        level: 'A1',
        content:
          'Name places near your home and ask where they are.\n\nPractice: Where is the park? The shop is next to the station.',
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'material-a1-4',
        lessonNumber: 4,
        title: 'Ordering at a café',
        level: 'A1',
        content:
          'Practice a short conversation at a café.\n\nPractice: I would like a tea, please. How much is it? Thank you.',
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'material-a2',
        title: 'Planning a weekend trip',
        level: 'A2',
        content:
          'Plan a two-day trip with a friend. Choose transport, a place to stay and three activities.\n\nPractice: We are going to visit… How much does it cost? What time does it leave?',
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'material-b1',
        title: 'Sharing an experience',
        level: 'B1',
        content:
          'Describe a challenge you faced and what you learned.\n\nInclude: what happened, how you felt, the steps you took and the result.',
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'material-b2',
        title: 'A better working week',
        level: 'B2',
        content:
          'Discuss the advantages and drawbacks of a four-day working week.\n\nSupport your opinion with examples and respond to an opposing view.',
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'material-c1',
        title: 'How cities change',
        level: 'C1',
        content:
          'Explore how urban design influences everyday decisions.\n\nCompare two approaches, acknowledge limitations and propose a balanced recommendation.',
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'material-c2',
        title: 'The art of disagreement',
        level: 'C2',
        content:
          'Reframe a disputed idea for audiences with different priorities.\n\nConsider nuance, implied assumptions, tone and the strongest counterargument.',
        createdAt,
        updatedAt: createdAt,
      },
    ],
    plans: [],
    series: [],
    blocks: [],
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
