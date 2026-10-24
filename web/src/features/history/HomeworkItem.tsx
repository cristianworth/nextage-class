import { useState } from 'react'
import type { LessonRecord } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import { formatTimestamp } from '../../domain/dates'
import { FormError } from '../../shared/Modal'

export function HomeworkItem({
  record,
  onToggle,
}: {
  record: LessonRecord
  onToggle: (id: string, corrected: boolean) => void
}) {
  const [error, setError] = useState('')
  const homework = record.homework
  if (!homework) return null
  return (
    <div className="homework-item">
      <p className="eyebrow">HOMEWORK · {homework.correctedAt ? 'CORRIGIDO' : 'PENDENTE'}</p>
      <p className="record-body">{homework.description}</p>
      {homework.correctedAt && (
        <p className="muted form-hint">Corrigido em {formatTimestamp(homework.correctedAt)}</p>
      )}
      <button
        className="button small"
        aria-pressed={!!homework.correctedAt}
        onClick={() => {
          try {
            onToggle(record.id, !homework.correctedAt)
            setError('')
          } catch (cause) {
            setError(errorMessage(cause))
          }
        }}
      >
        {homework.correctedAt ? 'Marcar como pendente' : 'Marcar como corrigido'}
      </button>
      <FormError message={error} />
    </div>
  )
}
