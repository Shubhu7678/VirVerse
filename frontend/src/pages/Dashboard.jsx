import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTasks } from '../api/tasks'
import { fetchSubmissions } from '../api/execute'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import Icon, { icons } from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import { DifficultyBadge } from '../components/Badges'

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${tone}`}>{value}</p>
    </div>
  )
}

const verdictTone = {
  Accepted: 'text-emerald-600',
  'Wrong Answer': 'text-red-600',
  'Compilation Error': 'text-amber-600',
  'Runtime Error': 'text-red-600',
  'Time Limit Exceeded': 'text-amber-600',
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useAsync(fetchTasks, 'dashboard')
  const subs = useAsync(fetchSubmissions, 'dashboard-subs')

  if (loading) return <LoadingBlock />
  if (error) return <ErrorBlock message={error} />

  const { stats, continueTask } = data
  const recent = (subs.data || []).slice(0, 5)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-linear-to-r from-brand-600 to-violet-600 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-indigo-100">
            {continueTask
              ? continueTask.attempted
                ? `Continue with “${continueTask.title}”.`
                : `Start with “${continueTask.title}”.`
              : 'You have completed every question. Amazing!'}
          </p>
        </div>
        {continueTask ? (
          <Link
            to={`/tasks/${continueTask.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-indigo-50"
          >
            Continue Learning
            <Icon d={icons.arrow} className="size-4" />
          </Link>
        ) : (
          <span className="rounded-lg bg-white/20 px-4 py-2.5 text-sm font-semibold">All done 🎉</span>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total questions" value={stats.total} />
        <Stat label="Solved" value={stats.completed} tone="text-emerald-600" />
        <Stat label="Remaining" value={stats.pending} tone="text-amber-600" />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Overall completion</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-brand-600">{stats.percent}%</p>
          <div className="mt-3">
            <ProgressBar percent={stats.percent} label="Overall completion" size="h-1.5" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent submissions</h2>
        {subs.loading ? (
          <LoadingBlock />
        ) : subs.error ? (
          <ErrorBlock message={subs.error} />
        ) : recent.length === 0 ? (
          <EmptyState title="No submissions yet" text="Solve your first question and your submissions will show up here.">
            {continueTask && (
              <Link to={`/tasks/${continueTask.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Start with “{continueTask.title}”
              </Link>
            )}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {recent.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
                <Link to={`/tasks/${s.task.slug}`} className="min-w-40 flex-1 font-medium hover:text-brand-600">
                  {s.task.title}
                </Link>
                <DifficultyBadge level={s.task.difficulty} />
                <span className={`font-medium ${verdictTone[s.status] || ''}`}>{s.status}</span>
                <time className="text-xs text-slate-500" dateTime={s.createdAt}>
                  {new Date(s.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
