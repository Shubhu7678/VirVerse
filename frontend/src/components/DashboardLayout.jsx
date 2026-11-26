import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, CircleHelp, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Logo } from './AuthLayout'
import Icon, { icons } from './Icon'
import Tooltip from './ui/Tooltip'
import ProductTour from './ProductTour'
import { STUDENT_TOUR, ADMIN_TOUR } from '../data/tourSteps'
import { getPageTour } from '../data/pageTours'
import { LoadingBlock } from './States'
import ErrorBoundary from './ErrorBoundary'
import { prefetchRoute } from '../utils/prefetch'

const adminNav = [
  { label: 'Students', to: '/admin', icon: icons.profile, end: true, tour: 'admin-students' },
  { label: 'Activity log', to: '/admin/logs', icon: icons.submissions, tour: 'admin-logs' },
  { label: 'Emails', to: '/admin/emails', icon: icons.list, tour: 'admin-emails' },
]

// JavaScript and Python are namespaced under their own prefix.
const trackChildren = (base, playgroundLabel) => [
  { label: 'Topics', to: base, end: true },
  { label: 'Practice problems', to: `${base}/practice` },
  { label: playgroundLabel, to: `${base}/playground` },
  { label: 'Completed', to: `${base}/completed` },
]

// One config drives every collapsible section; `match` decides when it auto-opens.
const sections = [
  {
    id: 'c',
    label: 'C programming',
    icon: icons.code,
    match: (p) => p === '/tasks' || p.startsWith('/topics/') || p === '/practice' || p === '/playground',
    // The C track keeps its original un-namespaced routes; Completed is a top-level item.
    children: [
      { label: 'Topics', to: '/tasks', end: true },
      { label: 'Practice problems', to: '/practice' },
      { label: 'C playground', to: '/playground' },
    ],
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    icon: icons.javascript,
    match: (p) => p === '/javascript' || p.startsWith('/javascript/'),
    children: trackChildren('/javascript', 'JavaScript playground'),
  },
  {
    id: 'python',
    label: 'Python',
    icon: icons.terminal,
    match: (p) => p === '/python' || p.startsWith('/python/'),
    children: [
      { label: 'Topics', to: '/python', end: true },
      { label: 'Guide', to: '/python/guide' },
      ...trackChildren('/python', 'Python playground').slice(1),
    ],
  },
  {
    id: 'web',
    label: 'Web development',
    icon: icons.globe,
    match: (p) => p.startsWith('/web-development/'),
    children: [
      { label: 'HTML', to: '/web-development/html', end: true },
      { label: 'CSS', soon: true },
      { label: 'JavaScript', soon: true },
    ],
  },
]

const rowBase = 'flex w-full items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors'

const itemClass = ({ isActive }) =>
  `${rowBase} h-9 ${isActive ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'}`

const childClass = ({ isActive }) =>
  `flex h-8 items-center rounded-control pr-3 pl-3 text-sm transition-colors ${
    isActive ? 'bg-surface-2 font-medium text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
  }`

function NavItems({ items, close }) {
  return items.map((item) => (
    <li key={item.to} data-tour={item.tour}>
      <NavLink to={item.to} end={item.end} className={itemClass} onClick={close} onMouseEnter={() => prefetchRoute(item.to)} onFocus={() => prefetchRoute(item.to)}>
        <Icon d={item.icon} className="size-[18px] shrink-0" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </NavLink>
    </li>
  ))
}

function GroupLabel({ children }) {
  return <li className="px-3 pt-4 pb-1 text-xs font-medium text-fg-subtle">{children}</li>
}

function NavSection({ section, pathname, close }) {
  const active = section.match(pathname)
  // A manual toggle only applies to the page it was made on; navigating re-syncs with the route.
  const [manual, setManual] = useState({ pathname, open: active })
  const open = manual.pathname === pathname ? manual.open : active
  const panelId = `nav-${section.id}`

  return (
    <li data-tour={section.id}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setManual({ pathname, open: !open })}
        className={`${rowBase} h-9 ${active ? 'text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'}`}
      >
        <Icon d={section.icon} className={`size-[18px] shrink-0 ${active ? 'text-fg' : ''}`} />
        <span className="flex-1 text-left">{section.label}</span>
        <ChevronDown className={`size-4 text-fg-subtle transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div id={panelId} className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <ul className="mt-0.5 mb-1 ml-[18px] space-y-0.5 border-l border-line pl-3">
            {section.children.map((child) => (
              <li key={child.label}>
                {child.soon ? (
                  <div className="flex h-8 items-center justify-between rounded-control pr-3 pl-3 text-sm text-fg-subtle" aria-disabled="true">
                    {child.label}
                    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs">Soon</span>
                  </div>
                ) : (
                  <NavLink to={child.to} end={child.end} className={childClass} onClick={close} onMouseEnter={() => prefetchRoute(child.to)} onFocus={() => prefetchRoute(child.to)}>
                    <span className="truncate">{child.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  )
}

function Avatar({ initials, className = 'size-9 text-sm' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-inset font-semibold text-fg-muted ${className}`}>
      {initials}
    </span>
  )
}

