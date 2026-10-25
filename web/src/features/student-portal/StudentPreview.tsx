import { useState } from 'react'
import type { Workspace } from '../../domain/models'
import { studentOverview } from '../../domain/student-overview'
import { EmptyState } from '../../shared/Modal'
import { Icon } from '../../shared/Icon'
import { StudentPortal } from './StudentPortal'

export function StudentPreview({
  state,
  now,
  onBack,
}: {
  state: Workspace
  now: Date
  onBack: () => void
}) {
  const [studentId, setStudentId] = useState(state.students[0]?.id ?? '')
  const view = studentOverview(state, studentId, now)
  return (
    <div className="student-preview">
      <a className="skip-link" href="#student-main">
        Pular para o conteúdo
      </a>
      <header className="student-preview-bar">
        <div className="student-brand">
          <span className="brand-symbol">
            N<span>↗</span>
          </span>
          <strong>
            Nextage<small>CLASS</small>
          </strong>
        </div>
        <span className="demo-badge">
          <span />
          DEMO LOCAL
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
        {view ? (
          <StudentPortal key={view.student.id} view={view} now={now} />
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
