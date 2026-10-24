import type { ReactNode } from 'react'
import { Icon } from '../shared/Icon'

export type Page = 'agenda' | 'students' | 'history' | 'materials'
const navigation = [
  { page: 'agenda', label: 'Agenda', icon: 'calendar' },
  { page: 'students', label: 'Alunos', icon: 'users' },
  { page: 'history', label: 'Histórico', icon: 'book' },
  { page: 'materials', label: 'Acervo', icon: 'library' },
] as const

export function Shell({
  page,
  onNavigate,
  onReset,
  children,
}: {
  page: Page
  onNavigate: (page: Page) => void
  onReset: () => void
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
          <span className="brand-symbol">
            N<span>↗</span>
          </span>
          <span>
            Nextage<small>CLASS</small>
          </span>
        </a>
        <div className="nav-section">
          <p className="nav-caption">ÁREA DA PROFESSORA</p>
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
          <span className="demo-badge">
            <span /> DEMO LOCAL
          </span>
        </header>
        {children}
      </main>
    </div>
  )
}
