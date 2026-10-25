import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SchedulingRequestInput } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import type { StudentRequestView } from '../../domain/scheduling-requests'
import {
  formatDate,
  isValidDate,
  isWeekday,
  lessonTime,
  nextWeekday,
  referenceClock,
} from '../../domain/dates'
import { EmptyState, FormError } from '../../shared/Modal'
import { Icon } from '../../shared/Icon'
import { RequestSummary } from './RequestSummary'
import './scheduling-requests.css'

export type StudentRequestActions = {
  items: StudentRequestView[]
  availableHours: (input: Omit<SchedulingRequestInput, 'hour'>) => number[]
  onSubmit: (input: SchedulingRequestInput) => void
}

export function StudentRequests({
  items,
  availableHours,
  onSubmit,
  now,
}: StudentRequestActions & { now: Date }) {
  const [kind, setKind] = useState<'once' | 'weekly'>('once')
  const [date, setDate] = useState(() => nextWeekday(referenceClock(now).date))
  const [endDate, setEndDate] = useState('')
  const [hour, setHour] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const period = { kind, date, endDate: kind === 'weekly' && endDate ? endDate : null }
  const hours = availableHours(period)
  const validDay = isValidDate(date) && isWeekday(date) && date >= referenceClock(now).date
  const validEnd = !period.endDate || (isValidDate(period.endDate) && period.endDate >= date)
  const selectedHour = hour !== '' && hours.includes(Number(hour)) ? hour : ''
  const pendingCount = items.filter((request) => request.status === 'pending').length

  function changed() {
    setError('')
    setNotice('')
    setHour('')
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      onSubmit({ ...period, hour: Number(selectedHour) })
      setNotice(
        'Pedido enviado! Ele aguarda aprovação e ainda não reserva o horário. Você pode pedir outro dia ou horário.',
      )
      setHour('')
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }

  return (
    <section aria-label="Solicitações do aluno">
      <div className="student-section-heading">
        <h2>Solicitar horário</h2>
        <Icon name="clock" />
      </div>
      <p className="muted request-intro">
        Escolha uma aula avulsa ou um horário semanal. Para combinar vários dias, envie um pedido
        para cada horário.
      </p>
      <div className="requests-grid">
        <form className="panel request-form" onSubmit={submit}>
          <label className="field">
            Tipo de pedido
            <select
              aria-label="Tipo de pedido"
              value={kind}
              onChange={(event) => {
                changed()
                setKind(event.target.value as 'once' | 'weekly')
              }}
            >
              <option value="once">Aula avulsa</option>
              <option value="weekly">Horário semanal</option>
            </select>
          </label>
          <label className="field">
            <span>
              {kind === 'weekly' ? 'Primeira aula' : 'Data da aula'}{' '}
              <span className="required-marker" aria-hidden="true">
                *
              </span>
            </span>
            <input
              aria-label={kind === 'weekly' ? 'Primeira aula' : 'Data da aula'}
              type="date"
              required
              min={referenceClock(now).date}
              value={date}
              onChange={(event) => {
                changed()
                setDate(event.target.value)
              }}
            />
          </label>
          {kind === 'weekly' && (
            <>
              {validDay && (
                <p className="student-note">
                  Repete toda {formatDate(date, { weekday: 'long' })} no mesmo horário.
                </p>
              )}
              <label className="field">
                Repetir até
                <input
                  aria-label="Repetir até"
                  type="date"
                  min={date}
                  value={endDate}
                  onChange={(event) => {
                    changed()
                    setEndDate(event.target.value)
                  }}
                />
                <small className="muted">Deixe em branco para continuar sem data final.</small>
              </label>
            </>
          )}
          {!validDay ? (
            <p className="student-note">Escolha uma data de segunda a sexta, a partir de hoje.</p>
          ) : !validEnd ? (
            <p className="student-note">O término deve ser igual ou posterior à primeira aula.</p>
          ) : !hours.length ? (
            <p className="student-note" role="status">
              Nenhum horário livre nesse período. Tente outra data ou, para uma aula avulsa, mude o
              tipo de pedido.
            </p>
          ) : null}
          <label className="field">
            <span>
              Horário disponível{' '}
              <span className="required-marker" aria-hidden="true">
                *
              </span>
            </span>
            <select
              aria-label="Horário disponível"
              required
              value={selectedHour}
              disabled={!hours.length}
              onChange={(event) => {
                setError('')
                setNotice('')
                setHour(event.target.value)
              }}
            >
              <option value="">Selecione o horário</option>
              {hours.map((value) => (
                <option key={value} value={value}>
                  {lessonTime(value)}
                </option>
              ))}
            </select>
          </label>
          <div className="info-note">
            <Icon name="info" size={18} />
            <p>
              Horário de Brasília · 55 minutos de aula.
              <br />
              <span>
                O pedido só entra na agenda após aprovação da professora. Pedidos pendentes não
                reservam horário.
              </span>
            </p>
          </div>
          <FormError message={error} />
          {notice && (
            <p className="request-success" role="status">
              {notice}
            </p>
          )}
          <button className="button primary" type="submit" disabled={!selectedHour}>
            Enviar pedido
          </button>
        </form>
        <section aria-label="Meus pedidos">
          <div className="student-section-heading">
            <h2>Meus pedidos</h2>
            <span className="result-count">
              {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}
            </span>
          </div>
          {items.length ? (
            <div className="request-list">
              {items.map((request) => (
                <article key={request.id} className="panel request-card">
                  <RequestSummary request={request} now={now} />
                  {request.status === 'approved' && (
                    <p className="student-note">Confira o horário vigente em Minhas aulas.</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="panel">
              <EmptyState
                title="Nenhum pedido por enquanto"
                description="Seus pedidos e as decisões da professora aparecerão aqui."
              />
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
