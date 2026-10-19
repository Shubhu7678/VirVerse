import { Link } from 'react-router-dom'
import { fetchSubmissions } from '../api/execute'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import { DifficultyBadge } from '../components/Badges'

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
        <EmptyState title="No submissions yet" text="Submit a solution to a question and it will be listed here.">
          <Link to="/tasks" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Browse topics
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {data.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
              <Link to={`/tasks/${s.task.slug}`} className="min-w-40 flex-1 font-medium hover:text-brand-600">
                {s.task.title}
              </Link>
              <DifficultyBadge level={s.task.difficulty} />
              <span className={`font-medium ${s.status === 'Accepted' ? 'text-emerald-600' : 'text-red-600'}`}>{s.status}</span>
              <span className="text-xs text-slate-500">
                {s.passedCount}/{s.totalCount} tests
              </span>
              <time className="text-xs text-slate-500" dateTime={s.createdAt}>
                {new Date(s.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
