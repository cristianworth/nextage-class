import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { pilotRequest } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'
import { formatDate, hasLessonEnded, hasLessonStarted, lessonTime } from '../../domain/dates'
import {
  blockSchema,
  bookSchema,
  lessonSchema,
  materialSchema,
  seriesSchema,
  studentSchema,
} from '../../domain/models'
import type { Lesson, ScheduleBlock } from '../../domain/models'
import { FormError, Modal } from '../../shared/Modal'
import { AgendaPage } from '../agenda/AgendaPage'
import { BlockDetails } from '../agenda/BlockDetails'
import { BlockForm } from '../agenda/BlockForm'
import { LessonForm } from '../agenda/LessonForm'
import type { LessonPrefill } from '../agenda/LessonForm'
import { RescheduleForm } from '../agenda/RescheduleForm'
import { pilotRecordsSchema, PilotHomeworkItem, TeacherRecordForm } from './TeacherRecords'
import type { PilotRecord } from './TeacherRecords'
import { pendingHomework, previousAttendedRecord } from './pilot-lesson-context'
import { pilotPlansSchema, TeacherPlanForm } from './TeacherPlanForm'
import type { PilotPlan } from './TeacherPlanForm'
import { pilotCourseSuggestion } from './pilot-course-progress'
import { materialLabel } from '../../domain/materials'

const scheduleSchema = z.object({
  students: studentSchema
    .pick({ id: true, name: true, level: true, meetingUrl: true, primaryBookId: true })
    .array(),
  lessons: lessonSchema.array(),
  series: seriesSchema.array(),
  blocks: blockSchema.array(),
})

