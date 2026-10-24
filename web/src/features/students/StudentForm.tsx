import { useState } from 'react'
import type { FormEvent } from 'react'
import { LEVELS, errorMessage } from '../../domain/models'
import type { Book, Student, StudentInput } from '../../domain/models'
import { referenceClock } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'

export function StudentForm({
  student,
  books,
  onSave,
  onClose,
}: {
  student?: Student
  books: Book[]
  onSave: (input: StudentInput) => void
  onClose: () => void
}) {
  const [error, setError] = useState('')
  const [level, setLevel] = useState(student?.level ?? '')
  const [primaryBookId, setPrimaryBookId] = useState(student?.primaryBookId ?? '')
  const compatible = books.filter((book) => book.levels.some((item) => item === level))
  const previousBook = books.find((book) => book.id === primaryBookId)
  const incompatible = !!previousBook && !compatible.includes(previousBook)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (key: string) => String(data.get(key) ?? '')
    try {
      onSave({
        name: value('name'),
        level: value('level') as StudentInput['level'],
        startDate: value('startDate'),
        phone: value('phone'),
        occupation: value('occupation'),
        interests: value('interests'),
        meetingUrl: value('meetingUrl'),
        primaryBookId: primaryBookId || null,
      })
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }
  return (
    <Modal
      title={student ? 'Editar aluno' : 'Conheça seu próximo aluno'}
      subtitle="Organize os dados para acompanhar a jornada do aluno."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <label className="field">
          <span>
            Nome do aluno{' '}
            <span className="required-marker" aria-hidden="true">
              *
            </span>
          </span>
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={student?.name}
            placeholder="Como o aluno se chama?"
            autoComplete="off"
            autoFocus
          />
        </label>
        <div className="form-grid">
          <label className="field">
            <span>
              Nível{' '}
              <span className="required-marker" aria-hidden="true">
                *
              </span>
            </span>
            <select
              name="level"
              required
              value={level}
              onChange={(event) => {
                setLevel(event.target.value)
                if (
                  primaryBookId !== student?.primaryBookId &&
                  !books
                    .find((book) => book.id === primaryBookId)
                    ?.levels.some((item) => item === event.target.value)
                )
                  setPrimaryBookId('')
              }}
            >
              <option value="" disabled>
                Selecione o nível
              </option>
              {LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>
              Início das aulas{' '}
              <span className="required-marker" aria-hidden="true">
                *
              </span>
            </span>
            <input
              type="date"
              name="startDate"
              required
              defaultValue={student?.startDate ?? referenceClock().date}
            />
          </label>
        </div>
        <label className="field">
          Livro principal
          <select
            aria-label="Livro principal"
            value={primaryBookId}
            onChange={(event) => setPrimaryBookId(event.target.value)}
          >
            <option value="">Sem livro principal</option>
            {incompatible && (
              <option value={previousBook.id}>{previousBook.title} · não atende este nível</option>
            )}
            {compatible.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
          <small>
            {incompatible
              ? 'O livro atual não atende este nível. O vínculo e o progresso são preservados até você escolher outro.'
              : 'Um principal por aluno. Trocar e voltar retoma o ponto anterior de cada livro.'}
          </small>
        </label>
        <div className="form-grid">
          <label className="field">
            Telefone
            <input
              type="tel"
              name="phone"
              maxLength={50}
              defaultValue={student?.phone}
              placeholder="(00) 00000-0000"
              autoComplete="off"
            />
          </label>
          <label className="field">
            Ocupação
            <input
              name="occupation"
              maxLength={150}
              defaultValue={student?.occupation}
              placeholder="Com o que trabalha?"
            />
          </label>
        </div>
        <label className="field">
          Interesses
          <textarea
            name="interests"
            maxLength={1000}
            defaultValue={student?.interests}
            placeholder="Viagens, conversação, interesses profissionais…"
            rows={3}
          />
        </label>
        <label className="field">
          Link da aula
          <input
            name="meetingUrl"
            type="url"
            maxLength={2000}
            defaultValue={student?.meetingUrl}
            placeholder="https://…"
          />
          <small>Link manual da reunião para as aulas deste aluno.</small>
        </label>
        {student && (
          <p className="muted form-hint">
            Alterações no cadastro preservam os registros de aulas anteriores.
          </p>
        )}
        <FormError message={error} />
        <div className="form-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit">
            {student ? 'Salvar alterações' : 'Cadastrar aluno'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
