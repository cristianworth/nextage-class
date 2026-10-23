import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BlockInput } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import { HOURS, formatHour, nextWeekday, referenceClock } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'
import type { LessonPrefill } from './LessonForm'

export function BlockForm({
  prefill,
  onSave,
  onClose,
}: {
  prefill: LessonPrefill
  onSave: (input: BlockInput) => void
  onClose: () => void
}) {
  const [weekly, setWeekly] = useState(false)
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      onSave({
        title: String(data.get('title')),
        date: String(data.get('date')),
        startHour: Number(data.get('startHour')),
        endHour: Number(data.get('endHour')),
        repeat: weekly ? 'weekly' : 'once',
        endDate: weekly && data.get('endDate') ? String(data.get('endDate')) : null,
      })
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }
  return (
    <Modal
      title="Bloquear horário"
      subtitle="Reserve um período sem aulas, no horário de Brasília."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <label className="field">
          Descrição
          <input name="title" maxLength={100} placeholder="Ex.: compromisso ou férias" autoFocus />
        </label>
        <label className="field">
          Data do bloqueio
          <input
            type="date"
            name="date"
            required
            defaultValue={prefill.date ?? nextWeekday(referenceClock().date)}
          />
        </label>
        <div className="form-grid">
          <label className="field">
            Das
            <select name="startHour" defaultValue={prefill.hour ?? 7} required>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Até
            <select name="endHour" defaultValue={(prefill.hour ?? 7) + 1} required>
              {HOURS.map((hour) => (
                <option key={hour} value={hour + 1}>
                  {formatHour(hour + 1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="check-field">
          <input
            type="checkbox"
            checked={weekly}
            onChange={(event) => setWeekly(event.target.checked)}
          />
          Repetir toda semana
        </label>
        {weekly && (
          <label className="field">
            Repetir até
            <input name="endDate" type="date" />
            <small className="muted">Deixe em branco para continuar sem data final.</small>
          </label>
        )}
        <p className="muted">Se houver conflito, avisamos e mantemos a agenda como está.</p>
        <FormError message={error} />
        <div className="form-actions">
          <button className="button" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit">
            Salvar bloqueio
          </button>
        </div>
      </form>
    </Modal>
  )
}
