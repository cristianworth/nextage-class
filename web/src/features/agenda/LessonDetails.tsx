import type { Lesson, Workspace } from '../../domain/models'
import { ATTENDANCE } from '../../domain/models'
import { formatDate, hasLessonEnded, lessonTime } from '../../domain/dates'
import { Modal } from '../../shared/Modal'
import { Icon } from '../../shared/Icon'

export function LessonDetails({
  lesson,
  state,
  now,
  onClose,
  onRecord,
}: {
  lesson: Lesson
  state: Workspace
  now: Date
  onClose: () => void
  onRecord: () => void
}) {
  const student = state.students.find((item) => item.id === lesson.studentId)!
  const record = state.records.find((item) => item.lessonId === lesson.id)
  const canRecord = hasLessonEnded(lesson.date, lesson.hour, now)
  return (
    <Modal
      title={student.name}
      subtitle={`${formatDate(lesson.date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} · ${lessonTime(lesson.hour)}`}
      onClose={onClose}
    >
      <div className="lesson-detail-tags">
        <span className="level-badge">{student.level}</span>
        <span className="neutral-badge">Aula individual</span>
        <span className={`status-badge ${record ? 'done' : ''}`}>
          {record ? ATTENDANCE[record.attendance] : 'Agendada'}
        </span>
      </div>
      {record ? (
        <div className="record-preview">
          <p className="eyebrow">CONTEÚDO REGISTRADO</p>
          <p>{record.content || record.reason || 'Falta registrada sem observações.'}</p>
          {record.material && <small>Material: {record.material}</small>}
        </div>
      ) : (
        <div className="info-note">
          <Icon name="info" size={20} />
          <p>
            {canRecord
              ? 'Esta aula já aconteceu. Registre o conteúdo para manter o histórico em dia.'
              : 'O lançamento fica disponível após o término da aula, no horário de Brasília.'}
          </p>
        </div>
      )}
      <div className="form-actions">
        <button className="button" onClick={onClose}>
          Fechar
        </button>
        <button className="button primary" disabled={!canRecord} onClick={onRecord}>
          <Icon name={record ? 'edit' : 'book'} size={16} />
          {record ? 'Editar registro' : 'Lançar aula'}
        </button>
      </div>
    </Modal>
  )
}
