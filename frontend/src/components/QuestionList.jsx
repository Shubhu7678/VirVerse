import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DifficultyBadge } from './Badges'
import { EmptyState } from './States'

const rank = { Easy: 1, Medium: 2, Hard: 3 }
const pageSize = 12

const sorters = {
  order: (a, b) => a.order - b.order,
  'order-desc': (a, b) => b.order - a.order,
  difficulty: (a, b) => rank[a.difficulty] - rank[b.difficulty] || a.order - b.order,
  title: (a, b) => a.title.localeCompare(b.title),
}

export function StatusIcon({ status }) {
  if (status === 'completed') {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white" title="Completed" role="img" aria-label="Completed">
        <svg viewBox="0 0 20 20" className="size-3.5" fill="currentColor" aria-hidden="true">
          <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
        </svg>
      </span>
    )
  }
  if (status === 'attempted') {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20" title="Attempted, not accepted yet" role="img" aria-label="Attempted">
        <span className="size-2.5 rounded-full bg-amber-500" />
      </span>
    )
  }
  return <span className="block size-6 rounded-full border-2 border-slate-300" title="Not attempted" role="img" aria-label="Not attempted" />
}

const field =
  'min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100'

/**
 * Searchable, filterable question table.
 * `fixedStatus` hides the status filter for pages that already scope by status (My Tasks / Completed).
 */
export default function QuestionList({ tasks, topicNames, showTopic = false, fixedStatus = null, emptyState }) {
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
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search questions…"
            aria-label="Search questions"
            className={`${field} min-w-0 flex-1`}
          />
          {showTopic && (
            <select value={topic} onChange={(e) => {
              setTopic(e.target.value)
              setPage(1)
            }} aria-label="Filter by topic" className={`${field} lg:max-w-48`}>
              <option value="all">All topics</option>
              {Object.entries(topicNames).map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
          )}
          <select value={difficulty} onChange={(e) => {
            setDifficulty(e.target.value)
            setPage(1)
          }} aria-label="Filter by difficulty" className={`${field} lg:max-w-48`}>
            <option value="all">All difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          {!fixedStatus && (
            <select value={status} onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }} aria-label="Filter by status" className={`${field} lg:max-w-44`}>
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="attempted">Attempted</option>
              <option value="todo">Not attempted</option>
            </select>
          )}
          <select value={sort} onChange={(e) => {
            setSort(e.target.value)
            setPage(1)
          }} aria-label="Sort questions" className={`${field} lg:max-w-44`}>
            <option value="order">Question order</option>
            <option value="order-desc">Reverse order</option>
            <option value="difficulty">Difficulty</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500" aria-live="polite">
            <span className="font-semibold text-slate-800">{completedCount} of {tasks.length}</span> completed
            <span className="mx-2 text-slate-300">·</span>
            Showing <span className="font-semibold text-slate-800">{firstVisible}–{lastVisible}</span> of{' '}
            <span className="font-semibold text-slate-800">{visible.length}</span> questions
          </p>
          {filtersActive && (
            <button onClick={clear} className="text-xs font-semibold text-brand-600 transition hover:text-brand-700">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div>
          <EmptyState title="No questions match your filters" text="Try a different search or clear the filters.">
            <button onClick={clear} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Clear filters
            </button>
          </EmptyState>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pageTasks.map((t, index) => (
            <article
              key={t.id}
              className="group flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5 sm:p-5"
              style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <StatusIcon status={t.status} />
                  <span className="text-xs font-medium text-slate-400">Question {String(t.questionOrder).padStart(2, '0')}</span>
                </div>
                <DifficultyBadge level={t.difficulty} />
              </div>
              <div className="mt-4 flex-1">
                {showTopic && <p className="text-[11px] font-semibold tracking-[0.12em] text-brand-600 uppercase">{topicNames[t.category]}</p>}
                <Link to={`/tasks/${t.slug}`} className="mt-1 block text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700">
                  {t.title}
                </Link>
                {t.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{t.description}</p>}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${t.status === 'completed' ? 'text-emerald-700' : t.status === 'attempted' ? 'text-amber-700' : 'text-slate-500'}`}>
                  <StatusIcon status={t.status} />
                  {t.status === 'completed' ? 'Solved' : t.status === 'attempted' ? 'In progress' : 'Ready to solve'}
                </span>
                <Link
                  to={`/tasks/${t.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-brand-600 hover:text-white focus-visible:outline-brand-500"
                >
                  {t.status === 'completed' ? 'Review' : t.status === 'attempted' ? 'Continue' : 'Solve'}
                  <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      {pageCount > 1 && (
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm" aria-label="Question pages">
          <p className="text-xs text-slate-500">Page {currentPage} of {pageCount}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="min-h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
                className={`size-9 rounded-lg text-sm font-semibold transition ${
                  currentPage === pageNumber
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={currentPage === pageCount}
              className="min-h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
