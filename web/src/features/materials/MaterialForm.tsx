import { useState } from 'react'
import type { FormEvent } from 'react'
import { LEVELS, errorMessage } from '../../domain/models'
import type { Material, MaterialInput } from '../../domain/models'
import { FormError, Modal } from '../../shared/Modal'

export function MaterialForm({
  material,
  onSave,
  onClose,
}: {
  material?: Material
  onSave: (input: MaterialInput) => void
  onClose: () => void
}) {
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      onSave({
        title: String(data.get('title')),
        level: String(data.get('level')) as MaterialInput['level'],
        content: String(data.get('content')),
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
          <span>
            Nível{' '}
            <span className="required-marker" aria-hidden="true">
              *
            </span>
          </span>
          <select name="level" required defaultValue={material?.level ?? ''}>
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
