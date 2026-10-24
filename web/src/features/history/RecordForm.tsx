import { useState } from 'react'
import type { FormEvent } from 'react'
import { ATTENDANCE, LEVELS, errorMessage } from '../../domain/models'
import type { Lesson, RecordInput, RecordSubmission, Workspace } from '../../domain/models'
import { formatDate, formatTimestamp, lessonTime } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'

export function RecordForm({
  lesson,
  state,
  onSave,
  onClose,
}: {
  lesson: Lesson
  state: Workspace
  onSave: (input: RecordSubmission) => void
  onClose: () => void
}) {
  const record = state.records.find((item) => item.lessonId === lesson.id)
  const student = state.students.find((item) => item.id === lesson.studentId)!
  const [attendance, setAttendance] = useState<RecordInput['attendance']>(
    record?.attendance ?? 'attended',
  )
  const [error, setError] = useState('')
  const plan = state.plans.find((item) => item.lessonId === lesson.id)
  const [materialChoice, setMaterialChoice] = useState(
    record?.materialSnapshot ? 'saved' : !record ? (plan?.materialId ?? '') : '',
  )
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (key: string) => String(data.get(key) ?? '')
    try {
      onSave({
        attendance,
        level: value('level') as RecordInput['level'],
        content: value('content'),
        material: value('material'),
        reason: value('reason'),
        usedMaterialId: materialChoice === 'saved' ? undefined : materialChoice || null,
        homework: value('homework'),
      })
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }
  return (
    <Modal
      title={record ? 'Editar registro da aula' : 'O que aconteceu nesta aula?'}
      subtitle={`${record?.studentName ?? student.name} · ${formatDate(lesson.date)} · ${lessonTime(lesson.hour)}`}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <fieldset className="attendance-options">
          <legend>Resultado da aula</legend>
          {Object.entries(ATTENDANCE).map(([value, label]) => (
            <label key={value} className={attendance === value ? 'checked' : ''}>
              <input
                type="radio"
                name="attendance"
                value={value}
                checked={attendance === value}
                onChange={() => setAttendance(value as RecordInput['attendance'])}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <div className={attendance === 'attended' ? 'form-grid' : ''}>
          <label className="field">
            Nível nesta aula
            <select name="level" defaultValue={record?.level ?? student.level} required>
              {LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          {attendance === 'attended' && !materialChoice && (
            <label className="field">
              Livro ou material
              <input
                name="material"
                maxLength={300}
                defaultValue={record?.material}
                placeholder="Ex.: Travel essentials · Unidade 3"
              />
            </label>
          )}
        </div>
        <label className="field">
          Material do acervo
          <select
            value={materialChoice}
            onChange={(event) => setMaterialChoice(event.target.value)}
          >
            <option value="">Somente texto livre</option>
            {record?.materialSnapshot && (
              <option value="saved">
                Manter versão registrada · {record.materialSnapshot.title}
              </option>
            )}
            {[...state.materials]
              .sort(
                (a, b) => a.level.localeCompare(b.level) || a.title.localeCompare(b.title, 'pt-BR'),
              )
              .map((material) => (
                <option key={material.id} value={material.id}>
                  {material.level} · {material.title}
                </option>
              ))}
          </select>
          <small>
            {materialChoice === 'saved'
              ? 'A versão histórica é preservada. Escolher o material na lista usa a versão atual.'
              : plan && !record
                ? 'O material planejado está sugerido; confira o que foi efetivamente utilizado.'
                : 'O conteúdo selecionado será guardado com este lançamento.'}
          </small>
        </label>
        {attendance !== 'attended' && (
          <label className="field">
            Motivo da falta <small>Opcional</small>
            <input
              name="reason"
              maxLength={1000}
              defaultValue={record?.reason}
              placeholder="Se quiser, registre o motivo."
            />
          </label>
        )}
        <label className="field">
          {attendance === 'attended' ? 'Conteúdo trabalhado' : 'Observações (opcional)'}
          <textarea
            name="content"
            required={attendance === 'attended'}
            maxLength={10000}
            defaultValue={record?.content}
            placeholder="O que foi estudado? O que vale retomar na próxima aula?"
            rows={5}
          />
        </label>
        <label className="field">
          Homework passado
          <textarea
            name="homework"
            maxLength={2000}
            rows={3}
            defaultValue={record?.homework?.description}
            placeholder="Ex.: exercícios 1 a 5, página 12"
          />
          <small>
            Uma descrição por aula. Alterar o texto deixa o homework pendente; limpar retira a
            tarefa.
          </small>
        </label>
        {record && (
          <p className="muted form-hint">
            Última atualização: {formatTimestamp(record.updatedAt)}. Salvar altera este registro,
            sem criar outro.
          </p>
        )}
        <FormError message={error} />
        <div className="form-actions">
          <button className="button" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit">
            {record ? 'Salvar registro' : 'Lançar aula'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
