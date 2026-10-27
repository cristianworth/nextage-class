import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AuthScreen } from '../features/auth/AuthScreen'
import type { AuthMode } from '../features/auth/AuthScreen'
import { usePilotAccess } from '../features/auth/usePilotAccess'
import { TeacherAccountsPage } from '../features/accounts/TeacherAccountsPage'
import { FormError } from '../shared/Modal'
import { Brand } from '../shared/Brand'
import '../features/auth/auth.css'

const projectUrl = import.meta.env.VITE_SUPABASE_URL
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const client =
  projectUrl && publicKey?.startsWith('sb_publishable_')
    ? createClient(projectUrl, publicKey, {
        auth: {
          storageKey: 'nextage-class:pilot-auth',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

function initialMode(): AuthMode {
  return window.location.pathname === '/auth/activate'
    ? 'activate'
    : window.location.pathname === '/auth/recover'
      ? 'recover'
      : window.location.pathname === '/auth/forgot-password'
        ? 'forgot'
        : 'signin'
}

export default function PilotApp() {
  return client ? (
    <ConnectedPilot client={client} />
  ) : (
    <div className="pilot-main panel">
      <h1>Não foi possível abrir o acesso</h1>
      <p>Fale com a professora se o problema continuar.</p>
    </div>
  )
}

function ConnectedPilot({ client }: { client: SupabaseClient }) {
  const access = usePilotAccess(client)
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [signingOut, setSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  function navigate(next: AuthMode) {
    setMode(next)
    window.history.replaceState(
      {},
      '',
      next === 'signin' ? '/' : next === 'forgot' ? '/auth/forgot-password' : `/auth/${next}`,
    )
  }
  async function logout() {
    setSigningOut(true)
    setLogoutError('')
    try {
      const { error } = await client.auth.signOut({ scope: 'local' })
      if (error) throw error
      navigate('signin')
      setSigningOut(false)
    } catch {
      setLogoutError('Não foi possível encerrar a sessão. Tente sair novamente.')
    }
  }
  const signedIn = !!access.session
  const changingPassword = mode === 'activate' || mode === 'recover'
  return (
    <div className="pilot-shell">
      <a className="skip-link" href="#pilot-main">
        Pular para o conteúdo
      </a>
      <header className="pilot-header">
        <div className="pilot-brand" aria-label="Nextage Class">
          <Brand />
        </div>
        {signedIn && !signingOut && (
          <div className="pilot-header-actions">
            <span>{access.profile?.displayName}</span>
            <button className="button small" onClick={logout}>
              Sair
            </button>
          </div>
        )}
      </header>
      <main id="pilot-main" className="pilot-main">
        {signingOut ? (
          <section className="panel auth-panel">
            <h1>Encerrando seu acesso</h1>
            <FormError message={logoutError} />
            {logoutError && (
              <button className="button" onClick={logout}>
                Tentar sair novamente
              </button>
            )}
          </section>
        ) : access.session === undefined ? (
          <p role="status">Conferindo seu acesso…</p>
        ) : !signedIn || changingPassword ? (
          <AuthScreen
            key={mode}
            client={client}
            mode={mode}
            hasSession={signedIn}
            onNavigate={navigate}
          />
        ) : access.error ? (
          <section className="panel auth-panel">
            <h1>Vamos conferir seu acesso</h1>
            <FormError message={access.error} />
            <button className="button" onClick={access.retry}>
              Tentar novamente
            </button>
          </section>
        ) : !access.profile ? (
          <p role="status">Carregando seu espaço…</p>
        ) : access.profile.role === 'teacher' ? (
          <TeacherAccountsPage
            key={access.profile.userId}
            client={client}
            profile={access.profile}
          />
        ) : (
          <section className="panel pilot-welcome" aria-label="Acesso do aluno">
            <p className="eyebrow">SEU ESPAÇO DE APRENDIZADO</p>
            <h1>Olá, {access.profile.displayName.split(' ')[0]}.</h1>
            <p>
              Seu acesso está confirmado. Seus próximos encontros e materiais serão compartilhados
              neste espaço.
            </p>
          </section>
        )}
      </main>
      <footer className="pilot-footer">Nextage Class · Um próximo passo a cada aula.</footer>
    </div>
  )
}
