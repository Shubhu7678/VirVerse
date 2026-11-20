import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Logo } from './AuthLayout'
import Icon, { icons } from './Icon'
import InvitationInbox from './InvitationInbox'
import Select from './ui/Select'
import Tooltip from './ui/Tooltip'
import { useOrg } from '../context/OrgContext'

const platformNav = [
  { label: 'Overview', to: '/platform', icon: icons.dashboard, end: true },
  { label: 'Organizations', to: '/platform/organizations', icon: icons.profile },
  { label: 'Audit Logs', to: '/platform/audit-logs', icon: icons.submissions },
]

// JavaScript and Python are namespaced under their own prefix.
const trackChildren = (base, playgroundLabel) => [
  { label: 'Topics', to: base, end: true },
  { label: 'Practice problems', to: `${base}/practice` },
  { label: playgroundLabel, to: `${base}/playground` },
  { label: 'My tasks', to: `${base}/my-tasks` },
  { label: 'Completed', to: `${base}/completed` },
]

// One config drives every collapsible section; `match` decides when it auto-opens.
const sections = [
  {
    id: 'c',
    label: 'C programming',
    icon: icons.code,
    match: (p) => p === '/tasks' || p.startsWith('/topics/') || p === '/practice' || p === '/playground',
    // The C track keeps its original un-namespaced routes; My tasks / Completed are top-level items.
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
    children: trackChildren('/python', 'Python playground'),
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
  `${rowBase} h-9 ${isActive ? 'bg-accent-soft text-accent-text' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'}`

const childClass = ({ isActive }) =>
  `flex h-8 items-center rounded-control pr-3 pl-3 text-sm transition-colors ${
    isActive ? 'bg-accent-soft font-medium text-accent-text' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
  }`

function NavItems({ items, close }) {
  return items.map((item) => (
    <li key={item.to}>
      <NavLink to={item.to} end={item.end} className={itemClass} onClick={close}>
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
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setManual({ pathname, open: !open })}
        className={`${rowBase} h-9 ${active ? 'text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'}`}
      >
        <Icon d={section.icon} className={`size-[18px] shrink-0 ${active ? 'text-accent-text' : ''}`} />
        <span className="flex-1 text-left">{section.label}</span>
        <ChevronDown className={`size-4 text-fg-subtle transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div id={panelId} className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <ul className="mt-0.5 mb-1 ml-[18px] space-y-0.5 border-l border-line pl-3">
            {section.children.map((child) => (
              <li key={child.label}>
                {child.soon ? (
                  <div className="flex h-8 items-center justify-between pr-3 text-sm text-fg-subtle" aria-disabled="true">
                    {child.label}
                    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs">Soon</span>
                  </div>
                ) : (
                  <NavLink to={child.to} end={child.end} className={childClass} onClick={close}>
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
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-text ${className}`}>
      {initials}
    </span>
  )
}

function Sidebar({ user, logout, orgNav, isSuperAdmin, close }) {
  const { pathname } = useLocation()
  const userName = user?.name?.trim() || 'Learner'
  const initials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <nav aria-label="Main" className="flex h-full flex-col bg-surface p-3">
      <Link to="/dashboard" onClick={close} className="mb-2 rounded-control px-2 py-2">
        <Logo />
      </Link>

      <ul className="flex-1 space-y-0.5 overflow-y-auto pb-3">
        {orgNav.length > 0 && (
          <>
            <GroupLabel>Organization</GroupLabel>
            <NavItems items={orgNav} close={close} />
          </>
        )}
        {isSuperAdmin && (
          <>
            <GroupLabel>Platform</GroupLabel>
            <NavItems items={platformNav} close={close} />
          </>
        )}
        {(orgNav.length > 0 || isSuperAdmin) && <GroupLabel>Learning</GroupLabel>}
        <NavItems items={[{ label: 'Dashboard', to: '/dashboard', icon: icons.dashboard }]} close={close} />
        {sections.map((section) => (
          <NavSection key={section.id} section={section} pathname={pathname} close={close} />
        ))}
        <NavItems
          items={[
            { label: 'My tasks', to: '/my-tasks', icon: icons.tasks },
            { label: 'Completed', to: '/completed', icon: icons.check },
            { label: 'Submissions', to: '/submissions', icon: icons.submissions },
            { label: 'Profile', to: '/profile', icon: icons.profile },
          ]}
          close={close}
        />
      </ul>

      <div className="border-t border-line pt-3">
        <div className="flex items-center gap-3 px-2 pb-2">
          <Avatar initials={initials} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-fg">{userName}</span>
            <span className="block truncate text-xs text-fg-muted">{user?.email}</span>
          </span>
        </div>
        <button onClick={logout} className={`${rowBase} h-9 text-fg-muted hover:bg-danger-soft hover:text-danger`}>
          <LogOut className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </nav>
  )
}

const iconButton =
  'flex size-9 items-center justify-center rounded-control border border-line-strong bg-surface text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg'

export default function DashboardLayout() {
  const { user, logout, isSuperAdmin } = useAuth()
  const { memberships, activeOrganization, selectOrganization } = useOrg()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const orgRole = activeOrganization?.role
  const orgNav = orgRole === 'org_admin'
    ? [
        { label: 'Overview', to: '/organization', icon: icons.dashboard, end: true },
        { label: 'People & performance', to: '/organization/people', icon: icons.profile },
        { label: 'Departments & classes', to: '/organization/structure', icon: icons.tasks },
        { label: 'Assignments', to: '/organization/assignments', icon: icons.check },
      ]
    : orgRole === 'teacher'
      ? [
          { label: 'Teacher overview', to: '/organization', icon: icons.dashboard, end: true },
          { label: 'My students', to: '/organization/people?role=student', icon: icons.profile },
          { label: 'My classes', to: '/organization/structure', icon: icons.tasks },
          { label: 'Assignments', to: '/organization/assignments', icon: icons.check },
        ]
      : orgRole === 'student'
        ? [
            { label: 'My organization classes', to: '/organization/structure', icon: icons.tasks },
            { label: 'Assignments', to: '/organization/assignments', icon: icons.check },
          ]
        : []

  const pageItems = [
    ...orgNav,
    ...(isSuperAdmin ? platformNav : []),
    { label: 'Dashboard', to: '/dashboard' },
    ...sections.flatMap((section) => section.children.filter((child) => child.to).map((child) => ({ ...child, label: `${section.label} · ${child.label}` }))),
    { label: 'My tasks', to: '/my-tasks' },
    { label: 'Completed', to: '/completed' },
    { label: 'Submissions', to: '/submissions' },
    { label: 'Profile', to: '/profile' },
  ]
  const activeItem = pageItems
    .filter((item) => location.pathname === item.to.split('?')[0] || (item.to !== '/dashboard' && item.to !== '/tasks' && location.pathname.startsWith(`${item.to.split('?')[0]}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0]
  const pageTitle = activeItem?.label ?? 'VirVerse'
  const activeMemberships = memberships.filter((membership) => membership.organization?.status === 'active')
  const closeMenu = () => setOpen(false)
  const sidebar = <Sidebar user={user} logout={logout} orgNav={orgNav} isSuperAdmin={isSuperAdmin} close={closeMenu} />
  const userName = user?.name?.trim() || 'Learner'
  const initials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div className="dashboard-shell min-h-screen bg-bg">
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-surface">
        {sidebar}
      </aside>

      {open && (
        <div className="dashboard-mobile-nav fixed inset-0 z-50">
          <button className="absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={closeMenu} aria-label="Close navigation" />
          <aside className="animate-pop absolute inset-y-0 left-0 w-64 border-r border-line shadow-pop">
            {sidebar}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} className={`dashboard-menu-button ${iconButton}`} aria-label="Open menu">
            <Icon d={icons.menu} className="size-[18px]" />
          </button>

          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-fg sm:text-base">{pageTitle}</h1>

          {activeMemberships.length > 0 && (
            <Select
              label="Active organization"
              value={activeOrganization?.organization?.id ?? ''}
              onChange={(e) => selectOrganization(e.target.value)}
              className="hidden w-56 sm:block"
            >
              {activeMemberships.map((membership) => (
                <option key={membership.organization._id} value={membership.organization._id}>
                  {membership.organization.name} · {membership.role.replaceAll('_', ' ')}
                </option>
              ))}
            </Select>
          )}

          <InvitationInbox />
          <Tooltip label={theme === 'dark' ? 'Light theme' : 'Dark theme'}>
            <button
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

      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
