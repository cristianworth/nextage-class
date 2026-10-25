import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FormError } from '../../shared/Modal'

export type AuthMode = 'signin' | 'forgot' | 'activate' | 'recover'
class AuthFormError extends Error {}
const TITLES = {
  signin: 'Entre no seu espaço',
  forgot: 'Recupere seu acesso',
  activate: 'Seu convite, seu próximo passo',
  recover: 'Escolha uma nova senha',
}

export function AuthScreen({
  client,
  mode,
  hasSession,
  onNavigate,
}: {
  client: SupabaseClient
  mode: AuthMode
  hasSession: boolean
  onNavigate: (mode: AuthMode) => void
}) {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const changingPassword = mode === 'activate' || mode === 'recover'
  const invalidLink = changingPassword && !hasSession

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const email = String(data.get('email') ?? '').trim()
      const password = String(data.get('password') ?? '')
      if (mode === 'signin') {
        const response = await client.auth.signInWithPassword({ email, password })
        if (response.error)
          throw new AuthFormError(
            'Não foi possível entrar. Confira o e-mail e a senha e tente novamente.',
          )
      } else if (mode === 'forgot') {
        const response = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/recover`,
        })
        if (response.error)
          throw new AuthFormError(
            'Não foi possível solicitar a recuperação agora. Tente novamente mais tarde.',
          )
        setNotice(
          'Se houver uma conta com esse e-mail, você receberá as instruções para recuperar o acesso.',
        )
      } else {
        if (password.length < 12)
          throw new AuthFormError('Use pelo menos 12 caracteres na nova senha.')
        if (password !== String(data.get('confirmation') ?? ''))
          throw new AuthFormError('As senhas precisam ser iguais.')
        const response = await client.auth.updateUser({ password })
        if (response.error)
          throw new AuthFormError(
            'Não foi possível salvar a senha. Confira o link e tente novamente.',
          )
        onNavigate('signin')
      }
    } catch (cause) {
      setError(
        cause instanceof AuthFormError
          ? cause.message
          : 'Não foi possível concluir. Tente novamente.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="auth-grid">
      <section className="auth-intro">
        <p className="eyebrow">NEXTAGE CLASS</p>
        <h1>Mais espaço para aprender.</h1>
        <p>Suas aulas, materiais e próximos passos em um só lugar.</p>
        <div className="auth-intro-note">
          <span className="level-badge">UM ENCONTRO DE CADA VEZ</span>
          <p>Acesse o conteúdo das suas aulas e combine seus próximos horários com a professora.</p>
        </div>
      </section>
      <section className="panel auth-panel">
        <h2>{TITLES[mode]}</h2>
        {invalidLink ? (
          <>
            <p className="muted">
              Este link expirou ou não está completo. Solicite a recuperação do acesso ou fale com a
              professora.
            </p>
            <button className="button primary" onClick={() => onNavigate('forgot')}>
              Solicitar recuperação
            </button>
            <button className="text-button" onClick={() => onNavigate('signin')}>
              Voltar para entrar
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <p className="muted">
              {mode === 'signin'
                ? 'Entre com seu e-mail cadastrado.'
                : changingPassword
                  ? 'Use pelo menos 12 caracteres. A senha é pessoal.'
                  : 'Informe o e-mail usado para suas aulas.'}
            </p>
            {!changingPassword && (
              <label className="field">
                <span>
                  E-mail{' '}
                  <span className="required-marker" aria-hidden="true">
                    *
                  </span>
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  autoFocus
                  maxLength={254}
                />
              </label>
            )}
            {mode !== 'forgot' && (
              <label className="field">
                <span>
                  {changingPassword ? 'Nova senha' : 'Senha'}{' '}
                  <span className="required-marker" aria-hidden="true">
                    *
                  </span>
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={changingPassword ? 12 : undefined}
                  autoComplete={changingPassword ? 'new-password' : 'current-password'}
                />
              </label>
            )}
            {changingPassword && (
              <label className="field">
                <span>
                  Confirmar senha{' '}
                  <span className="required-marker" aria-hidden="true">
                    *
                  </span>
                </span>
                <input
                  type="password"
                  name="confirmation"
                  required
                  minLength={12}
                  autoComplete="new-password"
                />
              </label>
            )}
            <FormError message={error} />
            {notice && (
              <p className="auth-notice" role="status">
                {notice}
              </p>
            )}
            <button className="button primary auth-submit" type="submit" disabled={busy}>
              {busy
                ? 'Aguarde…'
                : mode === 'signin'
                  ? 'Entrar'
                  : mode === 'forgot'
                    ? 'Solicitar recuperação'
                    : 'Salvar senha e continuar'}
            </button>
            <button
              className="text-button auth-alternative"
              type="button"
              disabled={busy}
              onClick={() => onNavigate(mode === 'signin' ? 'forgot' : 'signin')}
            >
              {mode === 'signin' ? 'Esqueci minha senha' : 'Voltar para entrar'}
            </button>
            {mode === 'signin' && (
              <p className="auth-invitation-note">
                Ainda não tem acesso? Peça um convite à sua professora.
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  )
}
