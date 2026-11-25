import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { fetchAdminStats, fetchStudents } from '../../api/admin'
import useAsync from '../../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../../components/States'
import Icon, { icons } from '../../components/Icon'
import { isOnline, timeAgo } from '../../utils/timeAgo'

export const LANGUAGE_LABELS = { c: 'C', javascript: 'JavaScript', python: 'Python' }
const FILTERS = [
  { value: '', label: 'All' },
  { value: 'locked', label: 'Free only' },
  { value: 'unlocked', label: 'Unlocked' },
]
const PAGE_SIZE = 15

export function LanguageChips({ unlocked }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {Object.entries(LANGUAGE_LABELS).map(([key, label]) => {
        const on = unlocked.includes(key)
        return (
          <span key={key} className={`rounded-full border px-2 py-0.5 text-xs ${on ? 'border-success text-success' : 'border-line text-fg-subtle'}`}>
            {label}
          </span>
        )
      })}
    </span>
  )
}

function Summary({ label, value, hint, to }) {
  const body = (
    <>
      <p className="text-sm text-fg-subtle">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-fg-subtle">{hint}</p>}
    </>
  )
  const cls = 'rounded-card border border-line bg-surface p-4'
  return to
    ? <Link to={to} className={`${cls} transition-colors hover:border-line-strong hover:bg-surface-2`}>{body}</Link>
    : <div className={cls}>{body}</div>
}

export default function AdminStudents() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [access, setAccess] = useState('')
  const [sort, setSort] = useState('active')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const stats = useAsync(fetchAdminStats, 'admin-stats')
  const { data, loading, error } = useAsync(
    () => fetchStudents({ search: query, access, status, sort, page, limit: PAGE_SIZE }),
    `admin-students-${query}-${access}-${status}-${sort}-${page}`,
  )

  const submit = (e) => {
    e.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }
  const pages = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 1

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Students</h2>
        <p className="mt-1 text-fg-muted">Every learner can open the first 10 questions of each language. Unlock a language here to give a student the rest.</p>
      </header>

      {stats.data && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Summary label="Students" value={stats.data.students} />
          <Summary label="With extra access" value={stats.data.unlocked} />
          <Summary label="Free only" value={stats.data.locked} />
          <Summary label="Emails sent today" value={stats.data.emails.sent} hint={stats.data.emails.failed ? `${stats.data.emails.failed} failed · see details` : `of about ${stats.data.emails.limit} a day`} to="/admin/emails" />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={submit} className="relative flex-1 sm:max-w-sm" role="search">
          <label className="sr-only" htmlFor="student-search">Search students</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
          <input
            id="student-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="h-10 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle"
          />
        </form>
        <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          Sort
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }} className="h-9 rounded-control border border-line-strong bg-surface px-2 text-sm text-fg">
            <option value="active">Last active</option>
            <option value="new">Newest</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          Status
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="h-9 rounded-control border border-line-strong bg-surface px-2 text-sm text-fg">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        <div className="flex gap-1 rounded-control border border-line p-0.5" role="group" aria-label="Filter by access">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={access === f.value}
              onClick={() => { setAccess(f.value); setPage(1) }}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${access === f.value ? 'bg-surface-2 font-medium text-fg' : 'text-fg-muted hover:text-fg'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {loading && <LoadingBlock label="Loading students…" />}
      {error && <ErrorBlock message={error} />}
      {data && data.students.length === 0 && (
        <EmptyState title="No students found" text={query || access ? 'Try a different search or filter.' : 'Students appear here after they sign up.'} />
      )}
      {data && data.students.length > 0 && (
        <>
          <ul className="overflow-hidden rounded-card border border-line bg-surface">
            {data.students.map((s) => {
              const solved = s.solved.c + s.solved.javascript + s.solved.python
              return (
                <li key={s.id}>
                  <Link to={`/admin/students/${s.id}`} className="group flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-2">
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="flex items-center gap-2 truncate font-medium text-fg">{s.name}{s.disabled && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">Disabled</span>}</p>
                      <p className="truncate text-sm text-fg-muted">{s.email}</p>
                    </div>
                    <LanguageChips unlocked={s.unlockedLanguages} />
                    <p className="w-24 text-sm tabular-nums text-fg-muted">{solved} solved</p>
                    <p className="flex w-28 items-center gap-1.5 text-sm text-fg-muted" title={s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : 'Has not been active yet'}>
                      <span className={`size-2 shrink-0 rounded-full ${isOnline(s.lastActiveAt) ? 'bg-success' : 'bg-line-strong'}`} aria-hidden="true" />
                      {isOnline(s.lastActiveAt) ? 'Online' : timeAgo(s.lastActiveAt)}
                    </p>
                    <Icon d={icons.arrow} className="size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="flex items-center justify-between text-sm text-fg-muted">
            <span className="tabular-nums">{data.total} student{data.total === 1 ? '' : 's'}</span>
            <div className="flex items-center gap-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="hover:text-fg disabled:opacity-40">← Previous</button>
              <span className="tabular-nums">Page {page} of {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="hover:text-fg disabled:opacity-40">Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
