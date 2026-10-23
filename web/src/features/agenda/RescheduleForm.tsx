import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Lesson, LessonInput } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import type { RescheduleScope } from '../../domain/weekly-scheduling'
import { HOURS, formatDate, formatHour } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'

export function RescheduleForm({
  lesson,
  onSave,
  onClose,
}: {
  lesson: Lesson
  onSave: (target: Pick<LessonInput, 'date' | 'hour'>, scope: RescheduleScope) => void
  onClose: () => void
}) {
  const [scope, setScope] = useState<RescheduleScope>('single')
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      onSave({ date: String(data.get('date')), hour: Number(data.get('hour')) }, scope)
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }
  return (
    <Modal
      title="Remarcar aula"
      subtitle={`Horário atual: ${formatDate(lesson.date)} às ${formatHour(lesson.hour)}.`}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        {lesson.seriesId && (
          <fieldset className="scope-options">
            <legend>O que deseja mudar?</legend>
            <label>
              <input
                type="radio"
                name="scope"
                checked={scope === 'single'}
                onChange={() => setScope('single')}
              />
              Somente esta aula
            </label>
            <label>
              <input
                type="radio"
                name="scope"
                checked={scope === 'following'}
                onChange={() => setScope('following')}
              />
              Esta e as próximas
            </label>
          </fieldset>
        )}
        <div className="form-grid">
          <label className="field">
            Nova data
            <input type="date" name="date" required defaultValue={lesson.date} autoFocus />
          </label>
          <label className="field">
            Novo horário
            <select name="hour" required defaultValue={lesson.hour}>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="info-note">
          {scope === 'following'
            ? 'O novo horário vale a partir desta aula e também atualiza trocas pontuais futuras da série. Aulas iniciadas e registros são preservados.'
            : 'Só esta aula muda. Os outros encontros mantêm seus horários.'}
        </p>
        <FormError message={error} />
        <div className="form-actions">
          <button className="button" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit">
            Salvar remarcação
          </button>
        </div>
      </form>
    </Modal>
  )
}
