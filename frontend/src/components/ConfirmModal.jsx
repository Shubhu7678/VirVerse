import Modal from './Modal'
import Button from './Button'

// A styled replacement for window.confirm.
export default function ConfirmModal({ title, message, confirmLabel = 'Reset', onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-fg-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" fullWidth={false} onClick={onClose}>Cancel</Button>
        <Button fullWidth={false} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
