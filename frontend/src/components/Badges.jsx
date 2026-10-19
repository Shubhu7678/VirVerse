const difficultyStyles = {
  Easy: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Hard: 'bg-red-50 text-red-700 ring-red-600/20',
}

const statusStyles = {
  completed: ['Completed', 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'],
  attempted: ['Attempted', 'bg-amber-50 text-amber-700 ring-amber-600/20'],
  todo: ['To do', 'bg-slate-100 text-slate-600 ring-slate-500/20'],
}

const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'

export function DifficultyBadge({ level }) {
  return <span className={`${base} ${difficultyStyles[level]}`}>{level}</span>
}

export function StatusBadge({ status }) {
  const [label, style] = statusStyles[status] || statusStyles.todo
  return <span className={`${base} ${style}`}>{label}</span>
}
