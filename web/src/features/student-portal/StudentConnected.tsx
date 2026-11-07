import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { pilotRequest } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'
import { lessonSchema, requestInputSchema, studentSchema } from '../../domain/models'
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
const requestsSchema = z.array(
  requestInputSchema.safeExtend({
    id: z.string(),
    status: z.enum(['pending', 'approved', 'declined']),
    createdAt: z.iso.datetime({ offset: true }),
    decidedAt: z.iso.datetime({ offset: true }).nullable(),
  }),
)
export function StudentConnected({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [view, setView] = useState<z.infer<typeof overviewSchema>>()
  const [library, setLibrary] = useState<z.infer<typeof librarySchema>>()
  const [requests, setRequests] = useState<z.infer<typeof requestsSchema>>()
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
    setRequests(undefined)
    setError('')
    Promise.all([
      pilotRequest(client, profile.userId, '/api/student/overview', { signal: controller.signal }),
      pilotRequest(client, profile.userId, '/api/student/library', { signal: controller.signal }),
      pilotRequest(client, profile.userId, '/api/student/requests', { signal: controller.signal }),
    ])
      .then(([overview, catalog, ownRequests]) => {
        if (!controller.signal.aborted) {
          setView(overviewSchema.parse(overview))
          setLibrary(librarySchema.parse(catalog))
          setRequests(requestsSchema.parse(ownRequests))
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
  if (!view || !library || !requests) return <p role="status">Carregando suas aulas…</p>
  return (
    <StudentPortal
      view={view}
      library={library}
      now={now}
      requests={{
        items: requests,
        availableHours: async (input) => {
          const query = new URLSearchParams({ kind: input.kind, date: input.date })
          if (input.endDate) query.set('endDate', input.endDate)
          return z
            .array(z.number().int().min(7).max(22))
            .parse(
              await pilotRequest(
                client,
                profile.userId,
                '/api/student/requests/availability?' + query,
              ),
            )
        },
        onSubmit: async (input) => {
          const created = requestsSchema.element.parse(
            await pilotRequest(client, profile.userId, '/api/student/requests', { body: input }),
          )
          setRequests((previous) => [created, ...(previous ?? [])])
        },
      }}
    />
  )
}
