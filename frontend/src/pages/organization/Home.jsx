import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../../api/client'
import { useOrg } from '../../context/OrgContext'
import { ErrorBlock, LoadingBlock } from '../../components/States'
import Icon, { icons } from '../../components/Icon'

const overviewIcons = [icons.profile, icons.profile, icons.tasks, icons.submissions]
const overviewTones = [
  'bg-indigo-50 text-indigo-600',
  'bg-violet-50 text-violet-600',
  'bg-brand-50 text-brand-700',
  'bg-emerald-50 text-emerald-600',
]

function Stat({ label, value, hint, icon, tone }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon d={icon} className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  )
}

export default function OrganizationHome() {
  const { activeOrganization, memberships } = useOrg()
  const [summary, setSummary] = useState(null)
  const [structure, setStructure] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeOrganization) return
    let cancelled = false
    Promise.all([api.get('/orgs/summary'), api.get('/orgs/structure')])
      .then(([summaryResult, structureResult]) => {
        if (cancelled) return
        setSummary(summaryResult.data)
        setStructure(structureResult.data)
        setError('')
      })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)) })
    return () => { cancelled = true }
  }, [activeOrganization])

  if (error) return <ErrorBlock message={error} />
  if (!activeOrganization || !summary || !structure) return <LoadingBlock />

  const admin = activeOrganization.role === 'org_admin'
  const members = memberships.find((m) => String(m.organization?._id) === String(activeOrganization.organization.id))
  const stats = [
    {
      label: admin ? 'Organization students' : 'Students in my classes',
      value: summary.counts.students,
      hint: 'Learners in your organization',
    },
    {
      label: admin ? 'Organization teachers' : 'Teaching account',
      value: admin ? summary.counts.teachers : 'Active',
      hint: admin ? 'Teachers in your organization' : 'Your teacher workspace',
    },
    {
      label: admin ? 'Organization classes' : 'My classes',
      value: summary.counts.classes,
      hint: `${structure.departments.length} departments · ${structure.courses.length} courses`,
    },
    {
      label: 'Active students',
      value: summary.activeStudentsLast30Days,
      hint: 'Submitted code in the last 30 days',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="profile-enter relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="pointer-events-none absolute -top-28 -right-12 -z-10 size-80 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 bottom-0 -z-10 size-56 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="flex flex-col gap-5 p-5 sm:p-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">
              {activeOrganization.organization.name}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {admin ? 'Organization overview' : 'Teacher overview'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
              {admin
                ? 'A clear view of your learners, teaching team, and academic activity.'
                : 'Keep up with your classes and see how your students are progressing.'}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium capitalize text-slate-600 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              Signed in as {members?.role?.replaceAll('_', ' ') ?? activeOrganization.role.replaceAll('_', ' ')}
            </span>
          </div>
          <Link
            to="/organization/people"
            className="inline-flex shrink-0 items-center justify-between gap-5 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md"
          >
            {admin ? 'Manage people' : 'View my students'}
            <Icon d={icons.arrow} className="size-4" />
          </Link>
        </div>
      </section>

      <section className="profile-enter grid gap-4 sm:grid-cols-2 xl:grid-cols-4" style={{ animationDelay: '80ms' }}>
        {stats.map((stat, index) => (
          <Stat key={stat.label} {...stat} icon={overviewIcons[index]} tone={overviewTones[index]} />
        ))}
      </section>

      <section className="profile-enter rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '140ms' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">Teaching team</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{admin ? 'Teacher student reach' : 'Student progress'}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {admin
                ? 'Student counts are deduplicated across each teacher’s assigned classes.'
                : 'Learning activity across the students in your assigned classes.'}
            </p>
          </div>
          <Link to="/organization/people" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 hover:text-brand-700">
            View directory <Icon d={icons.arrow} className="size-4" />
          </Link>
        </div>
        {summary.teacherPerformance.length > 0 ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {summary.teacherPerformance.map((teacher, index) => (
              <article key={teacher.id} className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition duration-200 hover:border-brand-200 hover:bg-slate-100 hover:shadow-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/70">
                  {admin
                    ? teacher.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || `T${index + 1}`
                    : <Icon d={icons.tasks} className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-slate-900">{admin ? teacher.name : 'Your teaching impact'}</h3>
                  {admin && <p className="mt-0.5 truncate text-xs text-slate-500">{teacher.email}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{teacher.studentsAssigned} students</span>
                    <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{teacher.classes} classes</span>
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{teacher.studentsWithAcceptedWork} with accepted work</span>
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-lg font-bold text-slate-900">{teacher.averageQuestionsSolved}</p>
                  <p className="text-[10px] text-slate-500">avg. solved</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm"><Icon d={icons.profile} /></span>
            <p className="mt-3 text-sm font-semibold text-slate-800">No teachers assigned yet</p>
            <p className="mt-1 text-xs text-slate-500">Once teachers are assigned to classes, their student progress will appear here.</p>
            {admin && <Link to="/organization/people" className="mt-3 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700">Invite your first teacher →</Link>}
          </div>
        )}
      </section>
    </div>
  )
}
