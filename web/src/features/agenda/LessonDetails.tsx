import type { Lesson, Workspace } from '../../domain/models'
import { ATTENDANCE } from '../../domain/models'
import { formatDate, hasLessonEnded, hasLessonStarted, lessonTime } from '../../domain/dates'
import { Modal } from '../../shared/Modal'
import { Icon } from '../../shared/Icon'
import { lessonContext } from '../../domain/preparation'
import { HomeworkItem } from '../history/HomeworkItem'

export function LessonDetails({
  lesson,
  state,
  now,
  onClose,
  onRecord,
  onReschedule,
  onPlan,
  onHomework,
}: {
  lesson: Lesson
  state: Workspace
  now: Date
  onClose: () => void
  onRecord: () => void
  onReschedule: () => void
  onPlan: () => void
  onHomework: (id: string, corrected: boolean) => void
}) {
  const student = state.students.find((item) => item.id === lesson.studentId)!
  const record = state.records.find((item) => item.lessonId === lesson.id)
  const canRecord = hasLessonEnded(lesson.date, lesson.hour, now)
  const plan = state.plans.find((item) => item.lessonId === lesson.id)
  const material = state.materials.find((item) => item.id === plan?.materialId)
  const context = lessonContext(state, lesson)
  return (
    <Modal
      title={student.name}
      subtitle={`${formatDate(lesson.date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} · ${lessonTime(lesson.hour)}`}
      onClose={onClose}
    >
      <div className="lesson-detail-tags">
        <span className="level-badge">{student.level}</span>
        <span className="neutral-badge">Aula individual</span>
        {lesson.seriesId && <span className="neutral-badge">Semanal</span>}
        <span className={`status-badge ${record ? 'done' : ''}`}>
          {record ? ATTENDANCE[record.attendance] : 'Agendada'}
        </span>
      </div>
      {record ? (
        <div className="record-preview">
          <p className="eyebrow">CONTEÚDO REGISTRADO</p>
          <p>{record.content || record.reason || 'Falta registrada sem observações.'}</p>
          {record.material && <small>Material: {record.material}</small>}
          {record.materialSnapshot && (
            <details className="material-disclosure">
              <summary>Conteúdo do material utilizado</summary>
              <div className="material-text">{record.materialSnapshot.content}</div>
            </details>
          )}
          <HomeworkItem record={record} onToggle={onHomework} />
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
      <section className="preparation-panel">
        <div className="preparation-heading">
          <h3>Preparação da aula</h3>
          {!record && !canRecord && (
            <button className="button small" onClick={onPlan}>
              {plan ? 'Editar preparação' : 'Preparar aula'}
            </button>
          )}
        </div>
        {plan ? (
          <>
            {material && (
              <details className="material-disclosure">
                <summary>
                  Material planejado: {material.title} · {material.level}
                </summary>
                <div className="material-text">{material.content}</div>
              </details>
            )}
            {plan.notes && <p className="record-body">{plan.notes}</p>}
          </>
        ) : (
          <p className="muted">Nenhum material ou anotação planejados para esta aula.</p>
        )}
        <h4>Último conteúdo</h4>
        {context.lastAttended ? (
          <>
            <p className="muted form-hint">
              {formatDate(context.lastAttended.lesson.date)} ·{' '}
              {lessonTime(context.lastAttended.lesson.hour)}
            </p>
            <p className="record-body">{context.lastAttended.record.content}</p>
          </>
        ) : (
          <p className="muted">Ainda não há uma aula anterior com conteúdo registrado.</p>
        )}
        <h4>Homework pendente</h4>
        {context.pending.length ? (
          context.pending.map(({ record: previous, lesson: source }) => (
            <div key={previous.id}>
              <p className="muted form-hint">Passado em {formatDate(source.date)}</p>
              <HomeworkItem record={previous} onToggle={onHomework} />
            </div>
          ))
        ) : (
          <p className="muted">Nenhum homework anterior pendente.</p>
        )}
      </section>
      {student.meetingUrl && (
        <a
          className="button meeting-link"
          href={student.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir link da aula
          <Icon name="arrow" size={16} />
        </a>
      )}
      <div className="form-actions">
        {!record && !hasLessonStarted(lesson.date, lesson.hour, now) && (
          <button className="button" onClick={onReschedule}>
            Remarcar aula
          </button>
        )}
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
