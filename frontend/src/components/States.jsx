export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div role="status" aria-label={label} className="mx-auto max-w-5xl space-y-6 py-2">
      <div className="skeleton h-28 w-full !rounded-[1.25rem]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24" style={{ animationDelay: `${i * 120}ms` }} />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-36" style={{ animationDelay: `${i * 120}ms` }} />)}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}

// Shaped like the editor page (problem pane, code pane, console) so opening a question doesn't jump.
export function EditorSkeleton({ label = 'Opening editor…' }) {
  return (
    <div role="status" aria-label={label} className="-m-4 flex flex-col sm:-m-6 lg:-m-8 lg:h-[calc(100dvh-3.5rem)]">
      <div className="skeleton h-12 !rounded-none" />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="skeleton m-3 h-64 flex-none lg:h-auto lg:w-2/5" />
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 lg:pl-0">
          <div className="skeleton min-h-72 flex-[3]" />
          <div className="skeleton h-40 flex-[2]" />
        </div>
      </div>
      <span className="sr-only">{label}</span>
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
