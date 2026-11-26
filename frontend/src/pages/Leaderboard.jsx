import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Crown, Trophy, Users } from 'lucide-react'
import { fetchLeaderboard } from '../api/leaderboard'
import useAsync from '../hooks/useAsync'
import { ErrorBlock, EmptyState } from '../components/States'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ProgressBar'

const PAGE_SIZE = 10

// Medal colours for the first three places; everyone else gets a plain number.
const MEDAL = { 1: 'bg-[#f5c94c]', 2: 'bg-[#c9c9ce]', 3: 'bg-[#d4905f]' }

const initialsOf = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const levelProgress = (points) => points % 100

// Compact, square-cornered controls with 13px text, like a macOS toolbar.
const pagerButton = 'inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface px-2.5 text-[13px] font-medium text-fg transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface'

function Avatar({ name, className = 'size-9 text-sm' }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full border border-line-strong bg-surface-2 font-semibold text-fg ${className}`}>
      {initialsOf(name)}
    </span>
  )
}

function LevelPill({ level, short = false }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-fg-muted tabular-nums">
      {short ? `Lv ${level}` : `Level ${level}`}
    </span>
  )
}

// The top three as cards. On wider screens first place sits in the middle, taller, with a crown.
function Podium({ entries }) {
  const byPlace = [...entries].sort((a, b) => a.rank - b.rank)
  const layout = byPlace.length === 3 ? [byPlace[1], byPlace[0], byPlace[2]] : byPlace

  return (
    <ol aria-label="Top three" className={`grid items-end gap-3 ${layout.length === 3 ? 'sm:grid-cols-3' : layout.length === 2 ? 'sm:grid-cols-2' : ''}`}>
      {layout.map((e) => {
        const first = e.rank === 1
        return (
          <li key={e.id} className={first ? 'max-sm:order-first' : ''}>
            <Card className={`relative flex flex-col items-center gap-2.5 text-center ${first ? 'border-fg-subtle pt-8 pb-6 sm:pt-9 sm:pb-7' : 'pt-6'} ${e.you ? 'ring-1 ring-fg-subtle' : ''}`}>
              {first ? (
                <span className={`absolute -top-3.5 grid size-8 place-items-center rounded-full text-black ${MEDAL[1]}`} aria-label="First place">
                  <Crown className="size-4" strokeWidth={2.25} aria-hidden="true" />
                </span>
              ) : (
                <span className={`absolute top-3 left-3 grid size-7 place-items-center rounded-full text-xs font-semibold text-black tabular-nums ${MEDAL[e.rank]}`} aria-label={`Place ${e.rank}`}>
                  {e.rank}
                </span>
              )}
              <Avatar name={e.name} className={first ? 'size-16 text-xl' : 'size-14 text-lg'} />
              <p className="max-w-full truncate text-[15px] font-semibold text-fg">
                {e.name}
                {e.you && <span className="ml-1.5 text-xs font-normal text-fg-subtle">You</span>}
              </p>
              <LevelPill level={e.level} />
              <p className="text-2xl font-semibold tracking-tight text-fg tabular-nums">
                {e.points}
                <span className="ml-1 text-xs font-normal text-fg-subtle">pts</span>
              </p>
            </Card>
          </li>
        )
      })}
    </ol>
  )
}

function RankCell({ rank }) {
  return MEDAL[rank]
    ? <span className={`mx-auto grid size-7 place-items-center rounded-full text-xs font-semibold text-black tabular-nums ${MEDAL[rank]}`}>{rank}</span>
    : <span className="text-sm text-fg-muted tabular-nums">{rank}</span>
}

function StudentsTable({ data, level, onLevelChange, page, onPage }) {
  const pages = Math.max(Math.ceil(data.total / PAGE_SIZE), 1)
  const from = data.entries.length ? data.entries[0].rank : 0
  const to = data.entries.length ? data.entries[data.entries.length - 1].rank : 0

  return (
    <Card as="section" padded={false} aria-label="All students" className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <Users className="size-[18px] text-fg-muted" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-fg">All students</h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-fg-muted tabular-nums">{data.overall}</span>
        </div>
        <div className="relative">
          <select
            aria-label="Filter by level"
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className="h-8 appearance-none rounded-md border border-line bg-surface pr-8 pl-3 text-[13px] text-fg outline-none transition-colors hover:bg-surface-2 focus-visible:border-line-strong"
          >
            <option value="">All levels</option>
            {data.levels.map((value) => <option key={value} value={value}>Level {value}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left">
          <caption className="sr-only">Students ranked by points</caption>
          <thead>
            <tr className="border-y border-line bg-surface-2/60 text-xs text-fg-subtle">
              <th scope="col" className="w-16 py-2.5 text-center font-medium">#</th>
              <th scope="col" className="px-2 py-2.5 font-medium">Student</th>
              <th scope="col" className="hidden w-24 px-2 py-2.5 font-medium sm:table-cell">Level</th>
              {data.showSolved && <th scope="col" className="w-20 px-2 py-2.5 text-right font-medium">Solved</th>}
              <th scope="col" className="hidden w-56 px-2 py-2.5 font-medium md:table-cell">Level progress</th>
              <th scope="col" className="w-20 py-2.5 pr-5 text-right font-medium">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.entries.map((e) => {
              const percent = levelProgress(e.points)
              return (
                <tr key={e.id} aria-current={e.you ? 'true' : undefined} className={`transition-colors hover:bg-surface-2/60 ${e.you ? 'bg-surface-2/60' : ''}`}>
                  <td className="w-16 py-3 text-center"><RankCell rank={e.rank} /></td>
                  <td className="px-2 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={e.name} className="size-8 text-xs" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg">
                          {e.name}
                          {e.you && <span className="ml-2 text-xs font-normal text-fg-subtle">You</span>}
                        </p>
                        <p className="text-xs text-fg-subtle sm:hidden">Level {e.level}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-2 py-3 sm:table-cell"><LevelPill level={e.level} short /></td>
                  {data.showSolved && <td className="px-2 py-3 text-right text-sm text-fg-muted tabular-nums">{e.solved}</td>}
                  <td className="hidden px-2 py-3 md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-36"><ProgressBar percent={percent} label={`${e.name} progress to the next level`} /></div>
                      <span className="w-9 text-xs text-fg-subtle tabular-nums">{percent}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-5 text-right text-sm font-semibold text-fg tabular-nums">{e.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
        <p className="text-[13px] text-fg-muted tabular-nums">
          {data.total ? `Showing ${from}–${to} of ${data.total} students` : 'No students at this level yet'}
        </p>
        <nav aria-label="Leaderboard pages" className="flex items-center gap-2">
          <button type="button" className={pagerButton} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft className="-ml-1 size-3.5" aria-hidden="true" /> Previous
          </button>
          <span className="min-w-20 text-center text-[13px] text-fg-muted tabular-nums">Page {page} of {pages}</span>
          <button type="button" className={pagerButton} disabled={page >= pages} onClick={() => onPage(page + 1)}>
            Next <ChevronRight className="-mr-1 size-3.5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </Card>
  )
}

function RankingSkeleton() {
  return (
    <div role="status" aria-label="Loading leaderboard" className="space-y-4">
      <div className="grid items-end gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className={`skeleton ${i === 1 ? 'h-52' : 'h-44'}`} style={{ animationDelay: `${i * 120}ms` }} />)}
      </div>
      <div className="skeleton h-80" />
    </div>
  )
}

export default function Leaderboard() {
  const [page, setPage] = useState(1)
  const [level, setLevel] = useState('')
  const { data, loading, error } = useAsync(
    () => fetchLeaderboard({ page, limit: PAGE_SIZE, podium: true, ...(level && { level }) }),
    `leaderboard-${level}-${page}`,
  )
  const me = data?.me

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-control border border-line bg-surface-2 text-fg" aria-hidden="true">
          <Trophy className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-fg">Leaderboard</h1>
          <p className="text-sm text-fg-muted">
            {data?.showSolved ? 'Points and solved questions for every student.' : 'Points earned by solving questions: Easy 10, Medium 20, Hard 30.'}
          </p>
        </div>
      </header>

      {me && (
        <div data-tour="lb-me" className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-control border border-line bg-surface-2/60 px-4 py-3">
          <div>
            <p className="text-xs text-fg-subtle">Your rank</p>
            <p className="text-base font-semibold text-fg tabular-nums">#{me.rank} <span className="text-[13px] font-normal text-fg-muted">of {data.overall}</span></p>
          </div>
          <div>
            <p className="text-xs text-fg-subtle">Points</p>
            <p className="text-base font-semibold text-fg tabular-nums">{me.points} <span className="text-[13px] font-normal text-fg-muted">level {me.level}</span></p>
          </div>
          <div className="min-w-40 flex-1">
            <ProgressBar percent={levelProgress(me.points)} label="Progress to next level" />
            <p className="mt-1.5 text-xs text-fg-subtle tabular-nums">{100 - levelProgress(me.points)} points to level {me.level + 1}</p>
          </div>
        </div>
      )}

      {loading && <RankingSkeleton />}
      {error && <ErrorBlock message={error} />}
      {data && data.overall === 0 && <EmptyState title="No one is ranked yet" text="Solve a question to earn the first points." />}
      {data && data.overall > 0 && (
        <div data-tour="lb-list" className="space-y-6">
          <Podium entries={data.podium ?? []} />
          <StudentsTable
            data={data}
            level={level}
            onLevelChange={(value) => { setLevel(value); setPage(1) }}
            page={page}
            onPage={setPage}
          />
        </div>
      )}
    </div>
  )
}
