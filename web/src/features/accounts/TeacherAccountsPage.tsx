import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { invitationSchema, pilotRequest } from '../../data/pilot-client'
import type { AccessProfile, Invitation } from '../../data/pilot-client'
import { errorMessage, studentSchema } from '../../domain/models'
import type { Student } from '../../domain/models'
import { matchesSearch } from '../../domain/students'
import { formatDate } from '../../domain/dates'
import { StudentForm } from '../students/StudentForm'
import { EmptyState, FormError, Modal } from '../../shared/Modal'
import { Icon } from '../../shared/Icon'

const STATUS = {
  pending: 'Envio em confirmação',
  sent: 'Convite enviado',
  needs_review: 'Conferir envio',
}

export function TeacherAccountsPage({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [students, setStudents] = useState<Student[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState<Student | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    Promise.all([
      pilotRequest(client, profile.userId, '/api/students', { signal: controller.signal }),
      pilotRequest(client, profile.userId, '/api/invitations', { signal: controller.signal }),
    ])
      .then(([people, invites]) => {
        const validStudents = studentSchema.array().parse(people)
        const validInvitations = invitationSchema.array().parse(invites)
        if (!controller.signal.aborted) {
          setStudents(validStudents)
          setInvitations(validInvitations)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('Não foi possível carregar seus alunos. Tente novamente.')
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [client, profile.userId, refresh])
  const visible = students.filter((student) => matchesSearch(student.name, search))
  const selectedInvitation = invitations.find((invitation) => invitation.studentId === inviting?.id)
  return (
    <section aria-label="Alunos e acessos">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CADA ALUNO, UM PRÓXIMO PASSO</p>
          <h1>Seus alunos</h1>
          <p className="muted">Cadastre seus alunos e convide cada um para o próprio espaço.</p>
        </div>
        <button className="button primary" onClick={() => setCreating(true)}>
          <Icon name="plus" size={17} />
          Novo aluno
        </button>
      </div>
      {notice && (
        <p className="auth-notice" role="status">
          {notice}
        </p>
      )}
      {loading ? (
        <p className="muted" role="status">
          Carregando alunos…
        </p>
      ) : error ? (
        <div className="panel">
          <FormError message={error} />
          <button className="button" onClick={() => setRefresh((value) => value + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <label className="search-field pilot-search">
            <Icon name="search" size={18} />
            <input
              aria-label="Buscar aluno"
              placeholder="Buscar aluno por nome…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {visible.length ? (
            <div className="pilot-student-grid">
              {visible.map((student) => {
                const invitation = invitations.find((item) => item.studentId === student.id)
                return (
                  <article className="panel pilot-student-card" key={student.id}>
                    <div className="pilot-student-heading">
                      <span className="avatar">{student.name.slice(0, 1)}</span>
                      <div>
                        <h2>{student.name}</h2>
                        <span className="level-badge">{student.level}</span>
                      </div>
                    </div>
                    <p className="muted">
                      Aulas desde{' '}
                      {formatDate(student.startDate, {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    {invitation && (
                      <p className={`status-badge ${invitation.status === 'sent' ? 'done' : ''}`}>
                        {STATUS[invitation.status]}
                      </p>
                    )}
                    <button className="button" onClick={() => setInviting(student)}>
                      {invitation ? 'Ver convite' : 'Convidar aluno'}
                    </button>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="panel">
              <EmptyState
                title={search ? 'Nenhum aluno encontrado' : 'Seu primeiro aluno começa aqui'}
                description={
                  search
                    ? 'Tente outro nome.'
                    : 'Cadastre um aluno para enviar seu convite de acesso.'
                }
              />
            </div>
          )}
        </>
      )}
      {creating && (
        <StudentForm
          books={[]}
          includeSequence={false}
          onClose={() => setCreating(false)}
          onSave={async (input) => {
            const student = studentSchema.parse(
              await pilotRequest(client, profile.userId, '/api/students', { body: input }),
            )
            setStudents((current) =>
              [...current, student].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
            )
            setCreating(false)
            setNotice('Aluno cadastrado. Você já pode enviar o convite de acesso.')
          }}
        />
      )}
      {inviting && (
        <InvitationDialog
          key={inviting.id}
          student={inviting}
          invitation={selectedInvitation}
          onClose={() => setInviting(null)}
          onSend={async (email) => {
            const invitation = invitationSchema.parse(
              await pilotRequest(
                client,
                profile.userId,
                `/api/students/${encodeURIComponent(inviting.id)}/invitation`,
                { body: { email } },
              ),
            )
            setInvitations((current) => [
              ...current.filter((item) => item.studentId !== inviting.id),
              invitation,
            ])
            setInviting(null)
            setNotice('Convite enviado. O aluno receberá as instruções por e-mail.')
          }}
          onFailed={() => setRefresh((value) => value + 1)}
        />
      )}
    </section>
  )
}

function InvitationDialog({
  student,
  invitation,
  onClose,
  onSend,
  onFailed,
}: {
  student: Student
  invitation?: Invitation
  onClose: () => void
  onSend: (email: string) => Promise<void>
  onFailed: () => void
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    setBusy(true)
    setError('')
    try {
      await onSend(email)
    } catch (cause) {
      setError(errorMessage(cause))
      onFailed()
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      title={invitation ? 'Convite de acesso' : `Convidar ${student.name}`}
      subtitle="O acesso será vinculado somente a este aluno."
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      {invitation ? (
        <>
          <p className="level-badge">{STATUS[invitation.status]}</p>
          <p className="record-body">{invitation.email}</p>
          <p className="muted">
            {invitation.status === 'sent'
              ? 'O envio foi confirmado. O aluno poderá criar a senha pelas instruções do e-mail.'
              : 'Este envio precisa ser conferido antes de outro convite. Fale com o responsável pelo sistema.'}
          </p>
          <FormError message={error} />
          <button className="button" onClick={onClose}>
            Fechar
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <label className="field">
            <span>
              E-mail do aluno{' '}
              <span className="required-marker" aria-hidden="true">
                *
              </span>
            </span>
            <input
              type="email"
              name="email"
              required
              maxLength={254}
              autoComplete="email"
              autoFocus
            />
          </label>
          <p className="muted form-hint">
            Confira o endereço antes de enviar. O aluno criará a própria senha.
          </p>
          <FormError message={error} />
          <div className="form-actions">
            <button className="button" type="button" disabled={busy} onClick={onClose}>
              Cancelar
            </button>
            <button className="button primary" disabled={busy} type="submit">
              {busy ? 'Enviando…' : 'Enviar convite'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
