import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../api/client'
import { ErrorBlock, LoadingBlock } from '../../components/States'

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default function PlatformOverview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/platform/stats').then((r) => setData(r.data)).catch((e) => setError(getErrorMessage(e)))
  }, [])

  if (error) return <ErrorBlock message={error} />
  if (!data) return <LoadingBlock />

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform overview</h1>
        <p className="text-sm text-slate-500">Live figures across every organization.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Organizations" value={data.organizations.total} />
        <Stat label="Active organizations" value={data.organizations.active} hint={`${data.organizations.suspended} suspended`} />
        <Stat label="Trial organizations" value={data.subscriptions.trial} />
        <Stat label="Paid organizations" value={data.subscriptions.paid} />
        <Stat label="Students (in organizations)" value={data.students} />
        <Stat label="Teachers" value={data.teachers} />
        <Stat label="Total submissions" value={data.submissions} hint={`${data.users} registered users`} />
        <Stat label="Subscription revenue" value="—" hint="Shown once billing is connected" />
      </div>
    </div>
  )
}
