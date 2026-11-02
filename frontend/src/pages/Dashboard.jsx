import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTasks } from '../api/tasks'
import { fetchSubmissions } from '../api/execute'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import Icon, { icons } from '../components/Icon'
import ProgressBar from '../components/ProgressBar'
import { DifficultyBadge } from '../components/Badges'
import './dashboard.css'
import { taskPath } from '../utils/languageRoutes'

function Stat({ label, value, icon, tone, percent }) {
  return (
    <article className={`vv-stat-card ${tone}`}>
      <div className="vv-stat-top">
        <span className="vv-stat-label">{label}</span>
        <span className="vv-stat-icon"><Icon d={icon} className="size-[18px]" /></span>
      </div>
      <div className="vv-stat-bottom">
        <p className="vv-stat-value">{value}</p>
        <div className="vv-stat-ring" style={{ '--progress': `${percent}%` }} aria-hidden="true">
          <span><Icon d={icon} className="size-4" /></span>
        </div>
      </div>
    </article>
  )
}

const verdictTone = {
  Accepted: 'vv-verdict-success',
  'Wrong Answer': 'vv-verdict-error',
  'Compilation Error': 'vv-verdict-warning',
  'Runtime Error': 'vv-verdict-error',
  'Time Limit Exceeded': 'vv-verdict-warning',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [showDemoGuide, setShowDemoGuide] = useState(true)
  const { data, loading, error } = useAsync(fetchTasks, 'dashboard')
  const javascript = useAsync(() => fetchTasks('javascript'), 'dashboard-javascript')
  const python = useAsync(() => fetchTasks('python'), 'dashboard-python')
  const subs = useAsync(fetchSubmissions, 'dashboard-subs')

  if (loading) return <LoadingBlock />
  if (error) return <ErrorBlock message={error} />

  const { stats, continueTask } = data
  const recent = (subs.data || []).slice(0, 5)
  const basics = data.categories.find((category) => category.slug === 'basics')
  const isDemoComplete = Boolean(user.isDemo && basics && basics.completed === basics.total)
  const firstName = user.name?.trim().split(/\s+/)[0] || 'Learner'

  return (
    <div className="vv-dashboard">
      <section className="vv-welcome">
        <div className="vv-welcome-copy">
          <span className="vv-kicker"><span /> YOUR LEARNING SPACE</span>
          <h1>Welcome, <span>{firstName}</span> <span aria-hidden="true">👋</span></h1>
          <p>
            {continueTask
              ? continueTask.attempted
                ? `Ready to pick up “${continueTask.title}”?`
                : `Your next challenge is “${continueTask.title}”.`
              : 'You have completed every question. Amazing!'}
          </p>
          <div className="vv-welcome-badges">
            {user.isDemo && <span className="vv-welcome-badge"><Icon d={icons.code} className="size-3.5" /> Private demo</span>}
            <span className="vv-welcome-badge"><Icon d={icons.check} className="size-3.5" /> Keep your momentum</span>
          </div>
        </div>
        <div className="vv-welcome-art" aria-hidden="true">
          <div className="vv-art-orbit vv-art-orbit-one" />
          <div className="vv-art-orbit vv-art-orbit-two" />
          <span className="vv-art-spark vv-art-spark-one">✦</span>
          <span className="vv-art-spark vv-art-spark-two">✧</span>
          <div className="vv-art-code"><span>&lt;/&gt;</span></div>
          <div className="vv-art-laptop">
            <div className="vv-art-screen">
              <span><i /><i /><i /></span>
              <b>&lt;code /&gt;</b>
              <small>build something great</small>
            </div>
            <div className="vv-art-base" />
          </div>
        </div>
        {continueTask ? (
          <Link to={`/tasks/${continueTask.slug}`} className="vv-continue-button">
            Continue learning <Icon d={icons.arrow} className="size-4" />
          </Link>
        ) : (
          <span className="vv-continue-button vv-continue-complete">All done <span aria-hidden="true">🎉</span></span>
        )}
      </section>

      {user.isDemo && showDemoGuide && (
        <section className="vv-demo-guide">
          <div className="vv-demo-icon"><Icon d={icons.code} className="size-5" /></div>
          <div className="vv-demo-content">
            <div className="vv-demo-heading">
              <h2>Your C learning session starts here</h2>
              <span>Private demo · 10 questions</span>
            </div>
            <p>
              Try a question, run your code, then submit it to see your result. This demo progress belongs only to you and expires after 24 hours.
            </p>
            <ol>
              <li><span>01</span>Open a C Basics question</li>
              <li><span>02</span>Run code and check output</li>
              <li><span>03</span>Submit to save your progress</li>
            </ol>
          </div>
          <div className="vv-demo-actions">
            {basics?.nextSlug && (
              <Link to={`/tasks/${basics.nextSlug}`} className="vv-demo-start">
                {isDemoComplete
                  ? 'Review C Basics'
                  : continueTask?.attempted || basics.completed
                    ? 'Continue C Basics'
                    : 'Start question 1'}
                <Icon d={icons.arrow} className="size-4" />
              </Link>
            )}
            <button type="button" onClick={() => setShowDemoGuide(false)} className="vv-demo-dismiss">
              Dismiss
            </button>
          </div>
        </section>
      )}

      <section className="vv-stats-grid" aria-label="Learning statistics">
        <Stat label="Total questions" value={stats.total} icon={icons.list} tone="vv-stat-violet" percent={100} />
        <Stat label="Solved" value={stats.completed} icon={icons.check} tone="vv-stat-green" percent={stats.total ? (stats.completed / stats.total) * 100 : 0} />
        <Stat label="Remaining" value={stats.pending} icon={icons.submissions} tone="vv-stat-amber" percent={stats.total ? (stats.pending / stats.total) * 100 : 0} />
        <article className="vv-stat-card vv-stat-blue">
          <div className="vv-stat-top">
            <span className="vv-stat-label">Overall completion</span>
            <span className="vv-stat-icon"><Icon d={icons.dashboard} className="size-[18px]" /></span>
          </div>
          <div className="vv-stat-bottom">
            <p className="vv-stat-value">{stats.percent}%</p>
            <div className="vv-stat-ring" style={{ '--progress': `${stats.percent}%` }} aria-hidden="true">
              <span><Icon d={icons.dashboard} className="size-4" /></span>
            </div>
          </div>
          <ProgressBar percent={stats.percent} label="Overall completion" size="h-1.5" />
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Choose your learning path</h2>
          <p className="mt-1 text-sm text-slate-500">Pick a language and keep building your skills.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/tasks"
            className="group rounded-2xl border border-slate-200 bg-linear-to-br from-violet-50 to-white p-5 transition hover:border-violet-300 hover:shadow-md"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">C</span>
            <h3 className="mt-3 font-bold text-slate-900 group-hover:text-violet-700">C Programming</h3>
            <p className="mt-1 text-sm text-slate-500">
              {data.stats.completed} of {data.stats.total} questions complete · 17 topics
            </p>
          </Link>
          <Link
            to="/javascript"
            className="group rounded-2xl border border-slate-200 bg-linear-to-br from-amber-50 to-white p-5 transition hover:border-amber-300 hover:shadow-md"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-100 text-sm font-bold text-amber-700">JS</span>
            <h3 className="mt-3 font-bold text-slate-900 group-hover:text-amber-700">JavaScript</h3>
            {javascript.loading ? (
              <p className="mt-1 text-sm text-slate-500">Loading your progress…</p>
            ) : javascript.error ? (
              <p className="mt-1 text-sm text-red-600">{javascript.error}</p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                {javascript.data.stats.completed} of {javascript.data.stats.total} questions complete · {javascript.data.categories.length} topics
              </p>
            )}
          </Link>
          <Link
            to="/python"
            className="group rounded-2xl border border-slate-200 bg-linear-to-br from-sky-50 to-white p-5 transition hover:border-sky-300 hover:shadow-md"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sm font-bold text-sky-700">Py</span>
            <h3 className="mt-3 font-bold text-slate-900 group-hover:text-sky-700">Python</h3>
            {python.loading ? (
              <p className="mt-1 text-sm text-slate-500">Loading your progress…</p>
            ) : python.error ? (
              <p className="mt-1 text-sm text-red-600">{python.error}</p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                {python.data.stats.completed} of {python.data.stats.total} questions complete · {python.data.categories.length} topics
              </p>
            )}
          </Link>
        </div>
      </section>

      <section className="vv-recent">
        <div className="vv-section-heading">
          <div>
            <span className="vv-section-icon"><Icon d={icons.submissions} className="size-4" /></span>
            <div>
              <h2>Recent submissions</h2>
              <p>Your latest coding activity</p>
            </div>
          </div>
          <Link to="/submissions" className="vv-view-all">
            View all <Icon d={icons.arrow} className="size-3.5" />
          </Link>
        </div>
        {subs.loading ? (
          <LoadingBlock />
        ) : subs.error ? (
          <ErrorBlock message={subs.error} />
        ) : recent.length === 0 ? (
          <div className="vv-empty-state">
            <EmptyState title="No submissions yet" text="Solve your first question and your submissions will show up here.">
              {continueTask && (
                <Link to={`/tasks/${continueTask.slug}`} className="vv-empty-cta">
                  Start with “{continueTask.title}” <Icon d={icons.arrow} className="size-4" />
                </Link>
              )}
            </EmptyState>
          </div>
        ) : (
          <ul className="vv-submission-list">
            {recent.map((s) => (
              <li key={s.id}>
                <span className="vv-submission-file"><Icon d={icons.code} className="size-4" /></span>
                <Link to={taskPath(s.task.language || 'c', s.task.slug)} className="vv-submission-title">
                  {s.task.title}
                  <span>Open problem</span>
                </Link>
                <DifficultyBadge level={s.task.difficulty} />
                <span className={`vv-submission-verdict ${verdictTone[s.status] || ''}`}>{s.status}</span>
                <time dateTime={s.createdAt}>{new Date(s.createdAt).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
