import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchStudent, setStudentAccess } from '../../api/admin'
import { getErrorMessage } from '../../api/client'
import useAsync from '../../hooks/useAsync'
import { LoadingBlock, ErrorBlock } from '../../components/States'
import Icon, { icons } from '../../components/Icon'
import ProgressBar from '../../components/ProgressBar'
import { DifficultyBadge } from '../../components/Badges'
import { LANGUAGE_LABELS } from './Students'
import { isOnline, timeAgo } from '../../utils/timeAgo'

const verdictTone = {
  Accepted: 'bg-success-soft text-success',
  'Wrong Answer': 'bg-danger-soft text-danger',
  'Compilation Error': 'bg-warn-soft text-warn',
  'Runtime Error': 'bg-danger-soft text-danger',
  'Time Limit Exceeded': 'bg-warn-soft text-warn',
}

const categoryName = (slug) => slug.replace(/^(js|python)-/, '').replaceAll('-', ' ')

function Toggle({ on, busy, label, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-60 ${on ? 'border-success bg-success' : 'border-line-strong bg-surface-2'}`}
    >
      <span className={`absolute top-0.5 left-0.5 size-4.5 rounded-full transition-transform ${on ? 'translate-x-5 bg-bg' : 'bg-fg-subtle'}`} />
    </button>
  )
}

export default function AdminStudentDetail() {
  const { id } = useParams()
  const { data, loading, error } = useAsync(() => fetchStudent(id), `admin-student-${id}`)
  const [unlocked, setUnlocked] = useState(null)
  const [busy, setBusy] = useState(null)
  const [saveError, setSaveError] = useState('')

  if (loading) return <LoadingBlock label="Loading student…" />
  if (error) return <ErrorBlock message={error} />

  const current = unlocked ?? data.student.unlockedLanguages
  const change = async (language, on) => {
    const next = on ? [...current, language] : current.filter((l) => l !== language)
    setBusy(language)
    setSaveError('')
    try {
      const res = await setStudentAccess(id, next)
      setUnlocked(res.unlockedLanguages)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not save access'))
    } finally {
      setBusy(null)
    }
  }

  const { student, languages, recent } = data
  const initials = student.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const totalSolved = languages.reduce((n, l) => n + l.solved, 0)
  const facts = [
    ['Last active', isOnline(student.lastActiveAt) ? 'Online now' : timeAgo(student.lastActiveAt)],
    ['Joined', new Date(student.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })],
    ['Level', student.level],
    ['Points', student.points],
    ['Solved', totalSolved],
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg">
        <Icon d={icons.back} className="size-4" /> All students
      </Link>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent-text">{initials}</span>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-fg">{student.name}</h2>
            <p className="truncate text-fg-muted">{student.email}</p>
          </div>
        </div>
        <dl className="flex shrink-0 divide-x divide-line rounded-card border border-line bg-surface">
          {facts.map(([label, value]) => (
            <div key={label} className="px-4 py-2.5">
              <dt className="text-xs text-fg-subtle">{label}</dt>
              <dd className="text-sm font-semibold tabular-nums text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="languages-heading" className="space-y-3">
        <div>
          <h3 id="languages-heading" className="text-lg font-semibold text-fg">Access and progress</h3>
          <p className="text-sm text-fg-muted">Every language starts with 10 free questions. Switch a language on to unlock all of its topics for this student.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {languages.map((l) => {
            const on = current.includes(l.language)
            const percent = l.total ? Math.round((l.solved / l.total) * 100) : 0
            const name = LANGUAGE_LABELS[l.language]
            return (
              <article key={l.language} className={`flex flex-col rounded-card border bg-surface p-5 ${on ? 'border-success/50' : 'border-line'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-fg">{name}</h4>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${on ? 'bg-success-soft text-success' : 'bg-surface-2 text-fg-muted'}`}>
                    {on ? 'Unlocked' : 'Free tier'}
                  </span>
                </div>

                <p className="mt-5 text-3xl font-semibold tabular-nums tracking-tight text-fg">
                  {l.solved}<span className="text-base font-normal text-fg-muted"> of {on ? l.total : 10} solved</span>
                </p>
                <div className="mt-3">
                  <ProgressBar percent={on ? percent : Math.min(l.solved * 10, 100)} label={`${name} progress`} />
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <div>
                    <p className="text-sm font-medium text-fg">Full access</p>
                    <p className="text-xs text-fg-subtle">{on ? `All ${l.total} questions open` : `Unlock ${Math.max(l.total - 10, 0)} more`}</p>
                  </div>
                  <Toggle on={on} busy={busy === l.language} label={`${name} full access`} onChange={(v) => change(l.language, v)} />
                </div>
              </article>
            )
          })}
        </div>
        {saveError && <p role="alert" className="text-sm text-danger">{saveError}</p>}
      </section>

      {languages.some((l) => l.solved > 0) && (
        <section aria-labelledby="topics-heading" className="space-y-3">
          <h3 id="topics-heading" className="text-lg font-semibold text-fg">Solved by topic</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {languages.filter((l) => l.solved > 0).map((l) => (
              <div key={l.language} className="rounded-card border border-line bg-surface">
                <p className="border-b border-line px-4 py-3 text-sm font-medium text-fg">{LANGUAGE_LABELS[l.language]}</p>
                <ul className="divide-y divide-line">
                  {l.categories.filter((c) => c.solved > 0).map((c) => (
                    <li key={c.category} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="capitalize text-fg-muted">{categoryName(c.category)}</span>
                      <span className="tabular-nums text-fg">{c.solved} / {c.total}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="recent-heading" className="space-y-3">
        <h3 id="recent-heading" className="text-lg font-semibold text-fg">Recent submissions</h3>
        {recent.length === 0 ? (
          <div className="rounded-card border border-dashed border-line-strong p-8 text-center">
            <p className="font-medium text-fg">No submissions yet</p>
            <p className="mt-1 text-sm text-fg-muted">Their attempts will show up here as soon as they submit code.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {recent.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <span className="min-w-0 flex-1 basis-48 truncate font-medium text-fg">{s.task.title}</span>
                <span className="text-xs text-fg-subtle">{LANGUAGE_LABELS[s.task.language ?? 'c']}</span>
                <DifficultyBadge level={s.task.difficulty} />
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${verdictTone[s.status] || 'bg-surface-2 text-fg-muted'}`}>{s.status}</span>
                <time dateTime={s.createdAt} className="text-xs tabular-nums text-fg-subtle">{new Date(s.createdAt).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
