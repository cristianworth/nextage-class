import { useState } from 'react'
import type { StudentOverview } from '../../domain/student-overview'
import type { StudentLibraryView } from '../../domain/student-library'
import { StudentLibrary } from './StudentLibrary'
import { ATTENDANCE } from '../../domain/models'
import { formatDate, formatTimestamp, hasLessonStarted, lessonTime } from '../../domain/dates'
import { matchesSearch } from '../../domain/students'
import { Icon } from '../../shared/Icon'
import { EmptyState } from '../../shared/Modal'
import './student-portal.css'

export function StudentPortal({
  view,
  library,
  now,
}: {
  view: StudentOverview
  library: StudentLibraryView
  now: Date
}) {
  const [page, setPage] = useState('agenda')
  const [search, setSearch] = useState('')
  const history = view.history.filter((entry) =>
    matchesSearch(
      `${entry.material} ${entry.materialSnapshot?.title ?? ''} ${entry.materialSnapshot?.content ?? ''} ${entry.homework?.description ?? ''}`,
      search,
    ),
  )
  return (
    <section className="student-surface" aria-label="Área do aluno">
      <header className="student-heading">
        <div>
          <p className="eyebrow">SEU ESPAÇO DE APRENDIZADO</p>
          <h1>Olá, {view.student.name.split(' ')[0]}.</h1>
          <p className="muted">
            Seus próximos encontros e o material das suas aulas, em um só lugar.
          </p>
        </div>
        <div className="student-identity">
          <span className="avatar">{view.student.name.slice(0, 1)}</span>
          <div>
            <strong>{view.student.name}</strong>
            <span className="level-badge">{view.student.level}</span>
          </div>
        </div>
      </header>
      <nav className="student-navigation" aria-label="Navegação do aluno">
        <button
          className={`button ${page === 'agenda' ? 'primary' : ''}`}
          aria-current={page === 'agenda' ? 'page' : undefined}
          onClick={() => setPage('agenda')}
        >
          <Icon name="calendar" size={17} />
          Minhas aulas
        </button>
        <button
          className={`button ${page === 'history' ? 'primary' : ''}`}
          aria-current={page === 'history' ? 'page' : undefined}
          onClick={() => setPage('history')}
        >
          <Icon name="book" size={17} />
          Meu histórico
        </button>
        <button
          className={`button ${page === 'library' ? 'primary' : ''}`}
          aria-current={page === 'library' ? 'page' : undefined}
          onClick={() => setPage('library')}
        >
          <Icon name="library" size={17} />
          Meu acervo
        </button>
      </nav>
      {page === 'agenda' ? (
        <div className="student-overview-grid">
          <section className="panel student-panel">
            <div className="student-section-heading">
              <h2>Próximas aulas</h2>
              <Icon name="calendar" />
            </div>
            <p className="muted form-hint">Até seis próximos encontros · Horário de Brasília</p>
            {view.upcoming.length ? (
              <div className="student-lesson-list">
                {view.upcoming.map((lesson) => (
                  <article className="student-lesson" key={lesson.id}>
                    <div className="student-date">
                      <strong>{formatDate(lesson.date, { day: '2-digit' })}</strong>
                      <span>{formatDate(lesson.date, { month: 'short' })}</span>
                    </div>
                    <div>
                      <h3>{formatDate(lesson.date, { weekday: 'long' })}</h3>
                      <p>{lessonTime(lesson.hour)}</p>
                      <small>{formatDate(lesson.date, { year: 'numeric' })}</small>
                    </div>
                    {hasLessonStarted(lesson.date, lesson.hour, now) && (
                      <span className="status-badge done">Em andamento</span>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhuma próxima aula"
                description="Os próximos encontros aparecerão aqui quando forem agendados."
              />
            )}
            {!!view.upcoming.length &&
              (view.meetingUrl ? (
                <a
                  className="button primary student-meeting"
                  href={view.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="arrow" size={17} />
                  Abrir link da aula
                </a>
              ) : (
                <p className="student-note">
                  O link da aula ainda não foi informado pela professora.
                </p>
              ))}
          </section>
          <section className="panel student-panel">
            <div className="student-section-heading">
              <h2>Homework pendente</h2>
              <span className="level-badge">{view.pendingHomework.length}</span>
            </div>
            <p className="muted form-hint">Tarefas registradas pela professora.</p>
            {view.pendingHomework.length ? (
              <div className="student-homework-list">
                {view.pendingHomework.map((task) => (
                  <article className="homework-item" key={task.id}>
                    <p className="eyebrow">AULA DE {formatDate(task.date)}</p>
                    <p className="record-body">{task.description}</p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum homework pendente"
                description="Você pode consultar as tarefas anteriores no histórico."
              />
            )}
          </section>
        </div>
      ) : page === 'library' ? (
        <StudentLibrary view={library} />
      ) : (
        <section aria-label="Histórico do aluno">
          <div className="student-section-heading">
            <h2>Meu histórico</h2>
            <span className="result-count">
              {view.history.length} {view.history.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <label className="search-field student-search">
            <Icon name="search" size={17} />
            <input
              aria-label="Buscar material ou homework"
              placeholder="Buscar material ou homework…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {history.length ? (
            <div className="student-history-list">
              {history.map((entry) => (
                <article className="panel student-record" key={entry.id}>
                  <div className="student-record-heading">
                    <h3>
                      {formatDate(entry.date, { day: '2-digit', month: 'long', year: 'numeric' })}
                    </h3>
                    <span
                      className={`status-badge ${entry.attendance === 'attended' ? 'done' : 'absent'}`}
                    >
                      {ATTENDANCE[entry.attendance]}
                    </span>
                    <span className="level-badge">{entry.level}</span>
                  </div>
                  <p className="muted form-hint">{lessonTime(entry.hour)} · Horário de Brasília</p>
                  {entry.materialSnapshot ? (
                    <div className="student-used-material">
                      <p className="eyebrow">MATERIAL UTILIZADO</p>
                      <h4>
                        {entry.materialSnapshot.sequenceTitle &&
                          `${entry.materialSnapshot.sequenceTitle} · `}
                        {entry.materialSnapshot.lessonNumber
                          ? `Unidade ${entry.materialSnapshot.lessonNumber} — `
                          : ''}
                        {entry.materialSnapshot.title}
                      </h4>
                      <details className="material-disclosure">
                        <summary>Ler material desta aula</summary>
                        <div className="material-text">{entry.materialSnapshot.content}</div>
                      </details>
                    </div>
                  ) : (
                    <p className="student-note">
                      {entry.material
                        ? `Material utilizado: ${entry.material}`
                        : 'Sem material registrado.'}
                    </p>
                  )}
                  {entry.homework ? (
                    <div className="homework-item">
                      <p className="eyebrow">
                        HOMEWORK · {entry.homework.correctedAt ? 'CORRIGIDO' : 'PENDENTE'}
                      </p>
                      <p className="record-body">{entry.homework.description}</p>
                      {entry.homework.correctedAt && (
                        <p className="muted form-hint">
                          Corrigido em {formatTimestamp(entry.homework.correctedAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="muted form-hint">Sem homework registrado nesta aula.</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="panel">
              <EmptyState
                title={
                  search
                    ? 'Nenhum resultado encontrado'
                    : 'Seu histórico começa com a primeira aula'
                }
                description={
                  search
                    ? 'Tente outro material ou tarefa.'
                    : 'Os materiais e tarefas aparecerão aqui após o lançamento pela professora.'
                }
              />
            </div>
          )}
        </section>
      )}
    </section>
  )
}
