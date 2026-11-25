import { useState } from 'react'
import { fetchEmails } from '../../api/admin'
import useAsync from '../../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../../components/States'
import ProgressBar from '../../components/ProgressBar'

const PAGE_SIZE = 10
export const EMAIL_TYPE_LABEL = { 'signup-code': 'Sign-up code', 'password-reset': 'Forgot password', 'admin-reset': 'Admin reset', other: 'Other' }
const STATUS_TONE = { sent: 'bg-success-soft text-success', failed: 'bg-danger-soft text-danger', skipped: 'bg-warn-soft text-warn' }
const STATUS_LABEL = { sent: 'Sent', failed: 'Failed', skipped: 'Not set up' }
const FILTERS = [
  { value: '', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
]

export default function AdminEmails() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const { data, loading, error } = useAsync(() => fetchEmails({ status, page, limit: PAGE_SIZE }), `admin-emails-${status}-${page}`)
  const pages = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 1
  const today = data?.today
  const used = today ? Math.round((today.sent / today.limit) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Emails</h2>
        <p className="mt-1 text-fg-muted">Every email VirVerse sends: sign-up codes and password resets.</p>
      </header>

      {today && (
        <section aria-label="Emails today" data-tour="email-today" className="rounded-card border border-line bg-surface p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-fg-subtle">Sent today</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-fg">{today.sent}<span className="text-base font-normal text-fg-muted"> of about {today.limit} a day</span></p>
            </div>
            <dl className="flex gap-5 text-sm">
              {Object.entries(today.byType).filter(([, n]) => n > 0).map(([type, n]) => (
                <div key={type}><dt className="text-xs text-fg-subtle">{EMAIL_TYPE_LABEL[type]}</dt><dd className="font-semibold tabular-nums text-fg">{n}</dd></div>
              ))}
              <div><dt className="text-xs text-fg-subtle">Failed</dt><dd className={`font-semibold tabular-nums ${today.failed ? 'text-danger' : 'text-fg'}`}>{today.failed}</dd></div>
            </dl>
          </div>
          <div className="mt-4"><ProgressBar percent={Math.min(used, 100)} label="Share of the daily email limit used" /></div>
          <p className="mt-2 text-xs text-fg-subtle">
            {used >= 80 ? 'Close to the daily limit. Emails may start failing until tomorrow.' : 'Gmail free accounts allow about 500 emails a day. The count resets at midnight.'}
            {today.skipped > 0 && ` ${today.skipped} not sent today because email is not set up.`}
          </p>
        </section>
      )}

      <div className="flex gap-1 self-start rounded-control border border-line p-0.5 w-fit" role="group" aria-label="Filter emails">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" aria-pressed={status === f.value} onClick={() => { setStatus(f.value); setPage(1) }} className={`rounded-md px-3 py-1.5 text-sm transition-colors ${status === f.value ? 'bg-surface-2 font-medium text-fg' : 'text-fg-muted hover:text-fg'}`}>{f.label}</button>
        ))}
      </div>

      {loading && <LoadingBlock label="Loading emails…" />}
      {error && <ErrorBlock message={error} />}
      {data && data.emails.length === 0 && <EmptyState title="No emails yet" text="Emails appear here when someone signs up or resets a password." />}
      {data && data.emails.length > 0 && (
        <>
          <ol className="overflow-hidden rounded-card border border-line bg-surface">
            {data.emails.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3.5 last:border-b-0">
                <span className={`w-20 shrink-0 rounded-full px-2.5 py-0.5 text-center text-xs font-medium ${STATUS_TONE[e.status]}`}>{STATUS_LABEL[e.status]}</span>
                <div className="min-w-0 flex-1 basis-60">
                  <p className="truncate text-sm text-fg">{e.to}</p>
                  <p className="truncate text-xs text-fg-subtle">{EMAIL_TYPE_LABEL[e.type]}{e.error ? ` · ${e.error}` : ''}</p>
                </div>
                <time dateTime={e.createdAt} className="shrink-0 text-xs tabular-nums text-fg-subtle">{new Date(e.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time>
              </li>
            ))}
          </ol>
          <div className="flex items-center justify-between text-sm text-fg-muted">
            <span className="tabular-nums">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total}</span>
            <div className="flex items-center gap-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="hover:text-fg disabled:opacity-40">← Newer</button>
              <span className="tabular-nums">Page {page} of {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="hover:text-fg disabled:opacity-40">Older →</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
