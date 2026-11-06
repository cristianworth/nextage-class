import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { pilotRequest } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'
import {
  ATTENDANCE,
  bookSchema,
  courseProgressSchema,
  errorMessage,
  lessonSchema,
  materialSchema,
  materialSnapshotSchema,
} from '../../domain/models'
import type { Lesson } from '../../domain/models'
import { formatDate, formatTimestamp, lessonTime } from '../../domain/dates'
import { catalogLabel, materialLabel, materialsForLevel } from '../../domain/materials'
import { nextCourseMaterial } from '../../domain/course-progress'
import { FormError, Modal } from '../../shared/Modal'

const recordSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  studentName: z.string(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  attendance: z.enum(['attended', 'student-absent', 'teacher-absent']),
  content: z.string(),
  reason: z.string(),
  homework: z.object({ description: z.string(), correctedAt: z.string().nullable() }).nullable(),
  courseProgress: courseProgressSchema.nullable(),
  materialSnapshot: materialSnapshotSchema
    .extend({ updatedAt: z.iso.datetime({ offset: true }) })
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lesson: lessonSchema,
})
const catalogSchema = z.object({ books: bookSchema.array(), materials: materialSchema.array() })
export type PilotRecord = z.infer<typeof recordSchema>
export const pilotRecordsSchema = recordSchema.array()

