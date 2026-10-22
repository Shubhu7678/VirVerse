import { Link } from 'react-router-dom'
import ProgressBar, { progressLabel } from './ProgressBar'
import Icon, { icons } from './Icon'

const stateText = {
  'not-started': 'text-slate-500',
  'in-progress': 'text-brand-600',
  completed: 'text-emerald-600',
}

// Highest difficulty present gives a quick "how hard is this topic" signal.
function levelOf(d) {
  return d.hard > 0 && d.medium >= 5 ? 'Easy to Hard' : d.medium > 0 ? 'Easy to Medium' : 'Easy'
}

export default function TopicCard({ topic, index = 0 }) {
  const { slug, name, icon, description, total, completed, percent, progressState: state, difficulty, locked } = topic
  const empty = total === 0

  return (
    <article
      className={`topics-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_8px_-4px_rgb(15_23_42_/_0.12)] transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_18px_40px_-24px_rgb(79_70_229_/_0.32)] motion-reduce:transform-none motion-reduce:transition-none ${locked ? 'topics-card-locked' : ''}`}
      style={{ '--topics-card-index': index }}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 transition-all duration-300 group-hover:h-1 ${locked ? 'bg-slate-200' : state === 'completed' ? 'bg-emerald-400' : 'bg-linear-to-r from-brand-500 via-indigo-500 to-violet-500'}`} />
      <div className="topics-card-body flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className={`topics-card-icon relative flex size-14 shrink-0 items-center justify-center rounded-2xl border font-mono text-base font-bold shadow-sm transition duration-300 group-hover:-rotate-3 group-hover:scale-105 ${locked ? 'border-slate-200 bg-slate-100 text-slate-500' : state === 'completed' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-brand-100 bg-linear-to-br from-brand-50 to-violet-50 text-brand-700'}`}>
            {icon}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${locked ? 'bg-slate-100 text-slate-500' : state === 'completed' ? 'bg-emerald-50 text-emerald-700' : state === 'in-progress' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
            {locked ? <Icon d={icons.profile} className="size-3.5" /> : state === 'completed' ? <Icon d={icons.check} className="size-3.5" /> : null}
            {locked ? 'Locked' : progressLabel[state]}
          </span>
        </div>
        <div className="mt-5 flex flex-1 flex-col">
          <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">Topic {String(topic.order).padStart(2, '0')}</p>
          <h3 className="mt-1.5 min-h-12 text-[17px] font-bold leading-6 tracking-[-0.025em] text-slate-900">{name}</h3>
          <p className="mt-2 min-h-12 text-[13px] leading-5 text-slate-500">{description}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
            {total} {total === 1 ? 'question' : 'questions'}
          </span>
          <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
            {levelOf(difficulty)}
          </span>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 bg-slate-50/65 p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-slate-600">{empty ? 'Questions coming soon' : `${completed} of ${total} solved`}</span>
          <span className={`font-bold ${stateText[state]}`}>{percent}%</span>
        </div>
        <ProgressBar percent={percent} label={`${name} progress`} size="h-1.5" />
        <div className="mt-4">
        {locked ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-xs font-semibold text-amber-800">
            <Icon d={icons.profile} className="size-4" />
            Join an active organization to unlock
          </div>
        ) : (
          <Link
            to={`/topics/${slug}`}
            className="inline-flex min-h-11 w-full items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-brand-700 hover:shadow-md focus-visible:outline-brand-500 active:translate-y-px motion-reduce:transition-none"
          >
            <span>{completed === 0 ? 'Start learning' : percent === 100 ? 'Review topic' : 'Continue learning'}</span>
            <Icon d={icons.arrow} className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        )}
        </div>
      </div>
    </article>
  )
}
