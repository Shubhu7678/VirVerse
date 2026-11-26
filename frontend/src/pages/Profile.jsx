import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchOverview } from '../api/tasks'
import { fetchSubmissionActivity, fetchSubmissions } from '../api/execute'
import useAsync from '../hooks/useAsync'
import { EmptyState, ErrorBlock } from '../components/States'
import Icon, { icons } from '../components/Icon'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ProgressBar'
import { buttonClasses } from '../components/buttonStyles'
import { submissionView } from '../utils/submissionView'

const dateKey = (date) => date.toISOString().slice(0, 10)

const LANGUAGES = [
  ['c', 'C programming'],
  ['javascript', 'JavaScript'],
  ['python', 'Python'],
]

const verdictTone = {
  Accepted: 'bg-success-soft text-success',
  'Wrong Answer': 'bg-danger-soft text-danger',
  'Compilation Error': 'bg-warn-soft text-warn',
  'Runtime Error': 'bg-danger-soft text-danger',
  'Time Limit Exceeded': 'bg-warn-soft text-warn',
  Completed: 'bg-success-soft text-success',
}

function getActivitySummary(asOf, activity) {
  const todayUtc = new Date(`${asOf}T00:00:00.000Z`)
  const rangeStart = new Date(todayUtc)
  rangeStart.setUTCDate(rangeStart.getUTCDate() - 364)
  const startKey = dateKey(rangeStart)
  const endKey = dateKey(todayUtc)
  const recentActivity = activity.filter(({ date }) => date >= startKey && date <= endKey)

  return {
    submissions: recentActivity.reduce((total, { count }) => total + count, 0),
    activeDays: recentActivity.filter(({ count }) => count > 0).length,
  }
}

// Five steps of the accent colour, so the heatmap follows the light and dark themes.
const levelClass = (count) => {
  if (!count) return 'bg-inset'
  if (count === 1) return 'bg-accent/25'
  if (count === 2) return 'bg-accent/50'
  if (count === 3) return 'bg-accent/75'
  return 'bg-accent'
}

function ActivityHeatmap({ asOf, activity }) {
  const todayUtc = new Date(`${asOf}T00:00:00.000Z`)
  const rangeStart = new Date(todayUtc)
  rangeStart.setUTCDate(rangeStart.getUTCDate() - 364)
  const gridStart = new Date(rangeStart)
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay())
  const activityByDate = new Map(activity.map(({ date, count }) => [date, count]))
  const weeks = []
  const cursor = new Date(gridStart)

  while (cursor <= todayUtc) {
    const week = []
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(cursor)
      const key = dateKey(date)
      const inRange = date >= rangeStart && date <= todayUtc
      week.push({ date, key, count: inRange ? activityByDate.get(key) ?? 0 : 0, inRange })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  }

  const { submissions: yearTotal, activeDays } = getActivitySummary(asOf, activity)
  const monthLabels = weeks.map((week, index) => {
    const month = week[0].date.getUTCMonth()
    return index === 0 || month !== weeks[index - 1][0].date.getUTCMonth()
      ? new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(week[0].date)
      : ''
  })
  const formatDate = (date) => new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)

  return (
    <Card as="section" aria-label="Learning activity">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold text-fg">
          {yearTotal} submission{yearTotal === 1 ? '' : 's'} <span className="font-normal text-fg-muted">in the last year</span>
        </h2>
        <p className="text-sm text-fg-subtle tabular-nums">{activeDays} active day{activeDays === 1 ? '' : 's'}</p>
      </div>
      <div className="mt-4 overflow-x-auto pb-1" role="region" aria-label="Submission activity over the last year" tabIndex={0}>
        <div className="min-w-[720px]">
          <div className="mb-1.5 grid grid-cols-[2rem_1fr] gap-2">
            <span aria-hidden="true" />
            <div className="grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
              {monthLabels.map((label, index) => <span key={index} className="h-4 text-xs text-fg-subtle">{label}</span>)}
            </div>
          </div>
          <div className="grid grid-cols-[2rem_1fr] gap-2">
            <div className="grid grid-rows-7 text-xs text-fg-subtle">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, index) => <span key={index} className="flex h-3 items-center">{label}</span>)}
            </div>
            <div className="grid gap-x-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-y-1">
                  {week.map(({ date, key, count, inRange }) => (
                    <span
                      key={key}
                      role="img"
                      title={inRange ? `${count} ${count === 1 ? 'submission' : 'submissions'} on ${formatDate(date)}` : undefined}
                      aria-label={inRange ? `${count} ${count === 1 ? 'submission' : 'submissions'} on ${formatDate(date)}` : undefined}
                      className={`size-3 rounded-[3px] ${inRange ? levelClass(count) : 'invisible'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-fg-subtle">
            <span className="mr-1">Less</span>
            {[0, 1, 2, 3, 4].map((count) => (
              <span key={count} aria-hidden="true" className={`size-3 rounded-[3px] ${levelClass(count)}`} />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

function Stat({ label, value, detail }) {
  return (
    <div className="bg-surface px-5 py-4">
      <p className="text-sm text-fg-subtle">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-fg tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-fg-subtle">{detail}</p>
    </div>
  )
}

function RecentSubmissions({ data, loading, error }) {
  return (
    <section aria-label="Recent submissions" className="min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fg">Recent submissions</h2>
        <Link to="/submissions" className="inline-flex items-center gap-1 text-sm text-accent-text hover:underline">
          View all <Icon d={icons.arrow} className="size-3.5" />
        </Link>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="skeleton h-48" role="status" aria-label="Loading recent submissions" />
        ) : error ? (
          <ErrorBlock message={error} />
        ) : !data?.length ? (
          <EmptyState title="No submissions yet" text="Solve a question and your latest attempts will show up here.">
            <Link to="/tasks" className={buttonClasses({ variant: 'secondary' })}>
              Browse questions <Icon d={icons.arrow} className="size-4" />
            </Link>
          </EmptyState>
        ) : (
          <Card padded={false} className="divide-y divide-line">
            {data.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
                <Link to={submissionView(s).to} className="min-w-0 flex-1 basis-40 truncate font-medium text-fg hover:text-accent-text">
                  {submissionView(s).title}
                </Link>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${verdictTone[s.status] || 'bg-surface-2 text-fg-muted'}`}>{s.status}</span>
                <time dateTime={s.createdAt} className="text-xs text-fg-subtle tabular-nums">
                  {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </time>
              </div>
            ))}
          </Card>
        )}
      </div>
    </section>
  )
}

