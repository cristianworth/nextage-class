import { useState } from 'react'
import type { SchedulingRequest, Student } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import { hasLessonStarted } from '../../domain/dates'
import { EmptyState, FormError } from '../../shared/Modal'
import { RequestSummary } from './RequestSummary'
import './scheduling-requests.css'

export function TeacherRequestsPage({
  requests,
  students,
  now,
  onDecide,
}: {
  requests: SchedulingRequest[]
  students: Student[]
  now: Date
  onDecide: (id: string, decision: 'approved' | 'declined') => void
}) {
  const [filter, setFilter] = useState('pending')
  const [feedback, setFeedback] = useState<{ id: string; message: string } | null>(null)
  const [notice, setNotice] = useState('')
  const names = new Map(students.map((student) => [student.id, student.name]))
  const pendingCount = requests.filter((request) => request.status === 'pending').length
  const visible = requests
    .filter((request) => filter === 'all' || request.status === filter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
  function decide(request: SchedulingRequest, decision: 'approved' | 'declined') {
    setFeedback(null)
    setNotice('')
    try {
      onDecide(request.id, decision)
      setNotice(
        decision === 'approved'
          ? `Pedido de ${names.get(request.studentId)} aprovado. ${request.kind === 'weekly' ? 'Horário semanal confirmado' : 'Aula confirmada'} na agenda.`
          : `Pedido de ${names.get(request.studentId)} recusado. A agenda foi preservada.`,
      )
    } catch (cause) {
      setFeedback({ id: request.id, message: errorMessage(cause) })
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">COMBINE OS PRÓXIMOS ENCONTROS</p>
          <h1>Solicitações de horário</h1>
          <p className="muted">
            Cada horário tem uma decisão. Pedidos pendentes não reservam a agenda.
          </p>
        </div>
        <span className="level-badge">
          {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}
        </span>
      </div>
      <div className="list-toolbar">
        <label className="filter-label">
          Situação do pedido
          <select
            aria-label="Situação do pedido"
            className="filter-select"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value)
              setFeedback(null)
            }}
          >
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="declined">Recusados</option>
            <option value="all">Todos</option>
          </select>
        </label>
        <span className="result-count">
          {visible.length} {visible.length === 1 ? 'pedido' : 'pedidos'}
        </span>
      </div>
      {notice && (
        <p className="request-success" role="status">
          {notice}
        </p>
      )}
      {visible.length ? (
        <div className="teacher-requests-list">
          {visible.map((request) => (
            <article
              key={request.id}
              className="panel request-card"
              aria-label={`Pedido de ${names.get(request.studentId)}`}
            >
              <p className="request-student">{names.get(request.studentId)}</p>
              <RequestSummary request={request} now={now} />
              {feedback?.id === request.id && <FormError message={feedback.message} />}
              {request.status === 'pending' && (
                <div className="request-actions">
                  <button className="button" onClick={() => decide(request, 'declined')}>
                    Recusar pedido
                  </button>
                  <button
                    className="button primary"
                    disabled={hasLessonStarted(request.date, request.hour, now)}
                    onClick={() => decide(request, 'approved')}
                  >
                    Aprovar pedido
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <section className="panel">
          <EmptyState
            title={filter === 'pending' ? 'Nenhum pedido pendente' : 'Nenhum pedido nesta situação'}
            description="Os pedidos enviados pela área do aluno aparecerão aqui para sua decisão."
          />
        </section>
      )}
    </>
  )
}