type Editor =
  | { kind: 'new' | 'block'; prefill: LessonPrefill }
  | { kind: 'lesson' | 'reschedule' | 'record' | 'plan'; lesson: Lesson }
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
  const [records, setRecords] = useState<PilotRecord[]>([])
  const [plans, setPlans] = useState<PilotPlan[]>([])
  const [catalog, setCatalog] = useState<{
    books: z.infer<typeof bookSchema>[]
    materials: z.infer<typeof materialSchema>[]
  }>({ books: [], materials: [] })
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
    Promise.all([
      pilotRequest(client, profile.userId, '/api/agenda', { signal: controller.signal }),
      pilotRequest(client, profile.userId, '/api/lesson-records', { signal: controller.signal }),
      pilotRequest(client, profile.userId, '/api/lesson-plans', { signal: controller.signal }),
      pilotRequest(client, profile.userId, '/api/catalog', { signal: controller.signal }),
    ])
      .then(([data, saved, prepared, content]) => {
        if (!controller.signal.aborted) {
          setSchedule(scheduleSchema.parse(data))
          setRecords(pilotRecordsSchema.parse(saved))
          setPlans(pilotPlansSchema.parse(prepared))
          setCatalog(
            z
              .object({ books: bookSchema.array(), materials: materialSchema.array() })
              .parse(content),
          )
        }
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
    (editor?.kind === 'lesson' || editor?.kind === 'record' || editor?.kind === 'plan') &&
    schedule.students.find((student) => student.id === editor.lesson.studentId)
  const previous =
    editor?.kind === 'lesson' ? previousAttendedRecord(records, editor.lesson) : undefined
  const pending = editor?.kind === 'lesson' ? pendingHomework(records, editor.lesson) : []
  const plan =
    editor?.kind === 'lesson' ? plans.find((item) => item.lessonId === editor.lesson.id) : undefined
  const course =
    selectedStudent && editor && 'lesson' in editor
      ? pilotCourseSuggestion(
          selectedStudent,
          catalog.books,
          catalog.materials,
          records,
          editor.lesson,
        )
      : undefined

  return (
    <section aria-label="Agenda da professora">
      {notice && (
        <p className="auth-notice" role="status">
          {notice}
        </p>
      )}
      <AgendaPage
        state={{
          ...schedule,
          records: records.map((record) => ({
            ...record,
            material: record.materialSnapshot?.title ?? '',
            materialSnapshot: record.materialSnapshot ?? undefined,
            homework: record.homework ?? undefined,
            courseProgress: record.courseProgress ?? undefined,
          })),
        }}
        now={now}
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
          <div className="record-preview">
            <p className="eyebrow">Homeworks pendentes anteriores</p>
            {pending.length ? (
              pending.map((item) => (
                <div key={item.id}>
                  <p>
                    {formatDate(item.lesson.date)} · {lessonTime(item.lesson.hour)}
                  </p>
                  <PilotHomeworkItem
                    client={client}
                    profile={profile}
                    record={item}
                    onSaved={setRecords}
                  />
                </div>
              ))
            ) : (
              <p>Nenhum homework pendente anterior.</p>
            )}
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
          <div className="record-preview">
            <p className="eyebrow">Última aula com presença</p>
            {previous ? (
              <>
                <p>
                  {formatDate(previous.lesson.date)} · {lessonTime(previous.lesson.hour)}
                </p>
                <p className="record-body">{previous.content}</p>
                {previous.materialSnapshot && (
                  <small>Material: {previous.materialSnapshot.title}</small>
                )}
              </>
            ) : (
              <p>Nenhuma aula anterior com presença registrada.</p>
            )}
          </div>
          {plan && (
            <div className="record-preview">
              <p className="eyebrow">Preparação desta aula</p>
              {plan.materialId && (
                <p>
                  {catalog.materials.find((item) => item.id === plan.materialId)?.title ??
                    'Material indisponível'}
                </p>
              )}
              {plan.notes && <p className="record-body">{plan.notes}</p>}
            </div>
          )}
          {course?.book && (
            <div className="record-preview">
              <p className="eyebrow">Continuidade da sequência</p>
              <p>
                {course.material
                  ? materialLabel(course.material)
                  : course.finished
                    ? 'Fim da sequência disponível.'
                    : course.unavailable
                      ? 'Continuidade indisponível; confira o acervo e o nível.'
                      : 'Nenhuma unidade disponível.'}
              </p>
            </div>
          )}
          <div className="form-actions">
            {!hasLessonEnded(editor.lesson.date, editor.lesson.hour, now) &&
              !records.some((item) => item.lessonId === editor.lesson.id) && (
                <button
                  className="button"
                  onClick={() => setEditor({ kind: 'plan', lesson: editor.lesson })}
                >
                  {plan ? 'Editar preparação' : 'Preparar aula'}
                </button>
              )}
            {hasLessonEnded(editor.lesson.date, editor.lesson.hour, now) && (
              <button
                className="button primary"
                onClick={() => setEditor({ kind: 'record', lesson: editor.lesson })}
              >
                {records.some((item) => item.lessonId === editor.lesson.id)
                  ? 'Editar registro'
                  : 'Lançar aula'}
              </button>
            )}
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
      {editor?.kind === 'plan' && selectedStudent && (
        <TeacherPlanForm
          client={client}
          profile={profile}
          lesson={editor.lesson}
          name={selectedStudent.name}
          plan={plans.find((item) => item.lessonId === editor.lesson.id)}
          materials={catalog.materials}
          books={catalog.books}
          onClose={close}
          onSaved={(next) => {
            setPlans(next)
            setEditor(null)
            setNotice('Preparação salva.')
          }}
        />
      )}
      {editor?.kind === 'record' && selectedStudent && (
        <TeacherRecordForm
          client={client}
          profile={profile}
          lesson={editor.lesson}
          student={selectedStudent}
          record={records.find((item) => item.lessonId === editor.lesson.id)}
          suggestedMaterialId={course?.material?.id}
          onClose={close}
          onSaved={(next) => {
            setRecords(next)
            setEditor(null)
            setNotice('Registro salvo no histórico do aluno.')
          }}
        />
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
