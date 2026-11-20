import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Braces,
  CircleCheck,
  Code,
  Copy,
  Globe,
  History,
  LayoutDashboard,
  List,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Paintbrush,
  Sun,
  Terminal,
  User,
  X,
} from 'lucide-react'

/**
 * `d` is a lucide component (from `icons` below). A plain SVG path string is still accepted so
 * older call sites with inline paths keep working.
 */
export default function Icon({ d, className = 'size-5' }) {
  if (typeof d === 'string') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={d} />
      </svg>
    )
  }
  const Glyph = d
  return <Glyph className={className} strokeWidth={1.75} aria-hidden="true" />
}

export const icons = {
  dashboard: LayoutDashboard,
  code: Code,
  tasks: ListChecks,
  check: CircleCheck,
  submissions: History,
  profile: User,
  bookOpen: BookOpen,
  close: X,
  logout: LogOut,
  menu: Menu,
  back: ArrowLeft,
  arrow: ArrowRight,
  sun: Sun,
  moon: Moon,
  copy: Copy,
  list: List,
  terminal: Terminal,
  globe: Globe,
  css: Paintbrush,
  javascript: Braces,
}
