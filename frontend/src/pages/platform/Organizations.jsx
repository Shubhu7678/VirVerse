import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../api/client'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/States'

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—')
const statusStyle = {
  active: 'bg-emerald-50 text-emerald-700',
  suspended: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
  trial: 'bg-amber-50 text-amber-700',
  expired: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
}
const Pill = ({ v }) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[v] ?? 'bg-slate-100 text-slate-600'}`}>{v}</span>
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
const selectCls = 'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm'

function InviteLink({ invitation }) {
  return (
    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
      <p className="font-medium">Invitation link (shown once, expires in {invitation.expiresInDays} days):</p>
      <p className="mt-1 break-all select-all">{invitation.link}</p>
    </div>
  )
}

function CreateModal({ plans, onClose, onDone }) {
  const [form, setForm] = useState({ name: '', slug: '', type: 'college', contactEmail: '', adminEmail: '', planKey: 'trial' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [invitation, setInvitation] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value, ...(k === 'name' && !f.slugEdited ? { slug: slugify(e.target.value) } : {}) }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = Object.fromEntries(Object.entries(form).filter(([k, v]) => k !== 'slugEdited' && v !== ''))
      const { data } = await api.post('/platform/organizations', body)
      onDone()
      if (data.invitation) setInvitation(data.invitation)
      else onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Create organization" onClose={onClose}>
      {invitation ? (
        <>
          <p className="text-sm">Organization created. Send this link to the admin:</p>
          <InviteLink invitation={invitation} />
          <Button className="mt-4" onClick={onClose}>Done</Button>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          {error && <ErrorBlock message={error} />}
          <Input id="o-name" label="Name" value={form.name} onChange={set('name')} required />
          <Input id="o-slug" label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugEdited: true }))} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Type</label>
            <select className={selectCls} value={form.type} onChange={set('type')}>
              {['college', 'university', 'school', 'institute', 'other'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Input id="o-contact" label="Contact email" type="email" value={form.contactEmail} onChange={set('contactEmail')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Plan</label>
            <select className={selectCls} value={form.planKey} onChange={set('planKey')}>
              {plans.map((p) => <option key={p.key} value={p.key}>{p.name} ({p.studentSeats} students)</option>)}
            </select>
          </div>
          <Input id="o-admin" label="First admin email (optional)" type="email" value={form.adminEmail} onChange={set('adminEmail')} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium">Cancel</button>
            <Button loading={loading}>Create</Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function ManageModal({ org, plans, onClose, onDone }) {
  const sub = org.subscription
  const [planKey, setPlanKey] = useState(sub?.plan ?? 'trial')
  const [studentSeats, setStudentSeats] = useState(sub?.studentSeats ?? 0)
  const [teacherSeats, setTeacherSeats] = useState(sub?.teacherSeats ?? 0)
  const [extend, setExtend] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [invitation, setInvitation] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn) => {
    setError('')
    setBusy(true)
    try { await fn(); onDone() } catch (err) { setError(getErrorMessage(err)) } finally { setBusy(false) }
  }
  const saveSeats = () => run(() => api.put(`/platform/organizations/${org._id}/subscription`, { studentSeats: Number(studentSeats), teacherSeats: Number(teacherSeats) }))
  const changePlan = () => {
    if (window.confirm(`Switch ${org.name} to the ${planKey} plan? This resets seats and dates to the plan defaults.`)) {
      run(() => api.put(`/platform/organizations/${org._id}/subscription`, { planKey }))
    }
  }
  const extendTrial = () => run(() => api.put(`/platform/organizations/${org._id}/subscription`, { extendTrialDays: Number(extend) }))
  const invite = () => run(async () => {
    const { data } = await api.post(`/platform/organizations/${org._id}/invitations`, { email: adminEmail })
    setInvitation(data.invitation)
    setAdminEmail('')
  })

  return (
    <Modal title={org.name} onClose={onClose}>
      <div className="space-y-5">
        {error && <ErrorBlock message={error} />}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Plan</h3>
          <div className="flex gap-2">
            <select className={selectCls} value={planKey} onChange={(e) => setPlanKey(e.target.value)}>
              {plans.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
            </select>
            <Button className="w-auto" loading={busy} onClick={changePlan}>Apply</Button>
          </div>
        </section>
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Seat limits</h3>
          <div className="grid grid-cols-2 gap-2">
            <Input id="m-s" label="Students" type="number" min="0" value={studentSeats} onChange={(e) => setStudentSeats(e.target.value)} />
            <Input id="m-t" label="Teachers" type="number" min="0" value={teacherSeats} onChange={(e) => setTeacherSeats(e.target.value)} />
          </div>
          <Button loading={busy} onClick={saveSeats}>Save seats</Button>
        </section>
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Extend trial</h3>
          <div className="flex items-end gap-2">
            <Input id="m-e" label="Days (1–365)" type="number" min="1" max="365" value={extend} onChange={(e) => setExtend(e.target.value)} />
            <Button className="w-auto" loading={busy} disabled={!extend} onClick={extendTrial}>Extend</Button>
          </div>
        </section>
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Invite organization admin</h3>
          <div className="flex items-end gap-2">
            <Input id="m-a" label="Email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            <Button className="w-auto" loading={busy} disabled={!adminEmail} onClick={invite}>Invite</Button>
          </div>
          {invitation && <InviteLink invitation={invitation} />}
        </section>
      </div>
    </Modal>
  )
}

export default function PlatformOrganizations() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [plans, setPlans] = useState([])
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [managing, setManaging] = useState(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => { api.get('/platform/plans').then((r) => setPlans(r.data.plans)).catch(() => {}) }, [])
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])
  useEffect(() => {
    api.get('/platform/organizations', { params: { page, search: query } })
      .then((r) => { setData(r.data); setError('') })
      .catch((e) => setError(getErrorMessage(e)))
  }, [page, query, tick])

  const toggle = async (org) => {
    const next = org.status === 'active' ? 'suspended' : 'active'
    if (!window.confirm(`${next === 'suspended' ? 'Suspend' : 'Activate'} ${org.name}? ${next === 'suspended' ? 'Members will lose access until reactivated. No data is deleted.' : ''}`)) return
    try { await api.post(`/platform/organizations/${org._id}/status`, { status: next }); reload() } catch (e) { setError(getErrorMessage(e)) }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or slug" aria-label="Search organizations" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          <Button className="w-auto" onClick={() => setCreating(true)}>Create organization</Button>
        </div>
      </div>
      {error && <ErrorBlock message={error} />}
      {!data ? <LoadingBlock /> : data.items.length === 0 ? (
        <EmptyState title="No organizations" text="Create the first college to start onboarding.">
          <Button className="w-auto" onClick={() => setCreating(true)}>Create organization</Button>
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase">
              <tr>
                <th className="p-3">Organization</th><th className="p-3">Plan</th><th className="p-3">Subscription</th>
                <th className="p-3">Students</th><th className="p-3">Teachers</th><th className="p-3">Trial expiry</th>
                <th className="p-3">Last activity</th><th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o._id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3"><p className="font-medium">{o.name}</p><p className="text-xs text-slate-500">{o.slug} · <Pill v={o.status} /></p></td>
                  <td className="p-3">{o.subscription?.plan ?? '—'}</td>
                  <td className="p-3">{o.subscription ? <Pill v={o.subscription.status} /> : '—'}</td>
                  <td className="p-3">{o.studentCount}{o.subscription && <span className="text-slate-400"> / {o.subscription.studentSeats}</span>}</td>
                  <td className="p-3">{o.teacherCount}{o.subscription && <span className="text-slate-400"> / {o.subscription.teacherSeats}</span>}</td>
                  <td className="p-3">{fmt(o.subscription?.trialEndsAt)}</td>
                  <td className="p-3">{fmt(o.lastActivity)}</td>
                  <td className="p-3 whitespace-nowrap">
                    <button onClick={() => setManaging(o)} className="mr-3 font-medium text-brand-600 hover:underline">Manage</button>
                    <button onClick={() => toggle(o)} className={`font-medium hover:underline ${o.status === 'active' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {o.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Previous</button>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
      {creating && <CreateModal plans={plans} onClose={() => setCreating(false)} onDone={reload} />}
      {managing && <ManageModal key={managing._id} org={managing} plans={plans} onClose={() => setManaging(null)} onDone={reload} />}
    </div>
  )
}
