import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchLogs } from '../../api/admin'
import useAsync from '../../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../../components/States'

const PAGE_SIZE = 10
const FILTERS = [
  { value: '', label: 'All' },
  { value: 'student.signup', label: 'Sign-ups' },
  { value: 'student.login', label: 'Sign-ins' },
  { value: 'question.completed', label: 'Completed' },
  { value: 'access.updated', label: 'Access changes' },
  { value: 'password.reset', label: 'Passwords' },
  { value: 'student.updated', label: 'Edits' },
  { value: 'student.disabled', label: 'Disabled' },
  { value: 'student.deleted', label: 'Deleted' },
]
const TYPE_LABEL = { 'student.signup': 'Sign-up', 'student.login': 'Sign-in', 'access.updated': 'Access', 'question.completed': 'Solved', 'password.reset': 'Password', 'student.updated': 'Edit', 'student.disabled': 'Disabled', 'student.enabled': 'Enabled', 'student.deleted': 'Deleted' }
const TYPE_TONE = { 'student.signup': 'bg-surface-2 text-fg-muted', 'student.login': 'bg-surface-2 text-fg-muted', 'access.updated': 'bg-warn-soft text-warn', 'question.completed': 'bg-success-soft text-success', 'password.reset': 'bg-surface-2 text-fg-muted', 'student.updated': 'bg-surface-2 text-fg-muted', 'student.disabled': 'bg-danger-soft text-danger', 'student.enabled': 'bg-success-soft text-success', 'student.deleted': 'bg-danger-soft text-danger' }

function when(value) {
  const d = new Date(value)
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminLogs() {
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const { data, loading, error } = useAsync(() => fetchLogs({ type, page, limit: PAGE_SIZE }), `admin-logs-${type}-${page}`)
  const pages = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 1

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg">Activity log</h2>
          <p className="mt-1 text-fg-muted">Sign-ups, sign-ins, solved questions and access changes, newest first.</p>
        </div>
        <div className="flex flex-wrap gap-1 self-start rounded-control border border-line p-0.5" role="group" aria-label="Filter log type">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={type === f.value}
              onClick={() => { setType(f.value); setPage(1) }}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${type === f.value ? 'bg-surface-2 font-medium text-fg' : 'text-fg-muted hover:text-fg'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {loading && <LoadingBlock label="Loading activity…" />}
      {error && <ErrorBlock message={error} />}
      {data && data.logs.length === 0 && <EmptyState title="Nothing logged yet" text="Sign-ups, sign-ins, solved questions and access changes will appear here." />}
      {data && data.logs.length > 0 && (
        <>
          <ol className="overflow-hidden rounded-card border border-line bg-surface">
            {data.logs.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3.5 last:border-b-0">
                <span className={`w-20 shrink-0 rounded-full px-2.5 py-0.5 text-center text-xs font-medium ${TYPE_TONE[log.type] || 'bg-surface-2 text-fg-muted'}`}>{TYPE_LABEL[log.type] || log.type}</span>
                <p className="min-w-0 flex-1 basis-64 text-sm text-fg">
                  {log.target ? <Link to={`/admin/students/${log.target}`} className="hover:text-accent-text hover:underline">{log.message}</Link> : log.message}
                </p>
                <time dateTime={log.createdAt} className="shrink-0 text-xs tabular-nums text-fg-subtle">{when(log.createdAt)}</time>
              </li>
            ))}
          </ol>
          <div className="flex items-center justify-between text-sm text-fg-muted">
            <span className="tabular-nums">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total}</span>
            <div className="flex items-center gap-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="hover:text-fg disabled:opacity-40">← Newer</button>
              <span className="tabular-nums">Page {page} of {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="hover:text-fg disabled:opacity-40">Older →</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
