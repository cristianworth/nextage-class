import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AccessProfile } from '../../data/pilot-client'
import { TeacherAccountsPage } from './TeacherAccountsPage'
import { TeacherCatalogPage } from './TeacherCatalogPage'
import { TeacherSchedulePage } from './TeacherSchedulePage'
import { TeacherHistoryPage } from './TeacherRecords'
import { TeacherConnectedRequests } from './TeacherConnectedRequests'

export function TeacherWorkspace({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [section, setSection] = useState<
    'students' | 'catalog' | 'schedule' | 'history' | 'requests'
  >('students')
  return (
    <>
      <nav className="catalog-tabs" aria-label="Área da professora">
        <button
          className="button"
          aria-pressed={section === 'students'}
          onClick={() => setSection('students')}
        >
          Alunos
        </button>
        <button
          className="button"
          aria-pressed={section === 'catalog'}
          onClick={() => setSection('catalog')}
        >
          Acervo
        </button>
        <button
          className="button"
          aria-pressed={section === 'schedule'}
          onClick={() => setSection('schedule')}
        >
          Agenda
        </button>
        <button
          className="button"
          aria-pressed={section === 'history'}
          onClick={() => setSection('history')}
        >
          Histórico
        </button>
        <button
          className="button"
          aria-pressed={section === 'requests'}
          onClick={() => setSection('requests')}
        >
          Solicitações
        </button>
      </nav>
      {section === 'students' && <TeacherAccountsPage client={client} profile={profile} />}
      {section === 'catalog' && <TeacherCatalogPage client={client} profile={profile} />}
      {section === 'schedule' && <TeacherSchedulePage client={client} profile={profile} />}
      {section === 'history' && <TeacherHistoryPage client={client} profile={profile} />}
      {section === 'requests' && <TeacherConnectedRequests client={client} profile={profile} />}
    </>
  )
}
