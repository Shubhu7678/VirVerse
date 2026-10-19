import { useAuth } from '../context/AuthContext'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { ErrorBlock, LoadingBlock } from '../components/States'
import ProgressBar from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'
import { useOrg } from '../context/OrgContext'

function Stat({ label, value, detail, icon, tone }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon d={icon} className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
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

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="profile-enter">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">Account</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your profile</h1>
          <p className="pb-1 text-sm text-slate-500">A snapshot of your learning journey</p>
        </div>
      </div>

      <section className="profile-enter relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm" style={{ animationDelay: '60ms' }}>
        <div className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 -z-10 size-52 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-8">
          <div className="relative flex size-24 shrink-0 items-center justify-center rounded-[1.75rem] bg-linear-to-br from-brand-600 to-violet-600 text-3xl font-bold text-white shadow-lg shadow-brand-600/20 ring-4 ring-white">
            {initials}
            <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
              <Icon d={icons.check} className="size-4" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{name}</h2>
              <span className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold capitalize text-brand-700">{roleLabel}</span>
            </div>
            <p className="mt-1 break-all text-sm text-slate-500">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              {joined && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon d={icons.submissions} className="size-4 text-slate-400" />
                  Joined {joined}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Icon d={icons.tasks} className="size-4 text-slate-400" />
                {activeMemberships.length ? `${activeMemberships.length} organization${activeMemberships.length === 1 ? '' : 's'}` : 'Independent learner'}
              </span>
            </div>
          </div>
          {showLearnerProgress && <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <div className="relative flex size-12 items-center justify-center rounded-full bg-brand-50">
              <svg viewBox="0 0 36 36" className="absolute size-12 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${Math.min(100, Math.max(0, percent)) * 0.942} 100`} strokeLinecap="round" className="text-brand-600 transition-all duration-700" />
              </svg>
              <span className="text-xs font-bold text-brand-700">{percent}%</span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Overall progress</p>
              <p className="text-sm font-semibold text-slate-900">{completed} of {available} solved</p>
            </div>
          </div>}
        </div>
      </section>

      {showLearnerProgress && loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><LoadingBlock label="Loading your progress…" /></div>}
      {showLearnerProgress && error && <ErrorBlock message={error} />}
      {showLearnerProgress && data && (
        <>
          <section className="profile-enter grid gap-4 sm:grid-cols-3" style={{ animationDelay: '120ms' }}>
            <Stat label="Available questions" value={available} detail="In your current learning path" icon={icons.list} tone="bg-indigo-50 text-indigo-600" />
            <Stat label="Solved questions" value={completed} detail="Questions with accepted solutions" icon={icons.check} tone="bg-emerald-50 text-emerald-600" />
            <Stat label="Topics unlocked" value={data.categories.filter((topic) => !topic.locked).length} detail={`Across ${data.categories.length} learning topics`} icon={icons.code} tone="bg-violet-50 text-violet-600" />
          </section>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="profile-enter rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '180ms' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">Your roadmap</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Topic progress</h2>
                  <p className="mt-1 text-sm text-slate-500">Keep your momentum going, one topic at a time.</p>
                </div>
                <span className="hidden rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 sm:block">
                  {data.categories.filter((topic) => topic.percent === 100).length} completed
                </span>
              </div>
              {data.categories.length ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {data.categories.map((topic, index) => (
                    <div
                      key={topic.slug}
                      className="group min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-slate-100 hover:shadow-md"
                      style={{ animationDelay: `${220 + index * 35}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${topic.locked ? 'bg-slate-200 text-slate-500' : topic.percent === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'}`}>
                            {topic.order ?? String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-800">{topic.name}</h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {topic.locked ? 'Organization access required' : `${topic.completed} of ${topic.total} questions`}
                            </p>
                          </div>
                        </div>
                        {topic.locked
                          ? <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">Locked</span>
                          : <span className="shrink-0 text-xs font-semibold text-slate-600">{topic.percent}%</span>}
                      </div>
                      <div className="mt-4">
                        <ProgressBar percent={topic.percent} label={`${topic.name} progress`} size="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No topic progress to show yet.</p>
              )}
            </section>

            <section className="profile-enter rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '240ms' }}>
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
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">You are not part of an organization yet. Your current learning access is shown in your topic roadmap.</p>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>Memberships</span>
                <span className="font-semibold text-slate-700">{memberships.length}</span>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
