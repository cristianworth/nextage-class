import { bookInputSchema } from './models'
import type { BookInput, Workspace } from './models'

export function saveBook(
  state: Workspace,
  input: BookInput,
  id?: string,
  now = new Date(),
): Workspace {
  const values = bookInputSchema.parse(input)
  const previous = state.books.find((book) => book.id === id)
  if (id && !previous) throw new Error('Este livro não foi encontrado.')
  const book = {
    ...values,
    id: previous?.id ?? crypto.randomUUID(),
    createdAt: previous?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  }
  return {
    ...state,
    books: previous
      ? state.books.map((item) => (item.id === id ? book : item))
      : [...state.books, book],
  }
}