function AccessCard({ unlocked }) {
  return (
    <section data-tour="profile-access" aria-label="Your access" className="min-w-0">
      <h2 className="text-lg font-semibold text-fg">Your access</h2>
      <Card padded={false} className="mt-3 divide-y divide-line">
        {LANGUAGES.map(([key, label]) => {
          const on = unlocked.includes(key)
          return (
            <div key={key} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-medium text-fg">{label}</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${on ? 'bg-success-soft text-success' : 'bg-surface-2 text-fg-muted'}`}>
                {on ? 'Fully unlocked' : 'First 10 free'}
              </span>
            </div>
          )
        })}
      </Card>
      <p className="mt-2 text-xs text-fg-subtle">Your admin can unlock the rest of a language for you.</p>
    </section>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const showLearnerProgress = !user?.isAdmin
  const { data, loading, error } = useAsync(
    showLearnerProgress ? fetchOverview : () => Promise.resolve(null),
    showLearnerProgress ? 'overview' : 'profile-no-progress',
  )
  const activityState = useAsync(fetchSubmissionActivity, 'profile-submission-activity')
  const submissionsState = useAsync(() => fetchSubmissions(5), 'recent-submissions-5')

  const name = user?.name?.trim() || 'Learner'
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const joinedDate = user?.createdAt ? new Date(user.createdAt) : null
  const joined = joinedDate && !Number.isNaN(joinedDate.getTime())
    ? joinedDate.toLocaleDateString(undefined, { dateStyle: 'long' })
    : null
  const roleLabel = user?.isAdmin ? 'Admin' : user?.isDemo ? 'Demo' : 'Student'
  const points = user?.points ?? 0
  const level = user?.level ?? 1
  const nextLevelProgress = points % 100
  const c = data?.c
  const activitySummary = activityState.data
    ? getActivitySummary(activityState.data.asOf, activityState.data.activity)
    : null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card as="section" aria-label="Account" className="!p-0 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-xl font-semibold text-accent-text" aria-hidden="true">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-semibold tracking-tight text-fg">{name}</h1>
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-fg-muted">{roleLabel}</span>
            </div>
            <p className="mt-1 break-all text-sm text-fg-muted">{user?.email}</p>
            {joined && <p className="mt-0.5 text-sm text-fg-subtle">Joined {joined}</p>}
          </div>
        </div>
        <div className="border-t border-line bg-surface-2/60 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-semibold text-fg">Level {level}</p>
            <p className="text-sm text-fg-muted tabular-nums">{points} points</p>
          </div>
          <div className="mt-2.5">
            <ProgressBar percent={nextLevelProgress} label="Progress to next level" />
          </div>
          <p className="mt-2 text-xs text-fg-subtle tabular-nums">{100 - nextLevelProgress} points to level {level + 1}</p>
        </div>
      </Card>

      <Card as="section" aria-label="Your numbers" padded={false} className="overflow-hidden">
        <div className={`grid grid-cols-2 gap-px bg-line ${showLearnerProgress ? 'lg:grid-cols-4' : ''}`}>
        {showLearnerProgress && (
          <Stat
            label="Solved"
            value={c ? `${c.completed}` : '–'}
            detail={c ? `of ${c.total} C questions · ${c.percent}%` : loading ? 'Loading…' : 'Unavailable'}
          />
        )}
        <Stat label="Submissions" value={activitySummary ? activitySummary.submissions : '–'} detail="In the last year" />
        <Stat label="Active days" value={activitySummary ? activitySummary.activeDays : '–'} detail="In the last year" />
        {showLearnerProgress && (
          <Stat
            label="Topics unlocked"
            value={c ? c.unlockedTopics : '–'}
            detail={c ? `of ${c.topics} in C` : loading ? 'Loading…' : 'Unavailable'}
          />
        )}
        </div>
      </Card>
      {showLearnerProgress && error && <ErrorBlock message={error} />}

      {activityState.loading && <div className="skeleton h-52" role="status" aria-label="Loading your activity" />}
      {activityState.error && <ErrorBlock message={activityState.error} />}
      {activityState.data && <ActivityHeatmap {...activityState.data} />}

      <div className={`grid gap-6 ${showLearnerProgress ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]' : ''}`}>
        <RecentSubmissions {...submissionsState} />
        {showLearnerProgress && <AccessCard unlocked={user?.unlockedLanguages ?? []} />}
      </div>
    </div>
  )
}
