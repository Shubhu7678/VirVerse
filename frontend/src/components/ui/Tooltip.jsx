/** CSS-only tooltip shown on hover and keyboard focus of the wrapped control. */
export default function Tooltip({ label, side = 'bottom', children }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-md bg-fg px-2 py-1 text-xs whitespace-nowrap text-bg opacity-0 transition-opacity group-focus-within/tip:opacity-100 group-hover/tip:opacity-100 ${
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        {label}
      </span>
    </span>
  )
}
