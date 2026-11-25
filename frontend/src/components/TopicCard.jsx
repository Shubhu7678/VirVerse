import { Link } from 'react-router-dom'
import { Lock, Check } from 'lucide-react'
import ProgressBar from './ProgressBar'
import Icon, { icons } from './Icon'
import { topicPath } from '../utils/languageRoutes'

function levelOf(difficulty) {
  return difficulty.hard > 0 && difficulty.medium >= 5
    ? 'Easy to Hard'
    : difficulty.medium > 0
      ? 'Easy to Medium'
      : 'Easy'
}

// One row of the course outline. Unlocked rows are a single link target.
export default function TopicCard({ topic, language = 'c', index = 0, isNext = false }) {
  const { slug, name, description, total, completed, percent, difficulty, locked, questionCount } = topic
  const empty = total === 0
  const done = percent === 100 && total > 0
  const action = empty ? 'Coming soon' : completed === 0 ? 'Start' : done ? 'Review' : 'Continue'
  const interactive = !locked && !empty

  const body = (
    <>
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg border font-mono text-sm ${
          done ? 'border-success bg-success-soft text-success' : isNext ? 'border-accent-border bg-accent-soft text-accent-text' : 'border-line-strong text-fg-subtle'
        }`}
      >
        {done ? <Check className="size-4" aria-hidden="true" /> : String(topic.order).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-semibold text-fg">{name}</h3>
          {isNext && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-text">Up next</span>}
          {locked && <Lock className="size-3.5 text-fg-subtle" aria-label="Locked" />}
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-fg-muted">{description}</p>
      </div>

      <div className="hidden w-28 shrink-0 text-xs text-fg-muted sm:block">
        <p className="tabular-nums">{locked ? questionCount : total} {(locked ? questionCount : total) === 1 ? 'question' : 'questions'}</p>
        {!locked && <p className="text-fg-subtle">{levelOf(difficulty)}</p>}
      </div>

      <div className="hidden w-32 shrink-0 md:block">
        {locked ? null : empty ? (
          <span className="text-xs text-fg-subtle">No questions yet</span>
        ) : (
          <>
            <div className="mb-1 flex justify-between text-xs tabular-nums text-fg-muted">
              <span>{completed}/{total}</span>
              <span className="font-medium text-fg">{percent}%</span>
            </div>
            <ProgressBar percent={percent} label={`${name} progress`} />
          </>
        )}
      </div>

      <span className={`flex w-24 shrink-0 items-center justify-end gap-1.5 text-sm font-medium ${interactive ? 'text-accent-text' : 'text-fg-subtle'}`}>
        {locked ? 'Locked' : action}
        {interactive && <Icon d={icons.arrow} className="size-3.5 transition-transform group-hover:translate-x-0.5" />}
      </span>
    </>
  )

  const cls = `group flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0 ${locked ? 'opacity-70' : ''}`

  return (
    <li style={{ '--i': index }} className={isNext ? 'bg-accent-soft/40' : ''}>
      {interactive ? (
        <Link to={topicPath(language, slug)} aria-label={`${action} ${name}`} className={`${cls} transition-colors hover:bg-surface-2`}>
          {body}
        </Link>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  )
}
