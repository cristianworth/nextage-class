import { useState } from 'react'
import type { ScheduleBlock } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import { formatDate, formatHour } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'

export function BlockDetails({
  block,
  onRemove,
  onClose,
}: {
  block: ScheduleBlock
  onRemove: () => void
  onClose: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const weekly = block.repeat === 'weekly'
  return (
    <Modal
      title={block.title}
      subtitle={`${formatHour(block.startHour)} – ${formatHour(block.endHour)} · Horário de Brasília`}
      onClose={onClose}
    >
      <p>
        {weekly
          ? `Toda ${formatDate(block.date, { weekday: 'long' })}, a partir de ${formatDate(block.date)}`
          : formatDate(block.date, { day: '2-digit', month: 'long', year: 'numeric' })}
        {weekly && (block.endDate ? ` até ${formatDate(block.endDate)}` : ', sem data final')}.
      </p>
      {confirm && (
        <p className="info-note">
          {weekly
            ? 'Remover este bloqueio libera todas as suas semanas, inclusive as próximas. As aulas permanecem como estão.'
            : 'Remover este bloqueio libera o período indicado. As aulas permanecem como estão.'}
        </p>
      )}
      <FormError message={error} />
      <div className="form-actions">
        <button className="button" onClick={onClose}>
          Manter bloqueio
        </button>
        <button
          className="button danger"
          onClick={() => {
            if (!confirm) {
              setConfirm(true)
              return
            }
            try {
              onRemove()
            } catch (cause) {
              setError(errorMessage(cause))
            }
          }}
        >
          {confirm ? 'Confirmar remoção' : weekly ? 'Remover bloqueio semanal' : 'Remover bloqueio'}
        </button>
      </div>
    </Modal>
  )
}
