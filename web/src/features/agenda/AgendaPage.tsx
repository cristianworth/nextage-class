import { useState } from 'react'
import {
  addDays,
  formatDate,
  formatHour,
  hasLessonEnded,
  HOURS,
  lessonTime,
  referenceClock,
  weekDays,
  weekStart,
} from '../../domain/dates'
import type { Lesson, ScheduleBlock, Workspace } from '../../domain/models'
import { blockAt, lessonsInRange, upcomingLessons } from '../../domain/agenda'
import { Icon } from '../../shared/Icon'
import { EmptyState } from '../../shared/Modal'
import type { LessonPrefill } from './LessonForm'

export function AgendaPage({
  state,
  now,
  onNew,
  onOpen,
  onBlock,
  onOpenBlock,
}: {
  state: Workspace
  now: Date
  onNew: (prefill: LessonPrefill) => void
  onOpen: (lesson: Lesson) => void
  onBlock: (prefill: LessonPrefill) => void
  onOpenBlock: (block: ScheduleBlock) => void
}) {
  const today = referenceClock(now).date
  const [week, setWeek] = useState(weekStart(today))
  const [selectedDay, setSelectedDay] = useState(
    weekDays(today).includes(today) ? today : weekStart(today),
  )
  const days = weekDays(week)
  const weekLessons = lessonsInRange(state, days[0], days[4])
  const recordsByLesson = new Map(state.records.map((record) => [record.lessonId, record]))
  const pending = weekLessons.filter(
    (lesson) => hasLessonEnded(lesson.date, lesson.hour, now) && !recordsByLesson.has(lesson.id),
  ).length
  const upcoming = upcomingLessons(state, now)

  function moveWeek(offset: number) {
    const next = addDays(week, offset * 7)
    setWeek(next)
    setSelectedDay(next)
  }
  function currentWeek() {
    setWeek(weekStart(today))
    setSelectedDay(weekDays(today).includes(today) ? today : weekStart(today))
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">UM PRÓXIMO PASSO, A CADA AULA</p>
          <h1>Sua semana de aulas</h1>
          <p className="muted">Agenda organizada. Mais espaço para ensinar.</p>
        </div>
        <div className="heading-actions">
          <button className="button" onClick={() => onBlock({ date: selectedDay })}>
            Bloquear horário
          </button>
          <button
            className="button primary"
            onClick={() => onNew({ date: selectedDay })}
            disabled={!state.students.length}
          >
            <Icon name="plus" size={17} /> Nova aula
          </button>
        </div>
      </div>
      <div className="stats-grid">
        <Stat icon="calendar" value={weekLessons.length} label="Aulas nesta semana" tone="green" />
        <Stat
          icon="users"
          value={state.students.length}
          label="Alunos na sua jornada"
          tone="sand"
        />
        <Stat icon="book" value={pending} label="Aulas para registrar" tone="lavender" />
      </div>
      <section className="calendar-panel panel" aria-label="Agenda semanal">
        <div className="calendar-toolbar">
          <div className="week-navigation">
            <button
              className="icon-button"
              aria-label="Semana anterior"
              onClick={() => moveWeek(-1)}
            >
              <Icon name="left" size={16} />
            </button>
            <button className="icon-button" aria-label="Próxima semana" onClick={() => moveWeek(1)}>
              <Icon name="right" size={16} />
            </button>
            <h2>
              {formatDate(days[0], { day: '2-digit' })} –{' '}
              {formatDate(days[4], { day: '2-digit', month: 'long', year: 'numeric' })}
            </h2>
            <button className="button small" onClick={currentWeek}>
              Hoje
            </button>
          </div>
          <span className="timezone-label">
            <Icon name="clock" size={13} /> Horário de Brasília
          </span>
        </div>
        <div className="mobile-days" aria-label="Dia da agenda">
          {days.map((day) => (
            <button
              key={day}
              aria-pressed={selectedDay === day}
              onClick={() => setSelectedDay(day)}
              className={selectedDay === day ? 'selected' : ''}
            >
              <span>{formatDate(day, { weekday: 'short' }).replace('.', '')}</span>
              <strong>{day.slice(-2)}</strong>
            </button>
          ))}
        </div>
        <div className="calendar-scroll">
          <table className="calendar-table">
            <thead>
              <tr>
                <th scope="col" className="time-heading">
                  HORÁRIO
                </th>
                {days.map((day) => (
                  <th
                    scope="col"
                    key={day}
                    className={`${day === today ? 'today-column' : ''} ${day === selectedDay ? 'mobile-selected' : 'mobile-hidden'}`}
                  >
                    <span>
                      {formatDate(day, { weekday: 'short' }).replace('.', '').toUpperCase()}
                    </span>
                    <strong className={day === today ? 'today-number' : ''}>{day.slice(-2)}</strong>
                    {day === today && <small>HOJE</small>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <th scope="row">
                    <span>{formatHour(hour)}</span>
                    <small>{String(hour).padStart(2, '0')}:55</small>
                  </th>
                  {days.map((day) => {
                    const lesson = weekLessons.find(
                      (item) => item.date === day && item.hour === hour,
                    )
                    const studentIndex = lesson
                      ? state.students.findIndex((student) => student.id === lesson.studentId)
                      : -1
                    const student = state.students[studentIndex]
                    const record = lesson ? recordsByLesson.get(lesson.id) : undefined
                    const block = blockAt(state, day, hour)
                    return (
                      <td
                        key={day}
                        className={`${day === today ? 'today-column' : ''} ${day === selectedDay ? 'mobile-selected' : 'mobile-hidden'}`}
                      >
                        {lesson && student ? (
                          <button
                            className={`lesson-block tone-${studentIndex % 4} ${record ? 'recorded' : ''}`}
                            onClick={() => onOpen(lesson)}
                            aria-label={`${student.name}, ${formatDate(day)}, ${lessonTime(hour)}`}
                          >
                            <span className="lesson-topline">
                              {student.level}
                              {lesson.seriesId ? ' · Semanal' : ''}
                              <span>
                                {record ? (
                                  <Icon name="check" size={12} />
                                ) : (
                                  <Icon name="right" size={12} />
                                )}
                              </span>
                            </span>
                            <strong>{student.name}</strong>
                            <span className="lesson-bottomline">
                              {record ? 'Registrada' : lessonTime(hour)}
                            </span>
                          </button>
                        ) : block ? (
                          <button
                            className="lesson-block blocked-block"
                            onClick={() => onOpenBlock(block)}
                            aria-label={`${block.title}, ${formatDate(day)} às ${formatHour(hour)}`}
                          >
                            <span className="lesson-topline">
                              {block.repeat === 'weekly' ? 'Bloqueio semanal' : 'Bloqueio'}
                            </span>
                            <strong>{block.title}</strong>
                            <span className="lesson-bottomline">
                              {formatHour(block.startHour)} – {formatHour(block.endHour)}
                            </span>
                          </button>
                        ) : (
                          <button
                            className="empty-slot"
                            disabled={!state.students.length}
                            onClick={() => onNew({ date: day, hour })}
                            aria-label={`Agendar ${formatDate(day)} às ${formatHour(hour)}`}
                          >
                            <Icon name="plus" size={14} />
                            <span>Agendar</span>
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="calendar-footer">
          <span>
            <span className="legend-dot" /> Aula agendada{' '}
            <span className="legend-check">
              <Icon name="check" size={11} />
            </span>{' '}
            Aula registrada
          </span>
          <span>55 min de aula · 5 min de intervalo</span>
        </div>
      </section>
      <section className="upcoming-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CONTINUE DE ONDE PAROU</p>
            <h2>Próximas aulas</h2>
          </div>
          <span className="muted">Um olhar para o que vem a seguir</span>
        </div>
        {upcoming.length ? (
          <div className="upcoming-grid">
            {upcoming.map((lesson) => {
              const student = state.students.find((item) => item.id === lesson.studentId)!
              return (
                <button key={lesson.id} className="upcoming-card" onClick={() => onOpen(lesson)}>
                  <span className="upcoming-date">
                    <strong>{formatDate(lesson.date, { day: '2-digit' })}</strong>
                    <small>{formatDate(lesson.date, { month: 'short' }).replace('.', '')}</small>
                  </span>
                  <span>
                    <strong>{student.name}</strong>
                    <small>
                      {formatDate(lesson.date, { weekday: 'short' })} · {lessonTime(lesson.hour)}
                    </small>
                  </span>
                  <Icon name="arrow" size={18} />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="panel">
            <EmptyState
              title="Um espaço para a próxima aula"
              description="Use Nova aula para organizar seus próximos encontros."
            />
          </div>
        )}
      </section>
    </>
  )
}

function Stat({
  icon,
  value,
  label,
  tone,
}: {
  icon: 'calendar' | 'users' | 'book'
  value: number
  label: string
  tone: string
}) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${tone}`}>
        <Icon name={icon} size={21} />
      </span>
      <div>
        <strong>{String(value).padStart(2, '0')}</strong>
        <p>{label}</p>
      </div>
      <span className="stat-decoration">↗</span>
    </div>
  )
}
