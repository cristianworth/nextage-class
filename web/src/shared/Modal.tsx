import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current!
    element.showModal()
    return () => element.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="modal-heading">
        <div>
          <p className="eyebrow">NEXTAGE CLASS</p>
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        <button className="icon-button" aria-label="Fechar" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  )
}

export function FormError({ message }: { message: string }) {
  return message ? (
    <p className="form-error" role="alert">
      {message}
    </p>
  ) : null
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name="book" size={26} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
