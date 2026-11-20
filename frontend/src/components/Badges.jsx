const difficultyStyles = {
  Easy: 'bg-success-soft text-success',
  Medium: 'bg-warn-soft text-warn',
  Hard: 'bg-danger-soft text-danger',
}

const statusStyles = {
  completed: ['Completed', 'bg-success-soft text-success'],
  attempted: ['Attempted', 'bg-warn-soft text-warn'],
  todo: ['To do', 'bg-surface-2 text-fg-muted'],
}

const base = 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium'

export function DifficultyBadge({ level }) {
  return <span className={`${base} ${difficultyStyles[level] || statusStyles.todo[1]}`}>{level}</span>
}

export function StatusBadge({ status }) {
  const [label, style] = statusStyles[status] || statusStyles.todo
  return <span className={`${base} ${style}`}>{label}</span>
}
