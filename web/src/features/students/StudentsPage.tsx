import { useState } from 'react'
import type { Student, Workspace } from '../../domain/models'
import { formatDate, formatHour, hasLessonEnded } from '../../domain/dates'
import { matchesSearch } from '../../domain/students'
import { Icon } from '../../shared/Icon'
import { EmptyState } from '../../shared/Modal'

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export function StudentsPage({
  state,
  onNew,
  onEdit,
  onHistory,
}: {
  state: Workspace
  onNew: () => void
  onEdit: (student: Student) => void
  onHistory: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const students = state.students
    .filter((student) => matchesSearch(student.name, search))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CADA ALUNO, UMA JORNADA</p>
          <h1>Seus alunos</h1>
          <p className="muted">Conheça o contexto e acompanhe cada próximo passo.</p>
        </div>
        <button className="button primary" onClick={onNew}>
          <Icon name="plus" size={17} /> Novo aluno
        </button>
      </div>
      <div className="list-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            aria-label="Buscar aluno"
            placeholder="Buscar aluno por nome…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="result-count">
          {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
        </span>
      </div>
      {students.length === 0 ? (
        <div className="panel">
          <EmptyState
            title={search ? 'Nenhum aluno encontrado' : 'Sua primeira jornada começa aqui'}
            description={
              search
                ? 'Tente buscar por outro nome.'
                : 'Cadastre um aluno para começar a organizar suas aulas.'
            }
          />
        </div>
      ) : (
        <div className="student-grid">
          {students.map((student, index) => {
            const upcoming = state.lessons
              .filter(
                (lesson) =>
                  lesson.studentId === student.id && !hasLessonEnded(lesson.date, lesson.hour),
              )
              .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour)[0]
            const records = state.records.filter((record) =>
              state.lessons.some(
                (lesson) => lesson.id === record.lessonId && lesson.studentId === student.id,
              ),
            )
            return (
              <article className="student-card" key={student.id}>
                <div className="student-card-top">
                  <span className={`avatar avatar-${index % 4}`}>{initials(student.name)}</span>
                  <span className={`level-badge level-${student.level[0]}`}>{student.level}</span>
                  <button
                    className="icon-button"
                    onClick={() => onEdit(student)}
                    aria-label={`Editar ${student.name}`}
                  >
                    <Icon name="edit" size={15} />
                  </button>
                </div>
                <h2>{student.name}</h2>
                <p className="student-occupation">
                  {student.occupation || 'Ocupação não informada'}
                </p>
                <p className="student-interests">
                  {student.interests || 'Adicione interesses para personalizar as próximas aulas.'}
                </p>
                <div className="student-next">
                  <Icon name="calendar" size={15} />
                  <div>
                    <small>PRÓXIMA AULA</small>
                    <strong>
                      {upcoming
                        ? `${formatDate(upcoming.date)} · ${formatHour(upcoming.hour)}`
                        : 'Ainda não agendada'}
                    </strong>
                  </div>
                </div>
                <div className="student-card-footer">
                  <span>
                    {records.length} {records.length === 1 ? 'registro' : 'registros'}
                  </span>
                  <button className="text-button" onClick={() => onHistory(student.id)}>
                    Ver histórico <Icon name="arrow" size={15} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
