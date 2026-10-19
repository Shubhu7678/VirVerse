import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api, { getErrorMessage } from '../../api/client'
import { useOrg } from '../../context/OrgContext'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/States'
import Icon, { icons } from '../../components/Icon'

function InviteModal({ onClose, onCreated }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('student')
  const [invitation, setInvitation] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const invite = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/orgs/invitations', { email, role })
      setInvitation(data.invitation)
      onCreated()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Invite organization member" onClose={onClose}>
      {invitation ? (
        <div className="space-y-3">
          <p className="text-sm">Invitation created. Share this link with {email} (expires in {invitation.expiresInDays} days):</p>
          <a className="block break-all rounded-lg bg-slate-50 p-3 text-sm text-brand-700 underline" href={invitation.link}>
            {invitation.link}
          </a>
          <Button onClick={async () => { await navigator.clipboard.writeText(invitation.link) }}>Copy link</Button>
          <Button className="bg-slate-700 hover:bg-slate-800" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={invite} className="space-y-4">
          {error && <ErrorBlock message={error} />}
          <Input id="member-email" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div>
            <label htmlFor="member-role" className="mb-1.5 block text-sm font-medium">Role</label>
            <select id="member-role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <Button loading={busy}>Create invitation</Button>
        </form>
      )}
    </Modal>
  )
}

export default function OrganizationPeople() {
  const [params, setParams] = useSearchParams()
  const { activeOrganization } = useOrg()
  const [role, setRole] = useState(params.get('role') || 'all')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [inviting, setInviting] = useState(false)
  const [reload, setReload] = useState(0)
  const [search, setSearch] = useState('')
  const refresh = useCallback(() => setReload((n) => n + 1), [])

  useEffect(() => {
    const nextRole = params.get('role') || 'all'
    setRole(nextRole)
  }, [params])

  useEffect(() => {
    if (!activeOrganization) return
    const query = role === 'all' ? {} : { role }
    api.get('/orgs/people', { params: query })
      .then((res) => { setData(res.data); setError('') })
      .catch((err) => setError(getErrorMessage(err)))
  }, [activeOrganization, role, reload])

  const changeRole = (e) => {
    const value = e.target.value
    setRole(value)
    setParams(value === 'all' ? {} : { role: value })
  }

  if (error) return <ErrorBlock message={error} />
  if (!activeOrganization || !data) return <LoadingBlock />
  const canInvite = activeOrganization.role === 'org_admin'
  const visiblePeople = data.items.filter((person) => {
    const query = search.trim().toLowerCase()
    return !query || person.name.toLowerCase().includes(query) || person.email.toLowerCase().includes(query)
  })
  const removeMember = async (person) => {
    if (!window.confirm(`Remove ${person.name} from this organization? Their personal account and submissions will remain intact.`)) return
    try {
      await api.delete(`/orgs/people/${person.id}`)
      refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="profile-enter relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="pointer-events-none absolute -top-28 -right-12 -z-10 size-80 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 bottom-0 -z-10 size-56 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="flex flex-col gap-5 p-5 sm:p-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">{activeOrganization.organization.name}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">People & performance</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              {canInvite
                ? 'Manage your organization members and keep an eye on learning activity.'
                : 'Find your assigned students and check their learning progress.'}
            </p>
          </div>
          {canInvite && (
            <Button className="w-full shrink-0 rounded-xl md:w-auto" onClick={() => setInviting(true)}>
              <Icon d={icons.profile} className="size-4" /> Invite a person
            </Button>
          )}
        </div>
      </section>

      <section className="profile-enter rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5" style={{ animationDelay: '70ms' }}>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="relative block">
            <Icon d={icons.profile} className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search people by name or email"
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <select aria-label="Filter by role" value={role} onChange={changeRole} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
            <option value="all">All people</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500 md:justify-center">
            <span>Showing</span>
            <span className="text-sm font-bold text-slate-900">{visiblePeople.length}</span>
            <span>{visiblePeople.length === 1 ? 'person' : 'people'}</span>
          </div>
        </div>
      </section>

      {data.items.length === 0 ? (
        <EmptyState title="No people found" text={canInvite ? 'Invite a teacher or student to this organization.' : 'No students are currently assigned to your classes.'} />
      ) : visiblePeople.length === 0 ? (
        <EmptyState title="No matching people" text="Try another name or email, or clear your search.">
          <button onClick={() => setSearch('')} className="text-sm font-semibold text-brand-600 hover:text-brand-700">Clear search</button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visiblePeople.map((person, index) => {
            const isStudent = person.role === 'student'
            const initials = person.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
            return (
              <article
                key={person.id}
                className="profile-enter group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5 sm:p-6"
                style={{ animationDelay: `${100 + index * 35}ms` }}
              >
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm ring-1 ring-inset ${isStudent ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-brand-50 text-brand-700 ring-brand-100'}`}>
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/organization/people/${person.id}`} className="truncate text-base font-bold text-slate-900 transition-colors hover:text-brand-700">
                        {person.name}
                      </Link>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${isStudent ? 'bg-emerald-50 text-emerald-700' : person.role === 'org_admin' ? 'bg-violet-50 text-violet-700' : 'bg-brand-50 text-brand-700'}`}>
                        {person.role.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 break-all text-xs text-slate-500">{person.email}</p>
                  </div>
                  {canInvite && person.role !== 'org_admin' && (
                    <button onClick={() => removeMember(person)} className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600">
                      Remove
                    </button>
                  )}
                </div>

                <div className={`mt-5 grid gap-2 ${isStudent ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-medium text-slate-500">{isStudent ? 'Enrolled classes' : 'Assigned classes'}</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{person.classes}</p>
                  </div>
                  {person.role === 'teacher' && (
                    <div className="rounded-xl bg-indigo-50/70 p-3">
                      <p className="text-[10px] font-medium text-indigo-700">Students assigned</p>
                      <p className="mt-1 text-lg font-bold text-indigo-900">{person.studentsAssigned}</p>
                    </div>
                  )}
                  {isStudent && (
                    <div className="rounded-xl bg-emerald-50/70 p-3">
                      <p className="text-[10px] font-medium text-emerald-700">Questions solved</p>
                      <p className="mt-1 text-lg font-bold text-emerald-900">{person.questionsSolved}</p>
                    </div>
                  )}
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-medium text-slate-500">{isStudent ? 'Submissions' : 'Last activity'}</p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-800">
                      {isStudent
                        ? person.submissions
                        : person.lastActivity ? new Date(person.lastActivity).toLocaleDateString() : 'No activity'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">
                    {isStudent
                      ? person.lastActivity ? `Last active ${new Date(person.lastActivity).toLocaleDateString()}` : 'No recent learning activity'
                      : 'Organization team member'}
                  </span>
                  <Link to={`/organization/people/${person.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-brand-600 hover:text-white">
                    View profile <Icon d={icons.arrow} className="size-3.5" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {inviting && <InviteModal onClose={() => setInviting(false)} onCreated={refresh} />}
    </div>
  )
}
