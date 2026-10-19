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

export default function TopicCard({ topic }) {
  const { slug, name, icon, description, total, completed, percent, progressState: state, difficulty, locked } = topic
  const empty = total === 0

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5">
      <div className={`absolute inset-x-0 top-0 h-1 ${locked ? 'bg-slate-200' : state === 'completed' ? 'bg-emerald-400' : 'bg-linear-to-r from-brand-500 to-violet-500'}`} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl font-mono text-base font-bold shadow-sm transition duration-300 group-hover:scale-105 ${locked ? 'bg-slate-100 text-slate-500' : state === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-linear-to-br from-brand-50 to-violet-50 text-brand-700'}`}>
            {icon}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${locked ? 'bg-slate-100 text-slate-500' : state === 'completed' ? 'bg-emerald-50 text-emerald-700' : state === 'in-progress' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
            {locked ? <Icon d={icons.profile} className="size-3.5" /> : state === 'completed' ? <Icon d={icons.check} className="size-3.5" /> : null}
            {locked ? 'Locked' : progressLabel[state]}
          </span>
        </div>
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Topic {String(topic.order).padStart(2, '0')}</p>
          <h3 className="mt-1 text-lg font-bold leading-snug tracking-tight text-slate-900">{name}</h3>
          <p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-500">{description}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
            {total} {total === 1 ? 'question' : 'questions'}
          </span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
            {levelOf(difficulty)}
          </span>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
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
            className="inline-flex w-full items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-brand-700 hover:shadow-md focus-visible:outline-white"
          >
            <span>{completed === 0 ? 'Start learning' : percent === 100 ? 'Review topic' : 'Continue learning'}</span>
            <Icon d={icons.arrow} className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        )}
        </div>
      </div>
    </article>
  )
}
