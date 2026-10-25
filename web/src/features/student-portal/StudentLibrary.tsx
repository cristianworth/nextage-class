import { useEffect, useRef, useState } from 'react'
import type { StudentLibraryItem, StudentLibraryView } from '../../domain/student-library'
import { formatTimestamp } from '../../domain/dates'
import { materialLabel } from '../../domain/materials'
import { matchesSearch } from '../../domain/students'
import { EmptyState } from '../../shared/Modal'
import { Icon } from '../../shared/Icon'
import './student-library.css'

function LibraryCard({
  item,
  suggested,
  onRead,
}: {
  item: StudentLibraryItem
  suggested: boolean
  onRead: (item: StudentLibraryItem, trigger: HTMLButtonElement) => void
}) {
  return (
    <article className="panel student-library-card">
      <div className="student-library-badges">
        <span className="level-badge">{item.levels.join(' · ')}</span>
        {suggested && <span className="status-badge done">Unidade sugerida</span>}
      </div>
      <h4>{materialLabel(item)}</h4>
      <p className="student-library-excerpt">{item.content}</p>
      <button
        className="text-button"
        aria-label={`Ler ${item.sequenceTitle ? `${item.sequenceTitle} · ` : ''}${materialLabel(item)}`}
        onClick={(event) => onRead(item, event.currentTarget)}
      >
        Ler material
        <Icon name="arrow" size={15} />
      </button>
    </article>
  )
}

export function StudentLibrary({ view }: { view: StudentLibraryView }) {
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const reader = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const selected = view.materials.find((material) => material.id === selectedId)
  const primary = view.primary
  const currentId = 'currentItemId' in primary ? primary.currentItemId : null
  const current = view.materials.find((item) => item.id === currentId)
  const filtered = view.materials.filter(
    (item) =>
      (kind === 'all' || (kind === 'units' ? !!item.sequenceId : !item.sequenceId)) &&
      matchesSearch(`${item.sequenceTitle ?? ''} ${materialLabel(item)} ${item.content}`, search),
  )
  const supports = filtered.filter((item) => !item.sequenceId)
  useEffect(() => {
    if (selectedId) reader.current?.focus()
  }, [selectedId])
  function open(item: StudentLibraryItem, element: HTMLButtonElement) {
    trigger.current = element
    setSelectedId(item.id)
  }
  function close() {
    setSelectedId(null)
    if (trigger.current?.isConnected) trigger.current.focus()
  }
  return (
    <section aria-label="Acervo do aluno" className="student-library">
      <div className="student-section-heading">
        <h2>Meu acervo</h2>
        <span className="level-badge">{view.level}</span>
      </div>
      <p className="student-note">
        Unidades e materiais de apoio do seu nível, incluindo conteúdos que ainda não foram usados
        nas aulas.
      </p>
      <section className="panel student-primary-sequence" aria-label="Minha sequência">
        <p className="eyebrow">MINHA SEQUÊNCIA</p>
        {'title' in primary && <h3>{primary.title}</h3>}
        {primary.status === 'current' && current ? (
          <>
            <p>
              Continuidade sugerida: <strong>{materialLabel(current)}</strong>
            </p>
            <button className="button" onClick={(event) => open(current, event.currentTarget)}>
              Abrir unidade sugerida
            </button>
          </>
        ) : (
          <p>
            {primary.status === 'unassigned'
              ? 'A professora ainda não definiu uma sequência principal. Você pode explorar os conteúdos abaixo.'
              : primary.status === 'unavailable'
                ? 'A sequência principal precisa ser ajustada pela professora. Os conteúdos compatíveis continuam disponíveis abaixo.'
                : primary.status === 'empty'
                  ? 'A professora ainda não adicionou unidades a esta sequência.'
                  : 'Fim da sequência disponível. As unidades continuam acessíveis para retomar.'}
          </p>
        )}
        <p className="muted form-hint">
          A continuidade é atualizada pela professora ao lançar as aulas. Ler um material não marca
          sua conclusão.
        </p>
      </section>
      <div className="student-library-toolbar">
        <label className="search-field">
          <Icon name="search" size={17} />
          <input
            aria-label="Buscar no meu acervo"
            placeholder="Buscar material, unidade ou sequência…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="filter-label">
          <span>Tipo de conteúdo</span>
          <select
            aria-label="Tipo de conteúdo"
            className="filter-select"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="all">Todos os conteúdos</option>
            <option value="units">Unidades</option>
            <option value="support">Materiais de apoio</option>
          </select>
        </label>
      </div>
      {selected && (
        <section
          className="panel student-material-reader"
          aria-label="Leitura do material"
          tabIndex={-1}
          ref={reader}
          onKeyDown={(event) => {
            if (event.key === 'Escape') close()
          }}
        >
          <div className="student-section-heading">
            <p className="eyebrow">LEITURA DO MATERIAL</p>
            <button className="button small" onClick={close}>
              <Icon name="close" size={14} />
              Fechar leitura
            </button>
          </div>
          {selected.sequenceTitle && <p className="student-note">{selected.sequenceTitle}</p>}
          <h3>{materialLabel(selected)}</h3>
          <p className="muted form-hint">
            Versão atual do acervo · Atualizado em {formatTimestamp(selected.updatedAt)}
          </p>
          <div className="material-text">{selected.content}</div>
          <p className="student-note">
            O histórico das aulas preserva a versão utilizada em cada encontro.
          </p>
        </section>
      )}
      <p className="result-count student-library-count">
        {filtered.length} {filtered.length === 1 ? 'conteúdo disponível' : 'conteúdos disponíveis'}
      </p>
      {filtered.length ? (
        <>
          {view.sequences.map((sequence) => {
            const units = filtered.filter((item) => item.sequenceId === sequence.id)
            return units.length ? (
              <section
                className="student-library-group"
                key={sequence.id}
                aria-label={`Unidades de ${sequence.title}`}
              >
                <h3>{sequence.title}</h3>
                <div className="student-library-grid">
                  {units.map((item) => (
                    <LibraryCard
                      key={item.id}
                      item={item}
                      suggested={item.id === currentId}
                      onRead={open}
                    />
                  ))}
                </div>
              </section>
            ) : null
          })}
          {!!supports.length && (
            <section className="student-library-group" aria-label="Materiais de apoio">
              <h3>Materiais de apoio</h3>
              <div className="student-library-grid">
                {supports.map((item) => (
                  <LibraryCard key={item.id} item={item} suggested={false} onRead={open} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="panel">
          <EmptyState
            title={
              view.materials.length ? 'Nenhum conteúdo encontrado' : 'Nenhum material no seu nível'
            }
            description={
              view.materials.length
                ? 'Tente outro termo ou tipo de conteúdo.'
                : 'Os materiais aparecerão aqui quando a professora cadastrar conteúdo compatível.'
            }
          />
        </div>
      )}
    </section>
  )
}
