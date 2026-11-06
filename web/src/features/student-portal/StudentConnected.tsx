import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { pilotRequest } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'
import { lessonSchema, studentSchema } from '../../domain/models'
import { FormError } from '../../shared/Modal'
import { StudentPortal } from './StudentPortal'

const materialSchema = z.object({
  title: z.string(),
  sequenceTitle: z
    .string()
    .nullable()
    .transform((value) => value ?? undefined),
  lessonNumber: z
    .number()
    .int()
    .nullable()
    .transform((value) => value ?? undefined),
  content: z.string(),
})
const homeworkSchema = z.object({ description: z.string(), correctedAt: z.string().nullable() })
const overviewSchema = z.object({
  student: studentSchema.pick({ id: true, name: true, level: true }),
  meetingUrl: z.string(),
  upcoming: lessonSchema.pick({ id: true, date: true, hour: true }).array(),
  history: z.array(
    z.object({
      id: z.string(),
      date: lessonSchema.shape.date,
      hour: lessonSchema.shape.hour,
      attendance: z.enum(['attended', 'student-absent', 'teacher-absent']),
      level: studentSchema.shape.level,
      material: z.string(),
      materialSnapshot: materialSchema.nullable(),
      homework: homeworkSchema.nullable(),
    }),
  ),
  pendingHomework: z.array(
    z.object({ id: z.string(), date: lessonSchema.shape.date, description: z.string() }),
  ),
})

export function StudentConnected({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [view, setView] = useState<z.infer<typeof overviewSchema>>()
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    setView(undefined)
    setError('')
    pilotRequest(client, profile.userId, '/api/student/overview', { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setView(overviewSchema.parse(data))
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError('Não foi possível carregar suas aulas. Tente novamente.')
      })
    return () => controller.abort()
  }, [client, profile.userId, retry])
  if (error)
    return (
      <div className="panel">
        <FormError message={error} />
        <button className="button" onClick={() => setRetry((value) => value + 1)}>
          Tentar novamente
        </button>
      </div>
    )
  if (!view) return <p role="status">Carregando suas aulas…</p>
  return <StudentPortal view={view} now={now} />
}
