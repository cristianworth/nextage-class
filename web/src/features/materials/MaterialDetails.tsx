import type { Book, Material } from '../../domain/models'
import { catalogLabel, materialLevels } from '../../domain/materials'
import { formatTimestamp } from '../../domain/dates'
import { Modal } from '../../shared/Modal'

export function MaterialDetails({
  material,
  books,
  onEdit,
  onClose,
}: {
  material: Material
  books: Book[]
  onEdit: () => void
  onClose: () => void
}) {
  return (
    <Modal
      title={material.title}
      subtitle={`${materialLevels(material, books).join(', ')} · ${catalogLabel(material, books)} · Última atualização: ${formatTimestamp(material.updatedAt)}`}
      onClose={onClose}
    >
      <div className="material-text">{material.content}</div>
      <div className="form-actions">
        <button className="button" onClick={onClose}>
          Fechar
        </button>
        <button className="button primary" onClick={onEdit}>
          Editar material
        </button>
      </div>
    </Modal>
  )
}
