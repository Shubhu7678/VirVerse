import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../api/client'
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/States'

export default function PlatformAuditLogs() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/platform/audit-logs', { params: { page } }).then((r) => setData(r.data)).catch((e) => setError(getErrorMessage(e)))
  }, [page])

  if (error) return <ErrorBlock message={error} />
  if (!data) return <LoadingBlock />
  const pages = Math.max(1, Math.ceil(data.total / data.limit))

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <h1 className="text-2xl font-bold">Audit logs</h1>
      {data.items.length === 0 ? (
        <EmptyState title="No activity yet" text="Administrative actions will be recorded here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase">
              <tr><th className="p-3">When</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Organization</th></tr>
            </thead>
            <tbody>
              {data.items.map((l) => (
                <tr key={l._id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-3">{l.actor?.email ?? '—'}</td>
                  <td className="p-3 font-mono text-xs">{l.action}</td>
                  <td className="p-3">{l.organization?.name ?? 'Platform'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Page {page} of {pages}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Previous</button>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}
