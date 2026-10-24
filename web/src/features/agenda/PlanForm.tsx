import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Lesson, LessonPlanInput, Workspace } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import { formatDate, lessonTime } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'
import { catalogLabel, compareMaterials } from '../../domain/materials'

export function PlanForm({
  lesson,
  state,
  onSave,
  onClose,
}: {
  lesson: Lesson
  state: Workspace
  onSave: (input: LessonPlanInput) => void
  onClose: () => void
}) {
  const [error, setError] = useState('')
  const plan = state.plans.find((item) => item.lessonId === lesson.id)
  const student = state.students.find((item) => item.id === lesson.studentId)!
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      onSave({
        materialId: String(data.get('materialId')) || null,
        notes: String(data.get('notes')),
      })
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }
  return (
    <Modal
      title="Preparar aula"
      subtitle={`${student.name} · ${formatDate(lesson.date)} · ${lessonTime(lesson.hour)}`}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <label className="field">
          Material planejado
          <select name="materialId" defaultValue={plan?.materialId ?? ''} autoFocus>
            <option value="">Sem material do acervo</option>
            {[...state.materials].sort(compareMaterials).map((material) => (
              <option key={material.id} value={material.id}>
                {catalogLabel(material, state.books)}
              </option>
            ))}
          </select>
        </label>
        {!state.materials.length && (
          <p className="muted form-hint">
            Cadastre textos pela área Acervo. Você já pode preparar uma anotação abaixo.
          </p>
        )}
        <label className="field">
          Anotações para esta aula
          <textarea
            name="notes"
            maxLength={5000}
            rows={5}
            defaultValue={plan?.notes}
            placeholder="O que você quer retomar ou trabalhar?"
          />
        </label>
        <p className="muted form-hint">
          Este plano vale somente para esta aula e acompanha sua remarcação. Para retirar o plano,
          deixe os dois campos vazios.
        </p>
        <FormError message={error} />
        <div className="form-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button primary">
            Salvar preparação
          </button>
        </div>
      </form>
    </Modal>
  )
}
