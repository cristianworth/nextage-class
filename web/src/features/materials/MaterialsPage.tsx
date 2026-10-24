import { useState } from 'react'
import { LEVELS } from '../../domain/models'
import type { Material } from '../../domain/models'
import { matchesSearch } from '../../domain/students'
import { compareMaterials } from '../../domain/materials'
import { Icon } from '../../shared/Icon'
import { EmptyState, FormError } from '../../shared/Modal'
import { errorMessage } from '../../domain/models'

export function MaterialsPage({
  materials,
  onNew,
  onOpen,
  onExamples,
}: {
  materials: Material[]
  onNew: () => void
  onOpen: (material: Material) => void
  onExamples: () => void
}) {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [error, setError] = useState('')
  const filtered = materials
    .filter(
      (material) =>
        (!level || material.level === level) &&
        matchesSearch(
          `${material.title} ${material.content} ${material.lessonNumber ? `Unidade ${material.lessonNumber}` : ''}`,
          search,
        ),
    )
    .sort(compareMaterials)
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">IDEIAS PARA O PRÓXIMO ENCONTRO</p>
          <h1>Seu acervo de materiais</h1>
          <p className="muted">Textos e atividades, organizados por nível.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button"
            onClick={() => {
              try {
                onExamples()
                setError('')
              } catch (cause) {
                setError(errorMessage(cause))
              }
            }}
          >
            Adicionar exemplos
          </button>
          <button className="button primary" onClick={onNew}>
            <Icon name="plus" size={17} />
            Novo material
          </button>
        </div>
      </div>
      <FormError message={error} />
      <div className="list-toolbar history-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            aria-label="Buscar no acervo"
            placeholder="Buscar por título ou conteúdo…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="filter-label">
          <span>Nível</span>
          <select
            className="filter-select"
            aria-label="Filtrar acervo por nível"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="">Todos os níveis</option>
            {LEVELS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="result-count library-count">
        {filtered.length} {filtered.length === 1 ? 'material encontrado' : 'materiais encontrados'}
      </p>
      {filtered.length ? (
        <div className="material-grid">
          {filtered.map((material) => (
            <article className="material-card panel" key={material.id}>
              <span className="level-badge">
                {material.level} ·{' '}
                {material.lessonNumber ? `Unidade ${material.lessonNumber}` : 'Complementar'}
              </span>
              <h2>{material.title}</h2>
              <p className="material-excerpt">{material.content}</p>
              <button
                className="text-button"
                onClick={() => onOpen(material)}
                aria-label={`Ler material ${material.title}`}
              >
                Ler material
                <Icon name="arrow" size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            title={
              materials.length ? 'Nenhum material encontrado' : 'Seu acervo começa com uma ideia'
            }
            description={
              materials.length
                ? 'Tente outro termo ou nível.'
                : 'Use Novo material para criar seu primeiro texto ou atividade.'
            }
          />
        </div>
      )}
    </>
  )
}