function Sidebar({ user, logout, isAdmin, close }) {
  const { pathname } = useLocation()
  const userName = user?.name?.trim() || 'Learner'
  const initials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <nav aria-label="Main" className="flex h-full flex-col bg-surface p-3">
      <Link to="/dashboard" onClick={close} className="mb-2 rounded-control px-2 py-2">
        <Logo />
      </Link>

      <ul className="flex-1 space-y-0.5 sidebar-scroll -mr-3 overflow-y-auto pr-3 pb-3">
        {isAdmin && (
          <>
            <GroupLabel>Admin</GroupLabel>
            <NavItems items={adminNav} close={close} />
            <GroupLabel>Learning</GroupLabel>
          </>
        )}
        <NavItems items={[{ label: 'Dashboard', to: '/dashboard', icon: icons.dashboard, tour: 'dashboard' }]} close={close} />
        {sections.map((section) => (
          <NavSection key={section.id} section={section} pathname={pathname} close={close} />
        ))}
        <NavItems
          items={[
            { label: 'Completed', to: '/completed', icon: icons.check },
            { label: 'Submissions', to: '/submissions', icon: icons.submissions, tour: 'submissions' },
            { label: 'Leaderboard', to: '/leaderboard', icon: icons.dashboard, tour: 'leaderboard' },
          ]}
          close={close}
        />
      </ul>

      <div className="border-t border-line pt-3">
        <NavLink
          to="/profile"
          data-tour="profile"
          onClick={close}
          aria-label={`Open your profile, signed in as ${userName}`}
          className={({ isActive }) => `mb-2 flex items-center gap-3 rounded-card border p-2.5 transition-colors ${isActive ? 'border-line-strong bg-inset' : 'border-line bg-surface-2 hover:border-line-strong hover:bg-surface'}`}
        >
          <Avatar initials={initials} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-fg">{userName}</span>
            <span className="block truncate text-xs text-fg-muted">{user?.email}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
        </NavLink>
        <button onClick={logout} className={`${rowBase} h-9 text-fg-muted hover:bg-danger-soft hover:text-danger`}>
          <LogOut className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </nav>
  )
}

const iconButton =
  'flex size-9 items-center justify-center rounded-full border border-line bg-transparent text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg'

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // While the mobile menu is open: Escape closes it and the page behind does not scroll.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Each page opens at the top rather than keeping the previous page's scroll offset.
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  const [tourOpen, setTourOpen] = useState(false)
  const tourKey = `virvese:tour:${user?.id}`
  // The welcome tour runs once; the ? button explains whichever page is open.
  const [tourSteps, setTourSteps] = useState(isAdmin ? ADMIN_TOUR : STUDENT_TOUR)
  const startWelcomeTour = () => {
    setTourSteps(isAdmin ? ADMIN_TOUR : STUDENT_TOUR)
    setTourOpen(true)
  }
  const startPageTour = () => {
    setTourSteps(getPageTour(location.pathname, isAdmin))
    setTourOpen(true)
  }

  // Show the tour once, the first time someone lands on their home page.
  useEffect(() => {
    // Not for throwaway demo accounts, and not on phones where the sidebar it points at is hidden.
    if (!user || user.isDemo || window.innerWidth < 1024 || !['/dashboard', '/admin'].includes(location.pathname)) return undefined
    try {
      if (localStorage.getItem(tourKey)) return undefined
    } catch {
      return undefined
    }
    const timer = setTimeout(startWelcomeTour, 1500)
    return () => clearTimeout(timer)
  }, [user, location.pathname, tourKey])

  const closeTour = () => {
    setTourOpen(false)
    // Skipping counts as seen too; it can always be replayed from the help button.
    try {
      localStorage.setItem(tourKey, '1')
    } catch {
      /* private mode: the tour may show again next visit */
    }
  }
  const pageItems = [
    ...(isAdmin ? adminNav : []),
    { label: 'Dashboard', to: '/dashboard' },
    ...sections.flatMap((section) => section.children.filter((child) => child.to).map((child) => ({ ...child, label: `${section.label} · ${child.label}` }))),
    { label: 'Completed', to: '/completed' },
    { label: 'Submissions', to: '/submissions' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Profile', to: '/profile' },
  ]
  const activeItem = pageItems
    .filter((item) => location.pathname === item.to.split('?')[0] || (item.to !== '/dashboard' && item.to !== '/tasks' && location.pathname.startsWith(`${item.to.split('?')[0]}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0]
  const pageTitle = activeItem?.label ?? 'VirVerse'
  const closeMenu = () => setOpen(false)
  const sidebar = <Sidebar user={user} logout={logout} isAdmin={isAdmin} close={closeMenu} />
  const userName = user?.name?.trim() || 'Learner'
  const initials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div className="dashboard-shell app-glow min-h-screen bg-bg">
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-surface">
        {sidebar}
      </aside>

      {open && (
        <div className="dashboard-mobile-nav fixed inset-0 z-50">
          <button className="absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={closeMenu} aria-label="Close navigation" />
          <aside role="dialog" aria-modal="true" aria-label="Navigation" className="animate-pop absolute inset-y-0 left-0 w-64 border-r border-line shadow-pop">
            {sidebar}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} className={`dashboard-menu-button ${iconButton}`} aria-label="Open menu">
            <Icon d={icons.menu} className="size-[18px]" />
          </button>

          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-fg sm:text-base">{pageTitle}</h1>

          <Tooltip label="What is on this page?">
            <button onClick={startPageTour} className={iconButton} aria-label="Explain this page">
              <CircleHelp className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip label={theme === 'dark' ? 'Light theme' : 'Dark theme'}>
            <button
              data-tour="theme"
              onClick={toggle}
              className={iconButton}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <Icon d={theme === 'dark' ? icons.sun : icons.moon} className="size-[18px]" />
            </button>
          </Tooltip>
          <Link to="/profile" aria-label={`Open profile for ${userName}`} className="rounded-full">
            <Avatar initials={initials} />
          </Link>
        </div>
      </header>

      <ProductTour steps={tourSteps} open={tourOpen} onClose={closeTour} />

      <main key={location.pathname} className="page-enter p-4 sm:p-6 lg:p-8">
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<LoadingBlock />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
