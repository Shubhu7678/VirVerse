import { Link } from 'react-router-dom'
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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 118 0v3M12 14v3" />
    </svg>
  )
}

export default function TopicCard({ topic, index = 0, language = 'c' }) {
  const { slug, name, icon, description, total, completed, percent, progressState: state, difficulty, locked } = topic
  const empty = total === 0

  return (
    <article
      className={`topics-card ${locked ? 'topics-card-locked' : ''} ${state === 'in-progress' && !locked ? 'topics-card-active' : ''}`}
      style={{ '--topics-card-index': index }}
    >
      <div className={`topics-card-status ${locked ? 'is-locked' : state === 'completed' ? 'is-completed' : state === 'in-progress' ? 'is-progress' : 'is-new'}`}>
        {locked ? <LockIcon /> : state === 'completed' ? <Icon d={icons.check} className="size-3.5" /> : state === 'in-progress' ? <span className="topics-status-dot" /> : null}
        {locked ? 'Locked' : state === 'completed' ? 'Completed' : state === 'in-progress' ? 'In progress' : 'Not started'}
      </div>

      <div className="topics-card-art" aria-hidden="true">
        <div className="topics-card-art-orbit" />
        <span className="topics-card-art-mark">{icon}</span>
        <span className="topics-card-art-spark">✦</span>
        <span className="topics-card-art-lines"><i /><i /><i /></span>
      </div>

      <div className="topics-card-copy">
        <p className="topics-card-order">{String(topic.order).padStart(2, '0')} <span>·</span> TOPIC</p>
        <h3>{name}</h3>
        <p className="topics-card-description">{description}</p>
      </div>

      <div className="topics-card-footer">
        <div className="topics-card-meta">
          <span><Icon d={icons.list} className="size-3.5" /> {total} {total === 1 ? 'Question' : 'Questions'}</span>
          <span className="topics-difficulty"><i /> {levelOf(difficulty)}</span>
          <span className="topics-card-percent">{percent}%</span>
        </div>
        <ProgressBar percent={percent} label={`${name} progress`} size="h-1.5" />
        <div className="topics-card-action">
          {locked ? (
            <p><LockIcon /> Join an active organization to unlock</p>
          ) : (
            <Link to={topicPath(language, slug)} aria-label={`${completed === 0 ? 'Start' : percent === 100 ? 'Review' : 'Continue'} ${name}`}>
              <span>{empty ? 'Questions coming soon' : completed === 0 ? 'Start learning' : percent === 100 ? 'Review topic' : 'Continue learning'}</span>
              <span className="topics-card-arrow"><Icon d={icons.arrow} className="size-3.5" /></span>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
