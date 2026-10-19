// Visual states: not started (neutral), in progress (indigo), completed (green).
const fill = {
  'not-started': 'bg-slate-300',
  'in-progress': 'bg-brand-500',
  completed: 'bg-emerald-500',
}

export const progressLabel = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export function progressState(percent) {
  return percent === 0 ? 'not-started' : percent >= 100 ? 'completed' : 'in-progress'
}

export default function ProgressBar({ percent, label, size = 'h-2' }) {
  const state = progressState(percent)
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
      className={`${size} w-full overflow-hidden rounded-full bg-slate-100`}
    >
      <div className={`h-full rounded-full transition-all duration-500 ${fill[state]}`} style={{ width: `${percent}%` }} />
    </div>
  )
}
