import { Link } from 'react-router-dom'
import { fetchSubmissions } from '../api/execute'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import { DifficultyBadge } from '../components/Badges'
import { submissionView } from '../utils/submissionView'

export default function Submissions() {
  const { data, loading, error } = useAsync(fetchSubmissions, 'submissions')

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">Your submitted solutions and their results.</p>
      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} />
      ) : data.length === 0 ? (
        <EmptyState title="No submissions yet" text="Submit a solution or finish an HTML lesson and it will be listed here.">
          <Link to="/tasks" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Browse topics
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {data.map((s) => {
            const view = submissionView(s)
            return (
            <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
              <Link to={view.to} className="min-w-40 flex-1 font-medium hover:text-brand-600">
                {view.title}
              </Link>
              {view.html
                ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{view.label}</span>
                : <DifficultyBadge level={view.difficulty} />}
              <span className={`font-medium ${s.status === 'Accepted' || s.status === 'Completed' ? 'text-success' : 'text-red-600'}`}>{s.status}</span>
              {!view.html && (
                <span className="text-xs text-slate-500">
                  {s.passedCount}/{s.totalCount} tests
                </span>
              )}
              <time className="text-xs text-slate-500" dateTime={s.createdAt}>
                {new Date(s.createdAt).toLocaleString()}
              </time>
            </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
