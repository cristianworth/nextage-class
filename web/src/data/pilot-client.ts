import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const accessProfileSchema = z.object({
  userId: z.uuid(),
  displayName: z.string().min(1),
  role: z.enum(['teacher', 'student']),
  studentId: z.string().nullable(),
})
export type AccessProfile = z.infer<typeof accessProfileSchema>
export const invitationSchema = z.object({
  id: z.uuid(),
  studentId: z.string(),
  email: z.string(),
  status: z.enum(['pending', 'sent', 'needs_review']),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Invitation = z.infer<typeof invitationSchema>

export class PilotRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function pilotRequest(
  client: SupabaseClient,
  userId: string,
  path: string,
  options: { body?: unknown; signal?: AbortSignal } = {},
): Promise<unknown> {
  const {
    data: { session },
  } = await client.auth.getSession()
  if (!session || session.user.id !== userId)
    throw new PilotRequestError(401, 'Sua sessão mudou. Entre novamente para continuar.')
  const send = (token: string) =>
    fetch(path, {
      method: options.body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  let response: Response
  try {
    response = await send(session.access_token)
    if (response.status === 401) {
      const refreshed = await client.auth.refreshSession()
      if (refreshed.error || refreshed.data.session?.user.id !== userId)
        throw new PilotRequestError(401, 'Sua sessão expirou. Entre novamente.')
      response = await send(refreshed.data.session.access_token)
    }
  } catch (cause) {
    if (options.signal?.aborted || cause instanceof PilotRequestError) throw cause
    throw new PilotRequestError(
      0,
      'Não foi possível conectar. Confira sua conexão e tente novamente.',
    )
  }
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    const message =
      response.status === 403
        ? 'Seu acesso a esta ação não está liberado.'
        : response.status === 401
          ? 'Sua sessão expirou. Entre novamente.'
          : typeof problem?.title === 'string' && response.status < 500
            ? problem.title
            : response.status === 503 && typeof problem?.title === 'string'
              ? problem.title
              : 'Não foi possível concluir a operação. Tente novamente.'
    throw new PilotRequestError(response.status, message)
  }
  return response.status === 204 ? null : response.json()
}
