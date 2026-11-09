import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AccessProfile } from '../../data/pilot-client'
import { Icon } from '../../shared/Icon'
import { TeacherAccountsPage } from './TeacherAccountsPage'
import { TeacherCatalogPage } from './TeacherCatalogPage'
import { TeacherSchedulePage } from './TeacherSchedulePage'
import { TeacherHistoryPage } from './TeacherRecords'
import { TeacherConnectedRequests } from './TeacherConnectedRequests'

const navigation = [
  { section: 'schedule', label: 'Agenda', icon: 'calendar' },
  { section: 'students', label: 'Alunos', icon: 'users' },
  { section: 'history', label: 'Histórico', icon: 'book' },
  { section: 'catalog', label: 'Acervo', icon: 'library' },
  { section: 'requests', label: 'Solicitações', icon: 'clock' },
] as const

type Section = (typeof navigation)[number]['section']

export function TeacherWorkspace({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [section, setSection] = useState<Section>('students')
  return (
    <div className="pilot-workspace">
      <nav className="pilot-teacher-nav" aria-label="Área da professora">
        <p className="pilot-nav-caption">Área da professora</p>
        <div className="pilot-nav-items">
          {navigation.map((item) => (
            <button
              key={item.section}
              className={`pilot-nav-item ${section === item.section ? 'active' : ''}`}
              aria-current={section === item.section ? 'page' : undefined}
              aria-pressed={section === item.section}
              onClick={() => setSection(item.section)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {section === item.section && <span className="nav-dot" />}
            </button>
          ))}
        </div>
      </nav>
      <div className="pilot-workspace-content">
        {section === 'students' && <TeacherAccountsPage client={client} profile={profile} />}
        {section === 'catalog' && <TeacherCatalogPage client={client} profile={profile} />}
        {section === 'schedule' && <TeacherSchedulePage client={client} profile={profile} />}
        {section === 'history' && <TeacherHistoryPage client={client} profile={profile} />}
        {section === 'requests' && <TeacherConnectedRequests client={client} profile={profile} />}
      </div>
    </div>
  )
}
