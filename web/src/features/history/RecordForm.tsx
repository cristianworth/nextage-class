import { useState } from 'react'
import type { FormEvent } from 'react'
import { ATTENDANCE, errorMessage } from '../../domain/models'
import type { Lesson, RecordInput, RecordSubmission, Workspace } from '../../domain/models'
import { formatDate, formatTimestamp, lessonTime } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'
import { materialsForLevel, materialLabel, catalogLabel } from '../../domain/materials'
import { courseSuggestion, nextCourseMaterial } from '../../domain/course-progress'

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
  const level = record?.level ?? student.level
  const materials = materialsForLevel(state.materials, level, state.books)
  const plannedMaterial = materials.find((material) => material.id === plan?.materialId)
  const suggestion = courseSuggestion(state, student.id, level, lesson)
  const [materialChoice, setMaterialChoice] = useState(
    record?.materialSnapshot
      ? 'saved'
      : record?.material
        ? 'legacy'
        : !record
          ? (suggestion.material?.id ??
            (!suggestion.finished && !suggestion.unavailable ? plannedMaterial?.id : undefined) ??
            '')
          : '',
  )
  const [courseCompleted, setCourseCompleted] = useState(record?.courseProgress?.completed ?? false)
  const selectedMaterial =
    materialChoice === 'saved'
      ? record?.materialSnapshot
      : state.materials.find((material) => material.id === materialChoice)
  const followsSequence = !!selectedMaterial?.bookId && !!selectedMaterial.lessonNumber
  const continuation =
    materialChoice === 'saved' &&
    record?.courseProgress &&
    courseCompleted === record.courseProgress.completed
      ? record.courseProgress.next
      : courseCompleted && selectedMaterial
        ? nextCourseMaterial(state, selectedMaterial)
        : selectedMaterial
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (key: string) => String(data.get(key) ?? '')
    try {
      onSave({
        attendance,
        level,
        content: value('content'),
        material: materialChoice === 'legacy' ? (record?.material ?? '') : '',
        reason: value('reason'),
        usedMaterialId: ['saved', 'legacy'].includes(materialChoice)
          ? undefined
          : materialChoice || null,
        homework: value('homework'),
        courseCompleted: attendance === 'attended' && followsSequence ? courseCompleted : undefined,
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
        <div className="record-level">
          <span>{record ? 'Nível neste registro' : 'Nível do aluno'}</span>
          <strong className="level-badge">{level}</strong>
        </div>
        <label className="field">
          Livro/material
          <select
            aria-label="Livro/material"
            value={materialChoice}
            onChange={(event) => {
              setMaterialChoice(event.target.value)
              setCourseCompleted(
                event.target.value === 'saved'
                  ? (record?.courseProgress?.completed ?? false)
                  : false,
              )
            }}
          >
            <option value="">Sem livro/material</option>
            {record?.materialSnapshot && (
              <option value="saved">
                Manter versão registrada · {catalogLabel(record.materialSnapshot)}
              </option>
            )}
            {!record?.materialSnapshot && record?.material && (
              <option value="legacy">Manter material registrado · {record.material}</option>
            )}
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {catalogLabel(material, state.books)}
              </option>
            ))}
          </select>
          <small>
            {materialChoice === 'saved'
              ? 'A versão histórica é preservada. Escolher o material na lista usa a versão atual.'
              : materialChoice === 'legacy'
                ? 'O texto do registro anterior será preservado.'
                : 'Selecione o que foi efetivamente utilizado. A lista considera o nível deste registro.'}
          </small>
        </label>
        {!materials.length && (
          <p className="info-note">
            Nenhum material cadastrado para este nível. Você pode lançar o conteúdo sem material ou
            adicionar exemplos pela área Acervo.
          </p>
        )}
        {attendance === 'attended' && followsSequence ? (
          <div className="course-panel">
            <p className="eyebrow">UNIDADE TRABALHADA</p>
            <p>{catalogLabel(selectedMaterial!, state.books)}</p>
            {selectedMaterial!.bookId !== student.primaryBookId && (
              <p className="muted form-hint">
                Esta unidade pertence a outro livro. O principal do cadastro permanece o mesmo; o
                resultado fica guardado neste livro.
              </p>
            )}
            <label className="check-field">
              <input
                type="checkbox"
                checked={courseCompleted}
                onChange={(event) => setCourseCompleted(event.target.checked)}
              />
              Concluí esta unidade
            </label>
            <p className="course-continuation" role="status">
              {continuation
                ? `${selectedMaterial!.bookId === student.primaryBookId ? 'Próximo encontro' : 'Continuidade neste livro'}: ${materialLabel(continuation)}`
                : 'Última unidade do livro concluída. Nenhuma mudança de nível ou livro será feita automaticamente.'}
            </p>
            <p className="muted form-hint">
              Se ainda há conteúdo para trabalhar, mantenha sem marcar. O histórico deste encontro
              guarda a aula trabalhada acima.
            </p>
          </div>
        ) : (
          attendance === 'attended' && (
            <p className="muted form-hint">
              Sem unidade principal selecionada: este lançamento não altera a sequência do aluno.
            </p>
          )
        )}
        {!record && suggestion.finished && (
          <p className="info-note">
            A sequência deste livro foi concluída. Você pode selecionar um material para revisão.
          </p>
        )}
        {!record && suggestion.unavailable && (
          <p className="info-note">
            O livro principal não atende este nível ou a unidade anterior saiu da sequência. Confira
            o livro no cadastro do aluno ou selecione o conteúdo trabalhado.
          </p>
        )}
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
