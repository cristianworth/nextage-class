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

const librarySchema = z.object({
  level: studentSchema.shape.level,
  sequences: z.array(
    z.object({ id: z.string(), title: z.string(), levels: z.array(studentSchema.shape.level) }),
  ),
  materials: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      levels: z.array(studentSchema.shape.level),
      sequenceId: z.string().nullable(),
      sequenceTitle: z.string().nullable(),
      lessonNumber: z
        .number()
        .int()
        .nullable()
        .transform((value) => value ?? undefined),
      updatedAt: z.iso.datetime({ offset: true }),
    }),
  ),
  primary: z.discriminatedUnion('status', [
    z.object({ status: z.enum(['unassigned', 'unavailable']) }),
    z.object({
      status: z.enum(['current', 'finished', 'empty']),
      id: z.string(),
      title: z.string(),
      currentItemId: z.string().nullable(),
    }),
  ]),
})
export function StudentConnected({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [view, setView] = useState<z.infer<typeof overviewSchema>>()
  const [library, setLibrary] = useState<z.infer<typeof librarySchema>>()
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
    setLibrary(undefined)
    setError('')
    Promise.all([
      pilotRequest(client, profile.userId, '/api/student/overview', { signal: controller.signal }),
      pilotRequest(client, profile.userId, '/api/student/library', { signal: controller.signal }),
    ])
      .then(([overview, catalog]) => {
        if (!controller.signal.aborted) {
          setView(overviewSchema.parse(overview))
          setLibrary(librarySchema.parse(catalog))
        }
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
  if (!view || !library) return <p role="status">Carregando suas aulas…</p>
  return <StudentPortal view={view} library={library} now={now} />
}
