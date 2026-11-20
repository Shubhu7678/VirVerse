import Spinner from './Spinner'

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-fg-muted">
      <Spinner className="size-5 text-accent-text" />
      {label}
    </div>
  )
}

export function ErrorBlock({ message }) {
  return (
    <div role="alert" className="rounded-control border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </div>
  )
}

export function EmptyState({ title, text, children }) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <p className="font-semibold text-fg">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
