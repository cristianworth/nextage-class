import { useState } from 'react'
import type { FormEvent } from 'react'
import type { LessonInput, Student } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import { HOURS, formatHour, nextWeekday, referenceClock } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'
import { Icon } from '../../shared/Icon'

export type LessonPrefill = { date?: string; hour?: number }
export type NewLessonInput = LessonInput & { weekly: boolean; endDate: string | null }

export function LessonForm({
  students,
  prefill,
  onSave,
  onClose,
}: {
  students: Student[]
  prefill: LessonPrefill
  onSave: (input: NewLessonInput) => void
  onClose: () => void
}) {
  const [error, setError] = useState('')
  const [weekly, setWeekly] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      onSave({
        studentId: String(data.get('studentId')),
        date: String(data.get('date')),
        hour: Number(data.get('hour')),
        weekly,
        endDate: weekly && data.get('endDate') ? String(data.get('endDate')) : null,
      })
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }
  return (
    <Modal
      title="Uma nova aula na agenda"
      subtitle="Agende uma aula individual, uma vez ou toda semana."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <label className="field">
          Aluno
          <select name="studentId" required defaultValue="" autoFocus>
            <option value="" disabled>
              Selecione o aluno
            </option>
            {[...students]
              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
              .map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.level}
                </option>
              ))}
          </select>
        </label>
        <div className="form-grid">
          <label className="field">
            Data da aula
            <input
              type="date"
              name="date"
              required
              defaultValue={prefill.date ?? nextWeekday(referenceClock().date)}
            />
          </label>
          <label className="field">
            Horário
            <select name="hour" required defaultValue={prefill.hour ?? ''}>
              <option value="" disabled>
                Selecione o horário
              </option>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {formatHour(hour)} – {String(hour).padStart(2, '0')}:55
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
            <input type="date" name="endDate" />
            <small className="muted">Deixe em branco para continuar sem data final.</small>
          </label>
        )}
        <div className="info-note">
          <Icon name="clock" size={18} />
          <p>
            55 minutos de aula + 5 de intervalo.
            <br />
            <span>Segunda a sexta, no horário de Brasília.</span>
          </p>
        </div>
        <FormError message={error} />
        <div className="form-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit">
            Agendar aula
          </button>
        </div>
      </form>
    </Modal>
  )
}
