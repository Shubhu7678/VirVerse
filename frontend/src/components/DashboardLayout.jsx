import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PALETTES, useTheme } from '../context/ThemeContext'
import { Logo } from './AuthLayout'
import Icon, { icons } from './Icon'
import InvitationInbox from './InvitationInbox'
import { useOrg } from '../context/OrgContext'

const platformNav = [
  { label: 'Overview', to: '/platform', icon: icons.dashboard, end: true },
  { label: 'Organizations', to: '/platform/organizations', icon: icons.profile },
  { label: 'Audit Logs', to: '/platform/audit-logs', icon: icons.submissions },
]

const nav = [
  { label: 'Dashboard', to: '/dashboard', icon: icons.dashboard },
  {
    label: 'C Programming',
    icon: icons.code,
    children: [
      { label: 'Topics', to: '/tasks', end: true },
      { label: 'Practice Problems', to: '/practice' },
      { label: 'C Playground', to: '/playground' },
    ],
  },
  { label: 'My Tasks', to: '/my-tasks', icon: icons.tasks },
  { label: 'Completed Tasks', to: '/completed', icon: icons.check },
  { label: 'Submissions', to: '/submissions', icon: icons.submissions },
]

const itemClass = ({ isActive }) =>
  `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
      : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-100 hover:text-slate-900'
  }`

const childClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl py-2.5 pr-3 pl-11 text-[13px] font-medium transition-all duration-200 ${
    isActive ? 'bg-brand-50/80 text-brand-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
  }`

function NavItems({ items, close, nested = false }) {
  return items.map((item) => (
    <li key={item.to}>
      <NavLink to={item.to} end={item.end} className={nested ? childClass : itemClass} onClick={close}>
        {!nested && <Icon d={item.icon} className="size-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {!nested && <span className="ml-auto size-1.5 rounded-full bg-current opacity-0 transition-opacity group-[.active]:opacity-100" />}
      </NavLink>
    </li>
  ))
}

function Sidebar({ user, logout, orgNav, isSuperAdmin, close }) {
  const location = useLocation()
  const programmingActive = location.pathname === '/tasks'
    || location.pathname.startsWith('/topics/')
    || location.pathname === '/practice'
    || location.pathname === '/playground'
  const [programmingState, setProgrammingState] = useState({ pathname: location.pathname, open: programmingActive })
  const programmingOpen = programmingState.pathname === location.pathname ? programmingState.open : programmingActive
  const userName = user?.name?.trim() || 'Learner'
  const initials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <nav className="flex h-full flex-col bg-white p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between rounded-2xl px-2 py-2">
        <Link to="/dashboard" onClick={close} className="rounded-lg focus-visible:outline-brand-500">
          <Logo />
        </Link>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold tracking-wide text-emerald-700">LEARN</span>
      </div>

      <div className="mx-2 mt-4 rounded-2xl bg-linear-to-br from-brand-600 to-violet-600 p-4 text-white shadow-md shadow-brand-900/10">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-white/15"><Icon d={icons.code} className="size-4" /></span>
          <span className="text-xs font-semibold text-indigo-100">Your workspace</span>
        </div>
        <p className="mt-3 text-sm font-semibold">Keep your momentum</p>
        <p className="mt-1 text-xs leading-relaxed text-indigo-100">A little practice every day goes a long way.</p>
      </div>

      <ul className="mt-5 flex-1 space-y-1 overflow-y-auto px-1 pb-3">
        {orgNav.length > 0 && (
          <>
            <li className="mb-2 px-3 pt-2 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">Organization</li>
            <NavItems items={orgNav} close={close} />
            <li className="mb-2 px-3 pt-5 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">Learning</li>
          </>
        )}
        {isSuperAdmin && (
          <>
            <li className="mb-2 px-3 pt-2 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">Platform</li>
            <NavItems items={platformNav} close={close} />
            <li className="mb-2 px-3 pt-5 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">Learning</li>
          </>
        )}
        <NavItems items={[nav[0]]} close={close} />
        <li className="mt-2">
          <button
            type="button"
            aria-expanded={programmingOpen}
            aria-controls="programming-navigation"
            onClick={() => setProgrammingState({ pathname: location.pathname, open: !programmingOpen })}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Icon d={nav[1].icon} className="size-5 shrink-0 text-slate-500 transition-colors group-hover:text-brand-600" />
            <span className="flex-1 text-left">{nav[1].label}</span>
            <svg viewBox="0 0 20 20" className={`size-4 text-slate-400 transition-transform duration-300 ${programmingOpen ? 'rotate-180' : ''}`} fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 011.06 0L10 11.19l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          <div
            id="programming-navigation"
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${programmingOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <div className="min-h-0 overflow-hidden">
              <ul className="mt-1 space-y-0.5 border-l border-slate-200 ml-[21px]">
                <NavItems items={nav[1].children} close={close} nested />
              </ul>
            </div>
          </div>
        </li>
        <NavItems items={nav.slice(2)} close={close} />
        <NavItems items={[{ label: 'Profile', to: '/profile', icon: icons.profile }]} close={close} />
      </ul>

      <div className="border-t border-slate-100 pt-3">
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-600 to-violet-600 text-sm font-bold text-white shadow-sm">{initials}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-800">{userName}</span>
            <span className="block truncate text-xs text-slate-500">{user?.email}</span>
          </span>
        </div>
        <button onClick={logout} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
          <Icon d={icons.logout} className="size-5 transition-transform group-hover:-translate-x-0.5" />
          Sign out
        </button>
      </div>
    </nav>
  )
}

export default function DashboardLayout() {
  const { user, logout, isSuperAdmin } = useAuth()
  const { memberships, activeOrganization, selectOrganization } = useOrg()
  const { theme, toggle, palette, setPalette } = useTheme()
  const [open, setOpen] = useState(false)
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false)
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

  const allItems = [...orgNav, ...(isSuperAdmin ? platformNav : []), ...nav.flatMap((item) => item.children ?? [item]), { label: 'Profile', to: '/profile' }]
  const activeItem = allItems
    .filter((item) => location.pathname === item.to.split('?')[0] || (item.to !== '/dashboard' && item.to !== '/tasks' && location.pathname.startsWith(`${item.to.split('?')[0]}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0]
  const pageTitle = activeItem?.label ?? 'VirVese'
  const activeMemberships = memberships.filter((membership) => membership.organization?.status === 'active')
  const closeMenu = () => setOpen(false)
  const sidebar = <Sidebar user={user} logout={logout} orgNav={orgNav} isSuperAdmin={isSuperAdmin} close={closeMenu} />
  const userName = user?.name?.trim() || 'Learner'
  const initials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div className="dashboard-shell min-h-screen bg-slate-50">
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200/80 bg-white">
        {sidebar}
      </aside>

      {open && (
        <div className="dashboard-mobile-nav fixed inset-0 z-50">
          <button className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" onClick={closeMenu} aria-label="Close navigation" />
          <aside className="absolute inset-y-0 left-0 w-64 animate-pop shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white/80 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="dashboard-menu-button flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            aria-label="Open menu"
          >
            <Icon d={icons.menu} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="hidden text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase sm:block">VirVese workspace</p>
            <h1 className="truncate text-sm font-bold text-slate-900 sm:mt-0.5 sm:text-base">{pageTitle}</h1>
          </div>

          {activeMemberships.length > 0 && (
            <label className="relative hidden items-center sm:flex">
              <select
                aria-label="Active organization"
                value={activeOrganization?.organization?.id ?? ''}
                onChange={(e) => selectOrganization(e.target.value)}
                className="max-w-44 appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:border-brand-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              >
                {activeMemberships.map((membership) => (
                  <option key={membership.organization._id} value={membership.organization._id}>
                    {membership.organization.name} · {membership.role.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-3 size-4 text-slate-400" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 011.06 0L10 11.19l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </label>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <InvitationInbox />
            <div className="relative">
              <button
                type="button"
                onClick={() => setPaletteMenuOpen((current) => !current)}
                className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                aria-label="Choose color palette"
                aria-expanded={paletteMenuOpen}
                aria-haspopup="true"
                title="Color palette"
              >
                <span className="size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_var(--color-slate-300)]" style={{ backgroundColor: PALETTES.find(({ id }) => id === palette)?.color }} />
              </button>
              {paletteMenuOpen && (
                <div role="group" aria-label="Color palettes" className="absolute top-full right-0 z-40 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <p className="px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">Choose a color</p>
                  {PALETTES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={palette === option.id}
                      onClick={() => {
                        setPalette(option.id)
                        setPaletteMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="size-4 rounded-full" style={{ backgroundColor: option.color }} />
                      <span className="flex-1">{option.name}</span>
                      {palette === option.id && <span className="text-xs font-bold text-brand-600" aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggle}
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
            >
              <Icon d={theme === 'dark' ? icons.sun : icons.moon} className="size-5" />
            </button>
            <Link to="/profile" className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-600 to-violet-600 text-sm font-bold text-white shadow-sm ring-2 ring-white transition hover:scale-105 hover:shadow-md" aria-label={`Open profile for ${userName}`}>
              {initials}
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
