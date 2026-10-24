import { useState } from 'react'
import { LEVELS } from '../../domain/models'
import type { Book, Material } from '../../domain/models'
import { matchesSearch } from '../../domain/students'
import { compareMaterials, materialLevels, catalogLabel } from '../../domain/materials'
import { Icon } from '../../shared/Icon'
import { EmptyState, FormError } from '../../shared/Modal'
import { errorMessage } from '../../domain/models'

export function MaterialsPage({
  materials,
  books,
  onNewBook,
  onEditBook,
  onNew,
  onOpen,
  onExamples,
}: {
  materials: Material[]
  books: Book[]
  onNewBook: () => void
  onEditBook: (book: Book) => void
  onNew: () => void
  onOpen: (material: Material) => void
  onExamples: () => void
}) {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [error, setError] = useState('')
  const [view, setView] = useState('materials')
  const [bookId, setBookId] = useState('')
  const filteredBooks = books.filter(
    (book) =>
      (!level || book.levels.includes(level as Material['level'])) &&
      matchesSearch(book.title, search),
  )
  const filtered = materials
    .filter(
      (material) =>
        (!level || materialLevels(material, books).includes(level as Material['level'])) &&
        (!bookId || material.bookId === bookId) &&
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
          <p className="muted">Livros com suas unidades e materiais de apoio por nível.</p>
        </div>
        <div className="heading-actions">
          <button className="button" onClick={onNewBook}>
            Novo livro
          </button>
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
      <div className="catalog-tabs" aria-label="Seções do acervo">
        <button
          className="button"
          aria-pressed={view === 'materials'}
          onClick={() => setView('materials')}
        >
          Materiais
        </button>
        <button className="button" aria-pressed={view === 'books'} onClick={() => setView('books')}>
          Livros
        </button>
      </div>
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
      {view === 'books' ? (
        <div className="material-grid">
          {filteredBooks.map((book) => (
            <article className="book-card material-card panel" key={book.id}>
              <span className="level-badge">{book.levels.join(' · ')}</span>
              <h2>{book.title}</h2>
              <p className="muted">
                {materials.filter((material) => material.bookId === book.id).length} unidades
              </p>
              <div className="heading-actions">
                <button
                  className="text-button"
                  onClick={() => {
                    setBookId(book.id)
                    setView('materials')
                    setSearch('')
                  }}
                >
                  Ver unidades
                </button>
                <button
                  className="text-button"
                  onClick={() => onEditBook(book)}
                  aria-label={`Editar livro ${book.title}`}
                >
                  Editar livro
                </button>
              </div>
            </article>
          ))}
          {!filteredBooks.length && (
            <EmptyState
              title={books.length ? 'Nenhum livro encontrado' : 'Seu primeiro livro'}
              description={
                books.length
                  ? 'Tente outro termo ou nível.'
                  : 'Use Novo livro e depois cadastre suas unidades.'
              }
            />
          )}
        </div>
      ) : (
        <>
          {bookId && (
            <p className="catalog-selection">
              Unidades de {books.find((book) => book.id === bookId)?.title}{' '}
              <button className="text-button" onClick={() => setBookId('')}>
                Mostrar todos os materiais
              </button>
            </p>
          )}
          <p className="result-count library-count">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'material encontrado' : 'materiais encontrados'}
          </p>
          {filtered.length ? (
            <div className="material-grid">
              {filtered.map((material) => (
                <article className="material-card panel" key={material.id}>
                  <span className="level-badge">
                    {materialLevels(material, books).join(' · ')} ·{' '}
                    {material.lessonNumber ? `Unidade ${material.lessonNumber}` : 'Complementar'}
                  </span>
                  <h2>{material.title}</h2>
                  {material.bookId && (
                    <p className="muted form-hint">{catalogLabel(material, books)}</p>
                  )}
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
                  materials.length
                    ? 'Nenhum material encontrado'
                    : 'Seu acervo começa com uma ideia'
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
      )}
    </>
  )
}
