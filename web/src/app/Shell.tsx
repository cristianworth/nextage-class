import type { ReactNode } from 'react'
import { Icon } from '../shared/Icon'
import { Brand } from '../shared/Brand'

export type Page = 'agenda' | 'students' | 'history' | 'materials' | 'requests'
const navigation = [
  { page: 'agenda', label: 'Agenda', icon: 'calendar' },
  { page: 'students', label: 'Alunos', icon: 'users' },
  { page: 'history', label: 'Histórico', icon: 'book' },
  { page: 'materials', label: 'Acervo', icon: 'library' },
  { page: 'requests', label: 'Solicitações', icon: 'clock' },
] as const

export function Shell({
  page,
  onNavigate,
  onReset,
  onStudentPreview,
  children,
}: {
  page: Page
  onNavigate: (page: Page) => void
  onReset: () => void
  onStudentPreview?: () => void
  children: ReactNode
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <a
          href="#agenda"
          className="brand"
          onClick={() => onNavigate('agenda')}
          aria-label="Nextage Class, agenda"
        >
          <Brand />
        </a>
        <div className="nav-section">
          <p className="nav-caption">Área da professora</p>
          <nav aria-label="Navegação principal">
            {navigation.map((item) => (
              <button
                key={item.page}
                className={`nav-item ${page === item.page ? 'active' : ''}`}
                aria-current={page === item.page ? 'page' : undefined}
                onClick={() => onNavigate(item.page)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {page === item.page && <span className="nav-dot" />}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="demo-indicator" /> <strong>Seu espaço para explorar</strong>
            <p>Demo com dados fictícios, salvos somente neste navegador.</p>
            <button onClick={onReset} className="text-button">
              <Icon name="reset" size={15} /> Reiniciar demo
            </button>
          </div>
          <div className="teacher-profile">
            <span className="avatar">P</span>
            <div>
              <strong>Professora</strong>
              <small>Ambiente de demonstração</small>
            </div>
          </div>
        </div>
      </aside>
      <main id="main" className="main">
        <header className="topbar">
          <span>
            Seu espaço de ensino <span className="topbar-slash">/</span>{' '}
            <strong>{navigation.find((item) => item.page === page)?.label}</strong>
          </span>
          <div className="teacher-topbar-actions">
            <button
              className="button small"
              disabled={!onStudentPreview}
              onClick={onStudentPreview}
            >
              Ver como aluno
            </button>
            <span className="demo-badge">
              <span /> Demo local
            </span>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
