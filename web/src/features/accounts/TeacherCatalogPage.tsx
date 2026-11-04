import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { bookSchema, materialSchema } from '../../domain/models'
import type { Book, Material } from '../../domain/models'
import { pilotRequest } from '../../data/pilot-client'
import type { AccessProfile } from '../../data/pilot-client'
import { MaterialsPage } from '../materials/MaterialsPage'
import { BookForm } from '../materials/BookForm'
import { MaterialForm } from '../materials/MaterialForm'
import { MaterialDetails } from '../materials/MaterialDetails'
import { FormError } from '../../shared/Modal'

const catalogSchema = z.object({ books: bookSchema.array(), materials: materialSchema.array() })
type Editor =
  | { kind: 'book'; book?: Book }
  | { kind: 'material'; material?: Material }
  | { kind: 'read'; material: Material }
  | null

export function TeacherCatalogPage({
  client,
  profile,
}: {
  client: SupabaseClient
  profile: AccessProfile
}) {
  const [catalog, setCatalog] = useState<z.infer<typeof catalogSchema>>()
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [editor, setEditor] = useState<Editor>(null)
  useEffect(() => {
    const controller = new AbortController()
    setCatalog(undefined)
    setError('')
    pilotRequest(client, profile.userId, '/api/catalog', { signal: controller.signal })
      .then((data) => {
        const valid = catalogSchema.parse(data)
        if (!controller.signal.aborted) setCatalog(valid)
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError('Não foi possível carregar seu acervo. Tente novamente.')
      })
    return () => controller.abort()
  }, [client, profile.userId, refresh])
  if (error)
    return (
      <div className="panel">
        <FormError message={error} />
        <button className="button" onClick={() => setRefresh((value) => value + 1)}>
          Tentar novamente
        </button>
      </div>
    )
  if (!catalog) return <p role="status">Carregando acervo…</p>
  return (
    <section aria-label="Acervo da professora">
      <MaterialsPage
        books={catalog.books}
        materials={catalog.materials}
        onNewBook={() => setEditor({ kind: 'book' })}
        onEditBook={(book) => setEditor({ kind: 'book', book })}
        onNew={() => setEditor({ kind: 'material' })}
        onOpen={(material) => setEditor({ kind: 'read', material })}
      />
      {editor?.kind === 'book' && (
        <BookForm
          key={editor.book?.id ?? 'new-book'}
          book={editor.book}
          onClose={() => setEditor(null)}
          onSave={async (input) => {
            const book = bookSchema.parse(
              await pilotRequest(
                client,
                profile.userId,
                editor.book ? `/api/books/${encodeURIComponent(editor.book.id)}` : '/api/books',
                { method: editor.book ? 'PUT' : 'POST', body: input },
              ),
            )
            setCatalog(
              (current) =>
                current && {
                  ...current,
                  books: [...current.books.filter((item) => item.id !== book.id), book],
                },
            )
            setEditor(null)
          }}
        />
      )}
      {editor?.kind === 'material' && (
        <MaterialForm
          key={editor.material?.id ?? 'new-material'}
          material={editor.material}
          books={catalog.books}
          onClose={() => setEditor(null)}
          onSave={async (input) => {
            const material = materialSchema.parse(
              await pilotRequest(
                client,
                profile.userId,
                editor.material
                  ? `/api/materials/${encodeURIComponent(editor.material.id)}`
                  : '/api/materials',
                { method: editor.material ? 'PUT' : 'POST', body: input },
              ),
            )
            setCatalog(
              (current) =>
                current && {
                  ...current,
                  materials: [
                    ...current.materials.filter((item) => item.id !== material.id),
                    material,
                  ],
                },
            )
            setEditor(null)
          }}
        />
      )}
      {editor?.kind === 'read' && (
        <MaterialDetails
          material={editor.material}
          books={catalog.books}
          onClose={() => setEditor(null)}
          onEdit={() => setEditor({ kind: 'material', material: editor.material })}
        />
      )}
    </section>
  )
}
