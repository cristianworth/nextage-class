import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { pilotRequest } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'
import { schedulingRequestSchema } from '../../domain/models'
import { FormError } from '../../shared/Modal'
import { TeacherRequestsPage } from '../scheduling-requests/TeacherRequestsPage'

const requestSchema = schedulingRequestSchema.extend({ studentName: z.string() })

export function TeacherConnectedRequests({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [items, setItems] = useState<z.infer<typeof requestSchema>[]>()
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    setItems(undefined)
    setError('')
    pilotRequest(client, profile.userId, '/api/teacher/requests', { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setItems(requestSchema.array().parse(value))
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Não foi possível carregar as solicitações.')
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
  if (!items) return <p role="status">Carregando solicitações…</p>
  return (
    <TeacherRequestsPage
      requests={items}
      students={items.map((item) => ({ id: item.studentId, name: item.studentName }))}
      now={now}
      onDecide={async (id, decision) => {
        const result = requestSchema.parse(
          await pilotRequest(
            client,
            profile.userId,
            `/api/teacher/requests/${encodeURIComponent(id)}/decision`,
            { body: { decision } },
          ),
        )
        setItems((previous) => previous?.map((item) => (item.id === id ? result : item)))
      }}
    />
  )
}
