import { useEffect, useState } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { accessProfileSchema, pilotRequest, PilotRequestError } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'

export function usePilotAccess(client: SupabaseClient) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [result, setResult] = useState<{ token: string; profile?: AccessProfile; error?: string }>({
    token: '',
  })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.unsubscribe()
  }, [client])
  const token = session?.access_token ?? ''
  const userId = session?.user.id ?? ''
  useEffect(() => {
    if (!token || !userId) return
    const controller = new AbortController()
    pilotRequest(client, userId, '/api/session', { signal: controller.signal })
      .then((data) => {
        const profile = accessProfileSchema.parse(data)
        if (profile.userId !== userId) throw new Error('Session mismatch')
        if (!controller.signal.aborted) setResult({ token, profile })
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setResult({
            token,
            error:
              cause instanceof PilotRequestError && cause.status === 403
                ? 'Seu acesso ainda não está vinculado. Fale com a professora para conferir seu convite.'
                : 'Não foi possível conferir seu acesso. Tente novamente.',
          })
      })
    return () => controller.abort()
  }, [client, token, userId, retry])
  return {
    session,
    profile: token && result.profile?.userId === userId ? result.profile : undefined,
    error: result.token === token ? result.error : undefined,
    retry: () => setRetry((value) => value + 1),
  }
}
