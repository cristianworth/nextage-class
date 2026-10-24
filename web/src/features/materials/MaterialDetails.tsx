import type { Material } from '../../domain/models'
import { formatTimestamp } from '../../domain/dates'
import { Modal } from '../../shared/Modal'

export function MaterialDetails({
  material,
  onEdit,
  onClose,
}: {
  material: Material
  onEdit: () => void
  onClose: () => void
}) {
  return (
    <Modal
      title={material.title}
      subtitle={`${material.level} · ${material.lessonNumber ? `Aula ${material.lessonNumber}` : 'Complementar'} · Última atualização: ${formatTimestamp(material.updatedAt)}`}
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
