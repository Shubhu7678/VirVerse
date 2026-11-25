import { useState } from 'react'
import { fetchLeaderboard } from '../api/leaderboard'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'

const PAGE_SIZE = 10
const medal = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard() {
  const [page, setPage] = useState(1)
  const { data, loading, error } = useAsync(() => fetchLeaderboard({ page, limit: PAGE_SIZE }), `leaderboard-${page}`)
  const pages = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 1

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Leaderboard</h2>
        <p className="mt-1 text-fg-muted">
          {data?.showSolved ? 'Points and solved questions for every student.' : 'Points earned by solving questions. Easy 10, Medium 20, Hard 30.'}
        </p>
      </header>

      {data?.me && (
        <div data-tour="lb-me" className="flex items-center justify-between rounded-card border border-accent-border bg-accent-soft px-5 py-4">
          <div>
            <p className="text-sm text-accent-text">Your position</p>
            <p className="text-2xl font-semibold tabular-nums text-fg">#{data.me.rank} <span className="text-base font-normal text-fg-muted">of {data.total}</span></p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums text-fg">{data.me.points}</p>
            <p className="text-sm text-fg-muted">points · level {data.me.level}</p>
          </div>
        </div>
      )}

      {loading && <LoadingBlock label="Loading leaderboard…" />}
      {error && <ErrorBlock message={error} />}
      {data && data.entries.length === 0 && <EmptyState title="No one is ranked yet" text="Solve a question to earn the first points." />}
      {data && data.entries.length > 0 && (
        <>
          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <div className="flex items-center gap-4 border-b border-line bg-surface-2 px-4 py-2 text-xs font-medium text-fg-subtle">
              <span className="w-10 text-center">Rank</span>
              <span className="flex-1">Student</span>
              {data.showSolved && <span className="w-20 text-right">Solved</span>}
              <span className="w-20 text-right">Points</span>
            </div>
            <ol>
              {data.entries.map((e) => (
                <li key={e.id} className={`flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0 ${e.you ? 'bg-accent-soft/50' : ''}`}>
                  <span className="w-10 text-center font-mono text-sm tabular-nums text-fg-muted">{medal[e.rank] ?? e.rank}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-fg">{e.name}{e.you && <span className="ml-2 text-xs font-normal text-accent-text">You</span>}</span>
                    <span className="text-xs text-fg-subtle">Level {e.level}</span>
                  </span>
                  {data.showSolved && <span className="w-20 text-right text-sm tabular-nums text-fg-muted">{e.solved}</span>}
                  <span className="w-20 text-right font-semibold tabular-nums text-fg">{e.points}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex items-center justify-between text-sm text-fg-muted">
            <span className="tabular-nums">{data.total} ranked</span>
            <div className="flex items-center gap-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="hover:text-fg disabled:opacity-40">← Previous</button>
              <span className="tabular-nums">Page {page} of {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="hover:text-fg disabled:opacity-40">Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
