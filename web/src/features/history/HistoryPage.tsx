import { useState } from 'react'
import type { Lesson, Workspace } from '../../domain/models'
import { ATTENDANCE } from '../../domain/models'
import { formatDate, formatTimestamp, lessonTime } from '../../domain/dates'
import { matchesSearch } from '../../domain/students'
import { Icon } from '../../shared/Icon'
import { EmptyState } from '../../shared/Modal'
import { HomeworkItem } from './HomeworkItem'

export function HistoryPage({
  state,
  studentFilter,
  onFilter,
  onEdit,
  onHomework,
}: {
  state: Workspace
  studentFilter: string
  onFilter: (id: string) => void
  onEdit: (lesson: Lesson) => void
  onHomework: (id: string, corrected: boolean) => void
}) {
  const [search, setSearch] = useState('')
  const entries = state.records
    .map((record) => ({
      record,
      lesson: state.lessons.find((lesson) => lesson.id === record.lessonId)!,
    }))
    .filter(
      ({ record, lesson }) =>
        (!studentFilter || lesson.studentId === studentFilter) &&
        matchesSearch(
          `${record.studentName} ${record.content} ${record.material} ${record.reason} ${record.homework?.description ?? ''} ${record.materialSnapshot?.content ?? ''}`,
          search,
        ),
    )
    .sort((a, b) => b.lesson.date.localeCompare(a.lesson.date) || b.lesson.hour - a.lesson.hour)
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CADA ENCONTRO CONTA</p>
          <h1>Histórico de aulas</h1>
          <p className="muted">O que foi estudado, para continuar de onde parou.</p>
        </div>
        <span className="history-count">
          {entries.length} {entries.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>
      <div className="list-toolbar history-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            aria-label="Buscar no histórico"
            placeholder="Buscar por conteúdo, material ou aluno…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="filter-label">
          <span>Aluno</span>
          <select
            className="filter-select"
            aria-label="Filtrar histórico por aluno"
            value={studentFilter}
            onChange={(event) => onFilter(event.target.value)}
          >
            <option value="">Todos os alunos</option>
            {[...state.students]
              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
              .map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      {entries.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="A próxima história começa em uma aula"
            description="Nenhum registro corresponde a este filtro. Lance uma aula pela agenda ou ajuste sua busca."
          />
        </div>
      ) : (
        <div className="history-list">
          {entries.map(({ record, lesson }) => (
            <article className="history-card" key={record.id}>
              <div className="history-date">
                <strong>{formatDate(lesson.date, { day: '2-digit' })}</strong>
                <span>{formatDate(lesson.date, { month: 'short' }).replace('.', '')}</span>
                <small>{lesson.date.slice(0, 4)}</small>
              </div>
              <div className="history-content">
                <div className="history-card-heading">
                  <h2>{record.studentName}</h2>
                  <span className="level-badge">{record.level}</span>
                  <span
                    className={`status-badge ${record.attendance === 'attended' ? 'done' : 'absent'}`}
                  >
                    {ATTENDANCE[record.attendance]}
                  </span>
                </div>
                <p className="record-time">
                  <Icon name="clock" size={13} />
                  {lessonTime(lesson.hour)} · Horário de Brasília
                </p>
                {record.material && (
                  <p className="record-material">
                    <Icon name="book" size={14} />
                    {record.material}
                  </p>
                )}
                <p className="record-body">{record.content || 'Sem observações adicionais.'}</p>
                {record.materialSnapshot && (
                  <details className="material-disclosure">
                    <summary>
                      Conteúdo do material utilizado · {record.materialSnapshot.level}
                    </summary>
                    <div className="material-text">{record.materialSnapshot.content}</div>
                  </details>
                )}
                <HomeworkItem record={record} onToggle={onHomework} />
                {record.reason && <p className="record-reason">Motivo: {record.reason}</p>}
                <p className="record-updated">
                  Última atualização: {formatTimestamp(record.updatedAt)}
                </p>
              </div>
              <button
                className="button small"
                onClick={() => onEdit(lesson)}
                aria-label={`Editar registro de ${record.studentName} em ${formatDate(lesson.date)}`}
              >
                <Icon name="edit" size={14} /> Editar
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
