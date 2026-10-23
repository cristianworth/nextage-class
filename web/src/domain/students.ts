import { studentInputSchema } from './models'
import type { StudentInput, Workspace } from './models'

export function saveStudent(
  state: Workspace,
  input: StudentInput,
  studentId?: string,
  now = new Date(),
): Workspace {
  const values = studentInputSchema.parse(input)
  const previous = state.students.find((student) => student.id === studentId)
  if (studentId && !previous)
    throw new Error('Este aluno não foi encontrado. Atualize a página e tente novamente.')
  const student = {
    ...values,
    id: previous?.id ?? crypto.randomUUID(),
    createdAt: previous?.createdAt ?? now.toISOString(),
  }
  return {
    ...state,
    students: previous
      ? state.students.map((item) => (item.id === student.id ? student : item))
      : [...state.students, student],
  }
}

export function matchesSearch(value: string, query: string) {
  const normalize = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
  return normalize(value).includes(normalize(query.trim()))
}
