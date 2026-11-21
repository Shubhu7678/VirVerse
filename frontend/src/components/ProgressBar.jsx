// Visual states: not started (neutral), in progress (accent), completed (green).
const fill = {
  'not-started': 'bg-line-strong',
  'in-progress': 'bg-linear-to-r from-accent to-accent-text',
  completed: 'bg-success',
}

export const progressLabel = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export function progressState(percent) {
  return percent === 0 ? 'not-started' : percent >= 100 ? 'completed' : 'in-progress'
}

export default function ProgressBar({ percent, label, size = 'h-1.5' }) {
  const state = progressState(percent)
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
      className={`${size} w-full overflow-hidden rounded-full bg-inset`}
    >
      <div className="h-full" style={{ width: `${percent}%` }}><div className={`grow-x h-full w-full rounded-full ${fill[state]}`} /></div>
    </div>
  )
}
