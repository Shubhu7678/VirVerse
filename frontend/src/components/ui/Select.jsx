import { ChevronDown } from 'lucide-react'

/** Styled native select (keeps platform keyboard and mobile behaviour). Pass <option>s as children. */
export default function Select({ label, className = '', children, ...props }) {
  return (
    <div className={`relative ${className}`}>
      <select
        aria-label={label}
        className="h-10 w-full appearance-none rounded-control border border-line-strong bg-surface pr-9 pl-3 text-sm text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
    </div>
  )
}
