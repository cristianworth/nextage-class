import { useState } from 'react'
import type { FormEvent } from 'react'
import { errorMessage } from '../../domain/models'
import type { Book, Material, MaterialInput } from '../../domain/models'
import { FormError, Modal } from '../../shared/Modal'
import { LevelPicker } from '../../shared/LevelPicker'

export function MaterialForm({
  material,
  books,
  onSave,
  onClose,
}: {
  material?: Material
  books: Book[]
  onSave: (input: MaterialInput) => void
  onClose: () => void
}) {
  const [error, setError] = useState('')
  const [kind, setKind] = useState(material?.bookId ? 'unit' : 'support')
  const [bookId, setBookId] = useState(material?.bookId ?? '')
  const [levels, setLevels] = useState<string[]>(
    material?.levels ?? (material ? [material.level] : []),
  )
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      if (kind === 'support' && !levels.length) throw new Error('Selecione ao menos um nível.')
      onSave({
        title: String(data.get('title')),
        level: (kind === 'unit'
          ? books.find((book) => book.id === bookId)?.levels[0]
          : levels[0]) as MaterialInput['level'],
        levels: kind === 'unit' ? undefined : (levels as MaterialInput['levels']),
        bookId: kind === 'unit' ? bookId || undefined : undefined,
        content: String(data.get('content')),
        lessonNumber:
          kind === 'unit' && data.get('lessonNumber')
            ? Number(data.get('lessonNumber'))
            : undefined,
      })
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }
  return (
    <Modal
      title={material ? 'Editar material' : 'Novo material'}
      subtitle="Um texto para apoiar os próximos encontros."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <label className="field">
          <span>
            Título{' '}
            <span className="required-marker" aria-hidden="true">
              *
            </span>
          </span>
          <input name="title" required maxLength={150} defaultValue={material?.title} autoFocus />
        </label>
        <label className="field">
          Tipo de material
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="support">Material de apoio</option>
            <option value="unit">Unidade de sequência</option>
          </select>
        </label>
        {kind === 'unit' ? (
          <>
            <label className="field">
              <span>
                Sequência{' '}
                <span className="required-marker" aria-hidden="true">
                  *
                </span>
              </span>
              <select required value={bookId} onChange={(event) => setBookId(event.target.value)}>
                <option value="" disabled>
                  Selecione a sequência
                </option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} · {book.levels.join(', ')}
                  </option>
                ))}
              </select>
            </label>
            {!books.length && (
              <p className="info-note">
                Cadastre uma sequência no acervo antes de criar suas unidades.
              </p>
            )}
            <label className="field">
              <span>
                Número da unidade{' '}
                <span className="required-marker" aria-hidden="true">
                  *
                </span>
              </span>
              <input
                name="lessonNumber"
                aria-label="Número da unidade"
                required
                type="number"
                min={1}
                max={9999}
                step={1}
                defaultValue={material?.lessonNumber}
              />
              <small>Define a ordem dentro desta sequência. Os níveis são herdados dela.</small>
            </label>
          </>
        ) : (
          <LevelPicker levels={levels} onChange={setLevels} />
        )}
        <label className="field">
          <span>
            Conteúdo do material{' '}
            <span className="required-marker" aria-hidden="true">
              *
            </span>
          </span>
          <textarea
            name="content"
            required
            maxLength={20000}
            rows={10}
            defaultValue={material?.content}
            placeholder="Escreva o texto, as perguntas ou o roteiro da atividade…"
          />
        </label>
        <p className="muted form-hint">
          Use conteúdo próprio ou autorizado. Editar o acervo preserva a versão já salva nos
          registros de aula.
        </p>
        <FormError message={error} />
        <div className="form-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button primary">
            Salvar material
          </button>
        </div>
      </form>
    </Modal>
  )
}
