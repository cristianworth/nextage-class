import { useState } from 'react'
import type { FormEvent } from 'react'
import { LEVELS, errorMessage } from '../../domain/models'
import type { Student, StudentInput } from '../../domain/models'
import { referenceClock } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'

export function StudentForm({
  student,
  onSave,
  onClose,
}: {
  student?: Student
  onSave: (input: StudentInput) => void
  onClose: () => void
}) {
  const [error, setError] = useState('')
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
            <select name="level" required defaultValue={student?.level ?? ''}>
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
