import { useState } from 'react'
import type { FormEvent } from 'react'
import { errorMessage } from '../../domain/models'
import type { Book, BookInput } from '../../domain/models'
import { FormError, Modal } from '../../shared/Modal'
import { LevelPicker } from '../../shared/LevelPicker'

export function BookForm({
  book,
  onSave,
  onClose,
}: {
  book?: Book
  onSave: (input: BookInput) => void
  onClose: () => void
}) {
  const [levels, setLevels] = useState<string[]>(book?.levels ?? [])
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      onSave({
        title: String(new FormData(event.currentTarget).get('title')),
        levels: levels as BookInput['levels'],
      })
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }
  return (
    <Modal
      title={book ? 'Editar livro' : 'Novo livro'}
      subtitle="Uma sequência de unidades compartilhada entre os níveis atendidos."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <label className="field">
          <span>
            Título do livro{' '}
            <span className="required-marker" aria-hidden="true">
              *
            </span>
          </span>
          <input name="title" required maxLength={150} autoFocus defaultValue={book?.title} />
        </label>
        <LevelPicker levels={levels} onChange={setLevels} />
        <p className="muted form-hint">
          Depois de salvar, cadastre as unidades em Novo material. Editar o livro preserva os
          registros anteriores.
        </p>
        <FormError message={error} />
        <div className="form-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit">
            Salvar livro
          </button>
        </div>
      </form>
    </Modal>
  )
}
