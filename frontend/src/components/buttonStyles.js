const variants = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'border border-line-strong bg-surface text-fg hover:bg-surface-2',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-danger text-white hover:opacity-90',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

/** Class string for anything that should look like a button (e.g. a router <Link>). */
export function buttonClasses({ variant = 'primary', size = 'md', fullWidth = false, className = '' } = {}) {
  return `inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${fullWidth ? 'w-full' : ''} ${sizes[size]} ${variants[variant]} ${className}`
}

