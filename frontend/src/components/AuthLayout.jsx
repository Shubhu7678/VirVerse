const YEAR = new Date().getFullYear()

export function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-sm">
        V
      </div>
      <span className="text-lg font-bold tracking-tight">VirVese</span>
    </div>
  )
}

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-brand-600 via-indigo-600 to-violet-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-lg font-bold backdrop-blur">
            V
          </div>
          <span className="text-lg font-bold tracking-tight">VirVese</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl leading-tight font-bold">Everything you need, in one place.</h2>
          <p className="mt-4 text-indigo-100">
            Sign in to manage your workspace, track your progress and stay on top of what matters.
          </p>
        </div>
        <p className="text-sm text-indigo-200">© {YEAR} VirVese</p>
        <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -top-16 right-16 size-64 rounded-full bg-violet-400/20 blur-2xl" />
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </main>
    </div>
  )
}
