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
  const primaryBookId =
    values.primaryBookId === undefined ? (previous?.primaryBookId ?? null) : values.primaryBookId
  if (primaryBookId) {
    const book = state.books.find((item) => item.id === primaryBookId)
    if (!book) throw new Error('O livro principal não foi encontrado.')
    if (primaryBookId !== previous?.primaryBookId && !book.levels.includes(values.level))
      throw new Error('Escolha um livro principal compatível com o nível do aluno.')
  }
  const student = {
    ...values,
    primaryBookId,
    meetingUrl: values.meetingUrl ?? previous?.meetingUrl,
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
