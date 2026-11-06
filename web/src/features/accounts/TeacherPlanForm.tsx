import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { pilotRequest } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'
import type { Book, Lesson, Material } from '../../domain/models'
import { errorMessage } from '../../domain/models'
import { catalogLabel, compareMaterials } from '../../domain/materials'
import { formatDate, lessonTime } from '../../domain/dates'
import { FormError, Modal } from '../../shared/Modal'

export const pilotPlansSchema = z.array(
  z.object({
    lessonId: z.string(),
    materialId: z.string().nullable(),
    notes: z.string(),
    updatedAt: z.string(),
  }),
)
export type PilotPlan = z.infer<typeof pilotPlansSchema>[number]

export function TeacherPlanForm({
  client,
  profile,
  lesson,
  name,
  plan,
  materials,
  books,
  onClose,
  onSaved,
}: {
  client: SupabaseClient
  profile: AccessProfile
  lesson: Lesson
  name: string
  plan?: PilotPlan
  materials: Material[]
  books: Book[]
  onClose: () => void
  onSaved: (plans: PilotPlan[]) => void
}) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const result = await pilotRequest(client, profile.userId, '/api/lesson-plans', {
        body: {
          lessonId: lesson.id,
          expectedDate: lesson.date,
          expectedHour: lesson.hour,
          materialId: String(data.get('materialId') ?? '') || null,
          notes: String(data.get('notes') ?? ''),
        },
      })
      onSaved(pilotPlansSchema.parse(result))
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal
      title="Preparar aula"
      subtitle={`${name} · ${formatDate(lesson.date)} · ${lessonTime(lesson.hour)}`}
      onClose={() => {
        if (!saving) onClose()
      }}
    >
      <form onSubmit={submit}>
        <label className="field">
          Material planejado
          <select name="materialId" defaultValue={plan?.materialId ?? ''}>
            <option value="">Sem material do acervo</option>
            {[...materials].sort(compareMaterials).map((item) => (
              <option value={item.id} key={item.id}>
                {catalogLabel(item, books)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Anotações para esta aula
          <textarea name="notes" maxLength={5000} rows={5} defaultValue={plan?.notes} />
        </label>
        <p className="muted form-hint">
          Este plano vale para esta aula e acompanha sua remarcação. Para retirar o plano, deixe os
          dois campos vazios.
        </p>
        <FormError message={error} />
        <div className="form-actions">
          <button className="button" type="button" disabled={saving} onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" disabled={saving} type="submit">
            Salvar preparação
          </button>
        </div>
      </form>
    </Modal>
  )
}
