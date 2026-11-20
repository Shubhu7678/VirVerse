import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
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

const statusText = {
  completed: ['Completed', 'text-success'],
  'in-progress': ['In progress', 'text-accent-text'],
  'not-started': ['Not started', 'text-fg-subtle'],
}

export default function TopicCard({ topic, language = 'c' }) {
  const { slug, name, description, total, completed, percent, progressState: state, difficulty, locked } = topic
  const empty = total === 0
  const [statusLabel, statusColor] = locked ? ['Locked', 'text-fg-subtle'] : statusText[state] || statusText['not-started']
  const action = empty ? 'Questions coming soon' : completed === 0 ? 'Start' : percent === 100 ? 'Review' : 'Continue'

  return (
    <article className={`flex flex-col rounded-card border border-line bg-surface p-5 ${locked ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-fg-subtle">{String(topic.order).padStart(2, '0')}</span>
        <span className={`inline-flex items-center gap-1 font-medium ${statusColor}`}>
          {locked && <Lock className="size-3" aria-hidden="true" />}
          {statusLabel}
        </span>
      </div>

      <h3 className="mt-3 font-semibold text-fg">{name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-fg-muted">{description}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-fg-muted">
        <span className="tabular-nums">{total} {total === 1 ? 'question' : 'questions'} · {levelOf(difficulty)}</span>
        <span className="font-medium text-fg tabular-nums">{percent}%</span>
      </div>
      <div className="mt-2">
        <ProgressBar percent={percent} label={`${name} progress`} />
      </div>

      <div className="mt-4 border-t border-line pt-3 text-sm">
        {locked ? (
          <p className="inline-flex items-center gap-1.5 text-fg-subtle">
            <Lock className="size-3.5" aria-hidden="true" /> Join an active organization to unlock
          </p>
        ) : empty ? (
          <p className="text-fg-subtle">{action}</p>
        ) : (
          <Link
            to={topicPath(language, slug)}
            aria-label={`${action} ${name}`}
            className="inline-flex items-center gap-1.5 font-medium text-accent-text hover:underline"
          >
            {action} <Icon d={icons.arrow} className="size-3.5" />
          </Link>
        )}
      </div>
    </article>
  )
}
