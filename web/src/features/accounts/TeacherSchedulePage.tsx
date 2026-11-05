import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { pilotRequest } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'
import { formatDate, hasLessonStarted, lessonTime } from '../../domain/dates'
import { blockSchema, lessonSchema, seriesSchema, studentSchema } from '../../domain/models'
import type { Lesson, ScheduleBlock } from '../../domain/models'
import { FormError, Modal } from '../../shared/Modal'
import { AgendaPage } from '../agenda/AgendaPage'
import { BlockDetails } from '../agenda/BlockDetails'
import { BlockForm } from '../agenda/BlockForm'
import { LessonForm } from '../agenda/LessonForm'
import type { LessonPrefill } from '../agenda/LessonForm'
import { RescheduleForm } from '../agenda/RescheduleForm'

const scheduleSchema = z.object({
  students: studentSchema.pick({ id: true, name: true, level: true, meetingUrl: true }).array(),
  lessons: lessonSchema.array(),
  series: seriesSchema.array(),
  blocks: blockSchema.array(),
})

type Editor =
  | { kind: 'new' | 'block'; prefill: LessonPrefill }
  | { kind: 'lesson' | 'reschedule'; lesson: Lesson }
  | { kind: 'block-details'; block: ScheduleBlock }
  | null

export function TeacherSchedulePage({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [schedule, setSchedule] = useState<z.infer<typeof scheduleSchema>>()
  const [editor, setEditor] = useState<Editor>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    setSchedule(undefined)
    setError('')
    setNotice('')
    pilotRequest(client, profile.userId, '/api/agenda', { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setSchedule(scheduleSchema.parse(data))
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Não foi possível carregar sua agenda.')
      })
    return () => controller.abort()
  }, [client, profile.userId, refresh])

  function reload() {
    setEditor(null)
    setRefresh((value) => value + 1)
  }
  async function save(
    path: string,
    message: string,
    body?: unknown,
    method: 'POST' | 'DELETE' = 'POST',
  ) {
    const confirmed = scheduleSchema.parse(
      await pilotRequest(client, profile.userId, `/api/agenda${path}`, { body, method }),
    )
    setSchedule(confirmed)
    setEditor(null)
    setNotice(message)
  }

  if (error)
    return (
      <div className="panel">
        <FormError message={error} />
        <button className="button" onClick={reload}>
          Tentar novamente
        </button>
      </div>
    )
  if (!schedule) return <p role="status">Carregando agenda…</p>

  const close = () => setEditor(null)
  const selectedStudent =
    editor?.kind === 'lesson' &&
    schedule.students.find((student) => student.id === editor.lesson.studentId)

  return (
    <section aria-label="Agenda da professora">
      {notice && (
        <p className="auth-notice" role="status">
          {notice}
        </p>
      )}
      <AgendaPage
        state={{ ...schedule, records: [] }}
        now={now}
        showRecords={false}
        onRefresh={reload}
        onNew={(prefill) => setEditor({ kind: 'new', prefill })}
        onOpen={(lesson) => setEditor({ kind: 'lesson', lesson })}
        onBlock={(prefill) => setEditor({ kind: 'block', prefill })}
        onOpenBlock={(block) => setEditor({ kind: 'block-details', block })}
      />
      {editor?.kind === 'new' && (
        <LessonForm
          students={schedule.students}
          prefill={editor.prefill}
          onClose={close}
          onSave={(input) => save('/lessons', 'Aula agendada.', input)}
        />
      )}
      {editor?.kind === 'block' && (
        <BlockForm
          prefill={editor.prefill}
          onClose={close}
          onSave={(input) => save('/blocks', 'Bloqueio salvo na agenda.', input)}
        />
      )}
      {editor?.kind === 'block-details' && (
        <BlockDetails
          block={editor.block}
          onClose={close}
          onRemove={() =>
            save(
              `/blocks/${encodeURIComponent(editor.block.id)}`,
              'Bloqueio removido.',
              undefined,
              'DELETE',
            )
          }
        />
      )}
      {editor?.kind === 'lesson' && selectedStudent && (
        <Modal
          title={selectedStudent.name}
          subtitle={`${formatDate(editor.lesson.date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} · ${lessonTime(editor.lesson.hour)}`}
          onClose={close}
        >
          <div className="lesson-detail-tags">
            <span className="level-badge">{selectedStudent.level}</span>
            <span className="neutral-badge">
              {editor.lesson.seriesId ? 'Semanal' : 'Aula individual'}
            </span>
          </div>
          {selectedStudent.meetingUrl && (
            <a
              className="button meeting-link"
              href={selectedStudent.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir link da aula
            </a>
          )}
          <div className="form-actions">
            {!hasLessonStarted(editor.lesson.date, editor.lesson.hour, now) && (
              <button
                className="button primary"
                onClick={() => setEditor({ kind: 'reschedule', lesson: editor.lesson })}
              >
                Remarcar aula
              </button>
            )}
            <button className="button" onClick={close}>
              Fechar
            </button>
          </div>
        </Modal>
      )}
      {editor?.kind === 'reschedule' && (
        <RescheduleForm
          lesson={editor.lesson}
          onClose={close}
          onSave={(target, scope) =>
            save(
              '/reschedules',
              scope === 'single'
                ? 'Aula remarcada.'
                : 'Horário atualizado para esta aula e as próximas.',
              {
                ...target,
                scope,
                lessonId: editor.lesson.id,
                expectedDate: editor.lesson.date,
                expectedHour: editor.lesson.hour,
              },
            )
          }
        />
      )}
    </section>
  )
}
