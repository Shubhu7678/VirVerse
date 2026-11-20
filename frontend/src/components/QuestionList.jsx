import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Circle, CircleCheck, CircleDot, Search } from 'lucide-react'
import { DifficultyBadge } from './Badges'
import { EmptyState } from './States'
import Select from './ui/Select'
import Card from './ui/Card'
import Button from './Button'
import { taskPath } from '../utils/languageRoutes'

const rank = { Easy: 1, Medium: 2, Hard: 3 }

const sorters = {
  order: (a, b) => a.order - b.order,
  'order-desc': (a, b) => b.order - a.order,
  difficulty: (a, b) => rank[a.difficulty] - rank[b.difficulty] || a.order - b.order,
  title: (a, b) => a.title.localeCompare(b.title),
}

const statusMeta = {
  completed: { Glyph: CircleCheck, color: 'text-success', label: 'Completed', action: 'Review' },
  attempted: { Glyph: CircleDot, color: 'text-warn', label: 'Attempted, not accepted yet', action: 'Continue' },
  todo: { Glyph: Circle, color: 'text-fg-subtle', label: 'Not attempted', action: 'Solve' },
}

export function StatusIcon({ status }) {
  const { Glyph, color, label } = statusMeta[status] || statusMeta.todo
  return <Glyph className={`size-5 shrink-0 ${color}`} strokeWidth={1.75} role="img" aria-label={label} />
}

/**
 * Searchable, filterable question list.
 * `fixedStatus` hides the status filter for pages that already scope by status (My Tasks / Completed).
 */
export default function QuestionList({
  tasks, topicNames, showTopic = false, fixedStatus = null, hideStatusFilter = false,
  hideSort = false, hideSummary = false, pageSize = 12, featuredSlug = null, emptyState, language = 'c',
}) {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('order')
  const [topic, setTopic] = useState('all')
  const [page, setPage] = useState(1)

  const filtersActive = search || difficulty !== 'all' || status !== 'all' || sort !== 'order' || topic !== 'all'
  const clear = () => {
    setSearch('')
    setDifficulty('all')
    setStatus('all')
    setSort('order')
    setTopic('all')
    setPage(1)
  }
  const onFilter = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks
      .filter(
        (t) =>
          (!q || t.title.toLowerCase().includes(q)) &&
          (difficulty === 'all' || t.difficulty === difficulty) &&
          (status === 'all' || t.status === status) &&
          (topic === 'all' || t.category === topic),
      )
      .sort(sorters[sort])
  }, [tasks, search, difficulty, status, sort, topic])

  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const pageCount = Math.ceil(visible.length / pageSize)
  const currentPage = Math.min(page, Math.max(1, pageCount))
  const pageTasks = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const firstVisible = visible.length ? (currentPage - 1) * pageSize + 1 : 0
  const lastVisible = Math.min(currentPage * pageSize, visible.length)
  const pageNumbers = Array.from(
    { length: Math.min(5, pageCount) },
    (_, index) => Math.max(1, Math.min(currentPage - 2, pageCount - 4)) + index,
  )

  if (tasks.length === 0) return emptyState

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={onFilter(setSearch)}
            placeholder="Search questions"
            aria-label="Search questions"
            className="h-10 w-full rounded-control border border-line-strong bg-surface pr-3 pl-9 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        {showTopic && (
          <Select label="Filter by topic" value={topic} onChange={onFilter(setTopic)} className="lg:w-48">
            <option value="all">All topics</option>
            {Object.entries(topicNames).map(([slug, name]) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </Select>
        )}
        <Select label="Filter by difficulty" value={difficulty} onChange={onFilter(setDifficulty)} className="lg:w-44">
          <option value="all">All difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </Select>
        {!hideStatusFilter && !fixedStatus && (
          <Select label="Filter by status" value={status} onChange={onFilter(setStatus)} className="lg:w-44">
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="attempted">Attempted</option>
            <option value="todo">Not attempted</option>
          </Select>
        )}
        {!hideSort && (
          <Select label="Sort questions" value={sort} onChange={onFilter(setSort)} className="lg:w-44">
            <option value="order">Question order</option>
            <option value="order-desc">Reverse order</option>
            <option value="difficulty">Difficulty</option>
            <option value="title">Title A–Z</option>
          </Select>
        )}
      </div>

      {!hideSummary && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-fg-muted">
          <p aria-live="polite" className="tabular-nums">
            {completedCount} of {tasks.length} completed · showing {firstVisible}–{lastVisible} of {visible.length}
          </p>
          {filtersActive && (
            <button onClick={clear} className="text-accent-text hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title="No questions match your filters" text="Try a different search or clear the filters.">
          <Button variant="secondary" fullWidth={false} onClick={clear}>Clear filters</Button>
        </EmptyState>
      ) : (
        <Card padded={false} as="ul" className="divide-y divide-line overflow-hidden">
          {pageTasks.map((t) => {
            const meta = statusMeta[t.status] || statusMeta.todo
            const isNext = t.slug === featuredSlug && t.status !== 'completed'
            return (
              <li
                key={t.id}
                className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-surface-2 ${isNext ? 'bg-accent-soft/60' : ''}`}
              >
                <StatusIcon status={t.status} />
                <span className="w-7 shrink-0 font-mono text-xs text-fg-subtle tabular-nums">{String(t.questionOrder).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1 basis-56">
                  <Link to={taskPath(language, t.slug)} className="block truncate font-medium text-fg hover:text-accent-text">
                    {t.title}
                  </Link>
                  {(showTopic || t.description) && (
                    <p className="truncate text-sm text-fg-muted">
                      {showTopic && topicNames[t.category]}
                      {showTopic && t.description && ' · '}
                      {t.description}
                    </p>
                  )}
                </div>
                {isNext && <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-fg">Up next</span>}
                <DifficultyBadge level={t.difficulty} />
                <Link
                  to={taskPath(language, t.slug)}
                  className="inline-flex h-8 w-20 items-center justify-center rounded-control border border-line-strong text-xs font-medium text-fg transition-colors hover:bg-surface"
                  aria-label={`${meta.action} ${t.title}`}
                >
                  {meta.action}
                </Link>
              </li>
            )
          })}
        </Card>
      )}

      {pageCount > 1 && (
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Question pages">
          <p className="text-sm text-fg-muted tabular-nums">Page {currentPage} of {pageCount}</p>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" fullWidth={false} onClick={() => setPage((c) => Math.max(1, c - 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
                className={`size-8 rounded-control text-sm font-medium tabular-nums transition-colors ${
                  currentPage === pageNumber ? 'bg-accent text-accent-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <Button variant="secondary" size="sm" fullWidth={false} onClick={() => setPage((c) => Math.min(pageCount, c + 1))} disabled={currentPage === pageCount}>
              Next
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
}