export function TeacherRecordForm({
  client,
  profile,
  lesson,
  student,
  record,
  suggestedMaterialId,
  onClose,
  onSaved,
}: {
  client: SupabaseClient
  profile: AccessProfile
  lesson: Lesson
  student: { name: string; level: string }
  record?: PilotRecord
  suggestedMaterialId?: string
  onClose: () => void
  onSaved: (records: PilotRecord[]) => void
}) {
  const [catalog, setCatalog] = useState<z.infer<typeof catalogSchema>>()
  const [attendance, setAttendance] = useState<PilotRecord['attendance']>(
    record?.attendance ?? 'attended',
  )
  const [material, setMaterial] = useState(
    record?.materialSnapshot ? 'saved' : record ? '' : (suggestedMaterialId ?? ''),
  )
  const [completed, setCompleted] = useState(record?.courseProgress?.completed ?? false)
  const [progressChanged, setProgressChanged] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const level = record?.level ?? (student.level as PilotRecord['level'])
  const selected =
    material === 'saved'
      ? record?.materialSnapshot
      : catalog?.materials.find((item) => item.id === material)
  const isUnit = !!selected?.bookId && !!selected.lessonNumber
  useEffect(() => {
    const controller = new AbortController()
    pilotRequest(client, profile.userId, '/api/catalog', { signal: controller.signal })
      .then((data) => setCatalog(catalogSchema.parse(data)))
      .catch(() => {
        if (!controller.signal.aborted) setError('Não foi possível carregar o acervo.')
      })
    return () => controller.abort()
  }, [client, profile.userId])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const body = {
        lessonId: lesson.id,
        attendance,
        content: values.get('content'),
        reason: values.get('reason'),
        homework: values.get('homework'),
        ...(material === 'saved' ? {} : { usedMaterialId: material || null }),
        ...(attendance === 'attended' &&
        isUnit &&
        (!record || material !== 'saved' || progressChanged)
          ? { courseCompleted: completed }
          : {}),
      }
      const result = await pilotRequest(client, profile.userId, '/api/lesson-records', { body })
      onSaved(pilotRecordsSchema.parse(result))
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setSaving(false)
    }
  }
  const materials = catalog ? materialsForLevel(catalog.materials, level, catalog.books) : []
  return (
    <Modal
      title={record ? 'Editar registro da aula' : 'O que aconteceu nesta aula?'}
      subtitle={`${record?.studentName ?? student.name} · ${formatDate(lesson.date)} · ${lessonTime(lesson.hour)}`}
      onClose={() => {
        if (!saving) onClose()
      }}
    >
      <form onSubmit={submit}>
        <fieldset className="attendance-options">
          <legend>Resultado da aula</legend>
          {Object.entries(ATTENDANCE).map(([value, label]) => (
            <label key={value} className={attendance === value ? 'checked' : ''}>
              <input
                type="radio"
                name="attendance"
                checked={attendance === value}
                onChange={() => setAttendance(value as PilotRecord['attendance'])}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <div className="record-level">
          <span>Nível neste registro</span>
          <strong className="level-badge">{level}</strong>
        </div>
        <label className="field">
          Conteúdo utilizado
          <select
            value={material}
            onChange={(event) => {
              setMaterial(event.target.value)
              setCompleted(
                event.target.value === 'saved'
                  ? (record?.courseProgress?.completed ?? false)
                  : false,
              )
              setProgressChanged(false)
            }}
            disabled={!catalog}
          >
            <option value="">Sem material</option>
            {record?.materialSnapshot && (
              <option value="saved">
                Manter versão registrada · {catalogLabel(record.materialSnapshot)}
              </option>
            )}
            {catalog?.books.map((book) => {
              const units = materials.filter((item) => item.bookId === book.id)
              return units.length ? (
                <optgroup key={book.id} label={`Unidades · ${book.title}`}>
                  {units.map((item) => (
                    <option key={item.id} value={item.id}>
                      {catalogLabel(item, catalog.books)}
                    </option>
                  ))}
                </optgroup>
              ) : null
            })}
            {materials.some((item) => !item.bookId) && (
              <optgroup label="Materiais de apoio">
                {materials
                  .filter((item) => !item.bookId)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {catalogLabel(item, catalog?.books)}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
          <small>
            A versão registrada permanece até você escolher outro material ou selecionar sem
            material.
          </small>
        </label>
        {attendance === 'attended' && isUnit && selected && catalog && (
          <div className="course-panel">
            <p>Unidade trabalhada: {catalogLabel(selected, catalog.books)}</p>
            <label className="check-field">
              <input
                type="checkbox"
                checked={completed}
                onChange={(event) => {
                  setCompleted(event.target.checked)
                  setProgressChanged(true)
                }}
              />{' '}
              Concluí esta unidade
            </label>
            <p className="course-continuation">
              {(() => {
                const next =
                  material === 'saved' && record?.courseProgress && !progressChanged
                    ? record.courseProgress.next
                    : completed
                      ? nextCourseMaterial(catalog, selected)
                      : selected
                return next
                  ? `Continuidade indicada: ${materialLabel(next)}`
                  : 'Fim da sequência disponível.'
              })()}
            </p>
            {record && material === 'saved' && !record.courseProgress && (
              <p className="muted form-hint">
                Este registro anterior não possui resultado de sequência. Selecione a unidade
                novamente para informar o resultado.
              </p>
            )}
          </div>
        )}
        {attendance !== 'attended' && (
          <label className="field">
            Motivo da falta <small>Opcional</small>
            <input name="reason" maxLength={1000} defaultValue={record?.reason} />
          </label>
        )}
        <label className="field">
          {attendance === 'attended' ? 'Conteúdo trabalhado' : 'Observações (opcional)'}
          <textarea
            name="content"
            required={attendance === 'attended'}
            maxLength={10000}
            rows={5}
            defaultValue={record?.content}
          />
        </label>
        <label className="field">
          Homework passado
          <textarea
            name="homework"
            maxLength={2000}
            rows={3}
            defaultValue={record?.homework?.description}
          />
          <small>Alterar o texto deixa o homework pendente; limpar retira a tarefa.</small>
        </label>
        {record && (
          <p className="muted form-hint">
            Última atualização: {formatTimestamp(record.updatedAt)}. Salvar altera este registro,
            sem criar outro.
          </p>
        )}
        <FormError message={error} />
        <div className="form-actions">
          <button className="button" type="button" disabled={saving} onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" disabled={!catalog || saving} type="submit">
            {record ? 'Salvar registro' : 'Lançar aula'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function TeacherHistoryPage({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [records, setRecords] = useState<PilotRecord[]>()
  const [selected, setSelected] = useState<PilotRecord>()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [student, setStudent] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    pilotRequest(client, profile.userId, '/api/lesson-records', { signal: controller.signal })
      .then((data) => setRecords(pilotRecordsSchema.parse(data)))
      .catch(() => {
        if (!controller.signal.aborted) setError('Não foi possível carregar o histórico.')
      })
    return () => controller.abort()
  }, [client, profile.userId])
  if (error) return <FormError message={error} />
  if (!records) return <p role="status">Carregando histórico…</p>
  const students = [
    ...new Map(records.map((item) => [item.lesson.studentId, item.studentName])).entries(),
  ]
  const entries = records.filter(
    (item) =>
      (!student || item.lesson.studentId === student) &&
      `${item.studentName} ${item.content} ${item.reason} ${item.homework?.description ?? ''} ${item.materialSnapshot?.title ?? ''} ${item.materialSnapshot?.content ?? ''}`
        .toLocaleLowerCase('pt-BR')
        .includes(search.toLocaleLowerCase('pt-BR')),
  )
  return (
    <section aria-label="Histórico de aulas">
      <div className="page-heading">
        <div>
          <h1>Histórico de aulas</h1>
          <p className="muted">O que foi estudado em cada encontro.</p>
        </div>
      </div>
      <label className="search-field">
        <input
          aria-label="Buscar no histórico"
          placeholder="Buscar por conteúdo, material ou aluno…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <label className="filter-label">
        Aluno
        <select
          aria-label="Filtrar histórico por aluno"
          value={student}
          onChange={(event) => setStudent(event.target.value)}
        >
          <option value="">Todos os alunos</option>
          {students.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {!entries.length && <p>Nenhum registro corresponde à busca.</p>}
      <div className="history-list">
        {entries.map((item) => (
          <article className="history-card" key={item.id}>
            <div className="history-date">
              <strong>{formatDate(item.lesson.date)}</strong>
            </div>
            <div className="history-content">
              <div className="history-card-heading">
                <h2>{item.studentName}</h2>
                <span className="level-badge">{item.level}</span>
                <span>{ATTENDANCE[item.attendance]}</span>
              </div>
              <p>{lessonTime(item.lesson.hour)} · Horário de Brasília</p>
              {item.materialSnapshot && (
                <>
                  <p>
                    {item.materialSnapshot.bookTitle && `${item.materialSnapshot.bookTitle} · `}
                    {catalogLabel(item.materialSnapshot)}
                  </p>
                  <details>
                    <summary>Conteúdo do material utilizado</summary>
                    <div className="material-text">{item.materialSnapshot.content}</div>
                  </details>
                </>
              )}
              <p className="record-body">{item.content || 'Sem observações adicionais.'}</p>
              {item.courseProgress && item.materialSnapshot && (
                <div className="course-panel">
                  <p>
                    {materialLabel(item.materialSnapshot)} ·{' '}
                    {item.courseProgress.completed ? 'Concluída' : 'Em andamento'}
                  </p>
                  <p>
                    {item.courseProgress.next
                      ? `Continuidade indicada: ${materialLabel(item.courseProgress.next)}`
                      : 'Fim da sequência disponível.'}
                  </p>
                </div>
              )}
              <PilotHomeworkItem
                client={client}
                profile={profile}
                record={item}
                onSaved={setRecords}
              />
              {item.reason && <p>Motivo: {item.reason}</p>}
              <p>Última atualização: {formatTimestamp(item.updatedAt)}</p>
            </div>
            <button
              className="button small"
              onClick={() => setSelected(item)}
              aria-label={`Editar registro de ${item.studentName} em ${formatDate(item.lesson.date)}`}
            >
              Editar
            </button>
          </article>
        ))}
      </div>
      {selected && (
        <TeacherRecordForm
          client={client}
          profile={profile}
          lesson={selected.lesson}
          student={{ name: selected.studentName, level: selected.level }}
          record={selected}
          onClose={() => setSelected(undefined)}
          onSaved={(next) => {
            setRecords(next)
            setSelected(undefined)
          }}
        />
      )}
    </section>
  )
}

export function PilotHomeworkItem({
  client,
  profile,
  record,
  onSaved,
}: {
  client: SupabaseClient
  profile: AccessProfile
  record: PilotRecord
  onSaved: (records: PilotRecord[]) => void
}) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  if (!record.homework) return null
  const homework = record.homework
  async function toggle() {
    setSaving(true)
    setError('')
    try {
      const result = await pilotRequest(client, profile.userId, '/api/lesson-records/homework', {
        body: {
          recordId: record.id,
          corrected: !homework.correctedAt,
          expectedDescription: homework.description,
        },
      })
      onSaved(pilotRecordsSchema.parse(result))
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="homework-item">
      <p className="eyebrow">Homework · {homework.correctedAt ? 'Corrigido' : 'Pendente'}</p>
      <p className="record-body">{homework.description}</p>
      {homework.correctedAt && (
        <p className="muted form-hint">Corrigido em {formatTimestamp(homework.correctedAt)}</p>
      )}
      <button
        className="button small"
        type="button"
        disabled={saving}
        aria-pressed={!!homework.correctedAt}
        onClick={toggle}
      >
        {homework.correctedAt ? 'Marcar como pendente' : 'Marcar como corrigido'}
      </button>
      <FormError message={error} />
    </div>
  )
}
