import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AccessProfile } from '../../data/pilot-client'
import { TeacherAccountsPage } from './TeacherAccountsPage'
import { TeacherCatalogPage } from './TeacherCatalogPage'

export function TeacherWorkspace({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [section, setSection] = useState<'students' | 'catalog'>('students')
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
      </nav>
      {section === 'students' ? (
        <TeacherAccountsPage client={client} profile={profile} />
      ) : (
        <TeacherCatalogPage client={client} profile={profile} />
      )}
    </>
  )
}
