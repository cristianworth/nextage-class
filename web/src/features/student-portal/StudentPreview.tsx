import { useState } from 'react'
import type { Workspace } from '../../domain/models'
import { studentOverview } from '../../domain/student-overview'
import { studentLibrary } from '../../domain/student-library'
import { availableRequestHours } from '../../domain/availability'
import { studentRequests, submitSchedulingRequest } from '../../domain/scheduling-requests'
import { EmptyState } from '../../shared/Modal'
import { Icon } from '../../shared/Icon'
import { Brand } from '../../shared/Brand'
import { isPublicDemo } from '../../app/mode'
import { StudentPortal } from './StudentPortal'

export function StudentPreview({
  state,
  now,
  onBack,
  onCommit,
}: {
  state: Workspace
  now: Date
  onBack: () => void
  onCommit: (next: Workspace) => void
}) {
  const [studentId, setStudentId] = useState(state.students[0]?.id ?? '')
  const view = studentOverview(state, studentId, now)
  const library = studentLibrary(state, studentId)
  return (
    <div className="student-preview">
      <a className="skip-link" href="#student-main">
        Pular para o conteúdo
      </a>
      <header className="student-preview-bar">
        <div className="student-brand" aria-label="Nextage Class">
          <Brand />
        </div>
        <span className="demo-badge">
          <span />
          {isPublicDemo ? 'Demonstração' : 'Demo local'}
        </span>
      </header>
      <section className="student-preview-tools" aria-label="Ferramentas da demo">
        <div>
          <strong>Simulação da área do aluno</strong>
          <p>Explore dados fictícios. Trocar o aluno muda apenas esta prévia.</p>
        </div>
        <label>
          Aluno da simulação
          <select
            aria-label="Aluno da simulação"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            disabled={!state.students.length}
          >
            {!state.students.length && <option value="">Nenhum aluno cadastrado</option>}
            {[...state.students]
              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
              .map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
          </select>
        </label>
        <button className="button" onClick={onBack}>
          <Icon name="left" size={16} />
          Voltar à professora
        </button>
      </section>
      <main id="student-main">
        {view && library ? (
          <StudentPortal
            key={view.student.id}
            view={view}
            library={library}
            now={now}
            requests={{
              items: studentRequests(state, studentId),
              availableHours: (input) => availableRequestHours(state, input, now),
              onSubmit: (input) => onCommit(submitSchedulingRequest(state, studentId, input)),
            }}
          />
        ) : (
          <div className="panel student-empty">
            <EmptyState
              title="Nenhum aluno para consultar"
              description="Cadastre um aluno na área da professora para experimentar esta consulta."
            />
          </div>
        )}
      </main>
      <footer className="student-footer">Nextage Class · Seu espaço para aprender.</footer>
    </div>
  )
}
