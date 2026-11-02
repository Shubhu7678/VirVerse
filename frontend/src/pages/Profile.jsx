import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTasks } from '../api/tasks'
import { fetchOrganizationLeaderboard, fetchSubmissionActivity, fetchSubmissions } from '../api/execute'
import useAsync from '../hooks/useAsync'
import { ErrorBlock, LoadingBlock } from '../components/States'
import Icon, { icons } from '../components/Icon'
import { useOrg } from '../context/OrgContext'
import { taskPath } from '../utils/languageRoutes'

const dateKey = (date) => date.toISOString().slice(0, 10)

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
      week.push({
        date,
        key,
        count: inRange ? activityByDate.get(key) ?? 0 : 0,
        inRange,
      })
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
  const levelClass = (count) => {
    if (!count) return 'bg-slate-100 dark:bg-slate-800'
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-950'
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-800'
    if (count === 3) return 'bg-emerald-600 dark:bg-emerald-600'
    return 'bg-emerald-800 dark:bg-emerald-400'
  }
  const formatDate = (date) => new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)

  return (
    <section className="profile-enter rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-200 dark:bg-slate-100 sm:p-6" style={{ animationDelay: '120ms' }}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Icon d={icons.check} className="size-4 text-brand-500" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-800">Learning Activity</p>
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-900">{yearTotal} submissions in the last year</h2>
          <p className="mt-1 text-sm text-slate-500">Each square marks a day you submitted a solution.</p>
        </div>
        <span className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 dark:border-slate-300">
          {activeDays} active days
        </span>
      </div>
      <div className="mt-5 overflow-x-auto pb-2" role="region" aria-label="Submission activity over the last year" tabIndex={0}>
        <div className="min-w-[760px]">
          <div className="mb-2 grid grid-cols-[2rem_1fr] gap-2">
            <span aria-hidden="true" />
            <div className="grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
              {monthLabels.map((label, index) => <span key={index} className="h-4 text-[10px] text-slate-500">{label}</span>)}
            </div>
          </div>
          <div className="grid grid-cols-[2rem_1fr] gap-2">
            <div className="grid grid-rows-7 text-[10px] text-slate-500">
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
          <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
            <span className="mr-1">Less</span>
            {[0, 1, 2, 3, 4].map((count) => (
              <span key={count} aria-hidden="true" className={`size-3 rounded-[3px] ${levelClass(count)}`} />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, detail, icon, tone }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md dark:border-slate-200 dark:bg-slate-100">
      <span className={`flex size-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon d={icon} className="size-5" />
      </span>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-700">{label}</p>
      <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
    </div>
  )
}

function RecentActivity({ submissions, loading, error }) {
  const recentSubmissions = submissions?.slice(0, 4) ?? []

  return (
    <section className="profile-enter rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-200 dark:bg-slate-100 sm:p-6" style={{ animationDelay: '180ms' }}>
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-200">
        <Icon d={icons.submissions} className="size-4 text-brand-500" />
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-800">Recent Activity</h2>
      </div>
      {loading ? (
        <LoadingBlock label="Loading recent activity…" />
      ) : error ? (
        <div className="pt-4"><ErrorBlock message={error} /></div>
      ) : recentSubmissions.length ? (
        <ul className="divide-y divide-slate-100 dark:divide-slate-200">
          {recentSubmissions.map((submission) => (
            <li key={submission.id} className="flex items-center gap-3 py-3">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${submission.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-slate-100 text-slate-500 dark:bg-slate-200'}`}>
                <Icon d={submission.status === 'Accepted' ? icons.check : icons.code} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <Link to={taskPath(submission.task.language || 'c', submission.task.slug)} className="block truncate text-sm font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-800">
                  {submission.task.title}
                </Link>
                <span className="mt-0.5 block text-xs text-slate-500">{submission.status}</span>
              </span>
              <time className="shrink-0 text-[11px] text-slate-500" dateTime={submission.createdAt}>
                {new Date(submission.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-44 flex-col items-center justify-center py-7 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 dark:border-slate-300">
            <Icon d={icons.submissions} className="size-6" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-700">No activity yet</p>
          <p className="mt-1 text-xs text-slate-500">Start solving tasks to see your activity here.</p>
          <Link to="/tasks" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700">
            Browse tasks <Icon d={icons.arrow} className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  )
}

export default function Profile() {
  const { user, memberships = [] } = useAuth()
  const { activeOrganization, organizationId } = useOrg()
  const activeMemberships = memberships.filter((membership) => membership.organization?.status === 'active')
  const activeRole = activeOrganization?.role
    ?? memberships.find((membership) => String(membership.organization?._id) === String(organizationId))?.role
  const showLearnerProgress = user?.platformRole !== 'super_admin'
    && (activeRole === 'student' || (!activeRole && activeMemberships.length === 0))
  const { data, loading, error } = useAsync(
    showLearnerProgress ? fetchTasks : () => Promise.resolve(null),
    `profile-progress-${showLearnerProgress}`,
  )
  const activityState = useAsync(fetchSubmissionActivity, 'profile-submission-activity')
  const submissionsState = useAsync(fetchSubmissions, 'profile-recent-submissions')
  const leaderboardState = useAsync(
    organizationId ? fetchOrganizationLeaderboard : () => Promise.resolve(null),
    `profile-leaderboard-${organizationId ?? 'none'}`,
  )
  const name = user?.name?.trim() || 'Learner'
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const joinedDate = user?.createdAt ? new Date(user.createdAt) : null
  const joined = joinedDate && !Number.isNaN(joinedDate.getTime())
    ? joinedDate.toLocaleDateString(undefined, { dateStyle: 'long' })
    : null
  const roleLabel = user?.platformRole === 'super_admin'
    ? 'Super admin'
    : activeRole?.replaceAll('_', ' ') ?? 'Standalone learner'
  const completed = data?.stats?.completed ?? 0
  const available = data?.stats?.total ?? 0
  const percent = data?.stats?.percent ?? 0
  const points = user?.points ?? 0
  const level = user?.level ?? 1
  const nextLevelProgress = points % 100
  const activitySummary = activityState.data
    ? getActivitySummary(activityState.data.asOf, activityState.data.activity)
    : { submissions: 0, activeDays: 0 }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="profile-enter">
        <p className="text-[10px] font-bold tracking-[0.18em] text-brand-600 uppercase">Account</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-900">Your Profile</h1>
          <p className="pb-1 text-xs text-slate-500">A snapshot of your learning journey</p>
        </div>
      </div>

      <section className="profile-enter relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-200 dark:bg-slate-100" style={{ animationDelay: '60ms' }}>
        <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/2 bg-linear-to-br from-brand-50 via-transparent to-emerald-100/70 dark:from-brand-100/30 dark:to-emerald-950/40" />
        <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-600 to-teal-500 text-xl font-bold text-white shadow-lg shadow-brand-600/20 ring-4 ring-white dark:ring-slate-100 sm:size-[72px]">
            {initials}
            <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white dark:border-slate-100">
              <Icon d={icons.check} className="size-3" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900">{name}</h2>
              <span className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-brand-700 dark:border-brand-200 dark:bg-brand-50">{roleLabel}</span>
            </div>
            <p className="mt-1 break-all text-xs text-slate-500">{user?.email}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-500">
              {joined && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon d={icons.submissions} className="size-3.5 text-slate-400" />
                  Joined {joined}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Icon d={icons.tasks} className="size-3.5 text-slate-400" />
                {activeMemberships.length ? `${activeMemberships.length} organization${activeMemberships.length === 1 ? '' : 's'}` : 'Independent learner'}
              </span>
            </div>
          </div>
          {showLearnerProgress && <div className="flex shrink-0 items-center gap-3 border-l border-slate-200 pl-5 dark:border-slate-300">
            <div className="relative flex size-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-100">
              <svg viewBox="0 0 36 36" className="absolute size-12 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-300" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${Math.min(100, Math.max(0, percent)) * 0.942} 100`} strokeLinecap="round" className="text-brand-600 transition-all duration-700" />
              </svg>
              <span className="text-xs font-bold text-brand-700 dark:text-brand-700">{percent}%</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Overall Progress</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-900">{completed} of {available} solved</p>
            </div>
          </div>}
        </div>
      </section>

      <section className="profile-enter grid gap-3 sm:grid-cols-[minmax(240px,2fr)_repeat(3,minmax(100px,0.55fr))]" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200/80 bg-linear-to-r from-emerald-50 via-white to-teal-50 p-4 shadow-sm dark:border-emerald-900 dark:from-slate-100 dark:via-slate-100 dark:to-emerald-950/40 sm:px-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl" aria-hidden="true">🔥</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 className="text-lg font-bold text-slate-900">Level {level}</h2>
              <p className="text-sm font-semibold text-brand-600">{points} points</p>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-200" role="progressbar" aria-label="Progress to next level" aria-valuenow={nextLevelProgress} aria-valuemin="0" aria-valuemax="100">
              <div className="h-full rounded-full bg-linear-to-r from-brand-500 to-emerald-400 transition-[width] duration-500" style={{ width: `${nextLevelProgress}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">{100 - nextLevelProgress} points to level {level + 1}</p>
          </div>
        </div>
        <Stat label="Submissions" value={activitySummary.submissions} detail="In the last year" icon={icons.code} tone="bg-cyan-50 text-cyan-600 dark:bg-cyan-950" />
        <Stat label="Completed" value={completed} detail="Solved questions" icon={icons.check} tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950" />
        <Stat label="Active Days" value={activitySummary.activeDays} detail="In the last year" icon={icons.submissions} tone="bg-teal-50 text-teal-600 dark:bg-teal-950" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        {activityState.loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-200 dark:bg-slate-100"><LoadingBlock label="Loading your activity…" /></div>}
        {activityState.error && <ErrorBlock message={activityState.error} />}
        {activityState.data && <ActivityHeatmap {...activityState.data} />}
        <RecentActivity {...submissionsState} />
      </div>

      {organizationId && leaderboardState.loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><LoadingBlock label="Loading your organization leaderboard…" /></div>}
      {organizationId && leaderboardState.error && <ErrorBlock message={leaderboardState.error} />}
      {organizationId && leaderboardState.data && (
        <section className="profile-enter rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-200 dark:bg-slate-100 sm:p-6" style={{ animationDelay: '160ms' }}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">Your organization</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Leaderboard</h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {leaderboardState.data.currentRank
                ? `You’re #${leaderboardState.data.currentRank} of ${leaderboardState.data.total}`
                : 'No ranking yet'}
            </p>
          </div>
          {leaderboardState.data.entries.length ? (
            <ol className="mt-4 divide-y divide-slate-100">
              {leaderboardState.data.entries.map((entry) => (
                <li key={entry.id} className={`flex items-center gap-3 py-3 ${entry.id === user?.id ? 'font-semibold text-brand-700' : ''}`}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {entry.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {entry.name}{entry.id === user?.id ? ' (you)' : ''}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">Level {entry.level}</span>
                  <span className="w-20 shrink-0 text-right text-sm font-semibold">{entry.points} pts</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No active organization members to rank yet.</p>
          )}
        </section>
      )}

      {showLearnerProgress && loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><LoadingBlock label="Loading your progress…" /></div>}
      {showLearnerProgress && error && <ErrorBlock message={error} />}
      {showLearnerProgress && data && (
        <>
          <section aria-label="Learning path details" className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-200 dark:bg-slate-100">
              <p className="text-xs text-slate-500">Available questions</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-900">{available}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-200 dark:bg-slate-100">
              <p className="text-xs text-slate-500">Topics unlocked</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-900">{data.categories.filter((topic) => !topic.locked).length} <span className="text-xs font-medium text-slate-500">of {data.categories.length}</span></p>
            </div>
          </section>
          <section className="profile-enter rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-200 dark:bg-slate-100 sm:p-6" style={{ animationDelay: '180ms' }}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Icon d={icons.dashboard} className="size-5" />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">Your organizations</h2>
                <p className="text-xs text-slate-500">Your learning communities</p>
              </div>
            </div>
            {memberships.length ? (
              <ul className="mt-5 space-y-2">
                {memberships.map((membership, index) => (
                  <li key={membership._id ?? membership.organization?._id ?? `${membership.role}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:border-brand-100 hover:bg-brand-50/50">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-700 shadow-sm">
                      {(membership.organization?.name ?? 'O').trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">{membership.organization?.name ?? 'Organization'}</span>
                      <span className="mt-0.5 block text-xs capitalize text-slate-500">{membership.role?.replaceAll('_', ' ') ?? 'Member'}</span>
                    </span>
                    <Icon d={icons.arrow} className="size-4 shrink-0 -rotate-45 text-slate-400" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
                <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <Icon d={icons.profile} />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-800">Learning independently</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">You are not part of an organization yet. Explore your available topics to choose what to learn next.</p>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>Memberships</span>
              <span className="font-semibold text-slate-700">{memberships.length}</span>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
