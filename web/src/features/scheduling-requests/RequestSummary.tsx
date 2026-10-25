import type { StudentRequestView } from '../../domain/scheduling-requests'
import { REQUEST_STATUS } from '../../domain/scheduling-requests'
import { formatDate, formatTimestamp, hasLessonStarted, lessonTime } from '../../domain/dates'

export function RequestSummary({ request, now }: { request: StudentRequestView; now: Date }) {
  return (
    <>
      <div className="request-heading">
        <h3>
          {request.kind === 'weekly' ? 'Toda ' : ''}
          {formatDate(request.date, { weekday: 'long' })}
        </h3>
        <span
          className={`status-badge ${request.status === 'approved' ? 'done' : request.status === 'declined' ? 'absent' : ''}`}
        >
          {REQUEST_STATUS[request.status]}
        </span>
      </div>
      <p className="request-time">{lessonTime(request.hour)}</p>
      <p className="muted form-hint">
        {request.kind === 'weekly' ? 'A partir de ' : ''}
        {formatDate(request.date, { day: '2-digit', month: 'long', year: 'numeric' })}
        {request.kind === 'weekly' &&
          (request.endDate
            ? ` · até ${formatDate(request.endDate, { day: '2-digit', month: 'long', year: 'numeric' })}`
            : ' · sem data final')}
      </p>
      <p className="muted form-hint">
        Enviado em {formatTimestamp(request.createdAt)}
        {request.decidedAt && ` · decisão em ${formatTimestamp(request.decidedAt)}`}
      </p>
      {request.status === 'pending' && hasLessonStarted(request.date, request.hour, now) && (
        <p className="request-expired">
          O primeiro horário já começou. Combine um novo início com a professora.
        </p>
      )}
    </>
  )
}
