import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buttonClasses } from '../components/buttonStyles'

export default function NotFound() {
  const { user, isAdmin } = useAuth()
  const home = user ? (isAdmin ? '/admin' : '/dashboard') : '/'
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-medium text-fg-subtle">404</p>
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Page not found</h1>
      <p className="max-w-sm text-sm text-fg-muted">The page you are looking for does not exist or has moved.</p>
      <Link to={home} className={buttonClasses({ size: 'lg' })}>{user ? 'Back to dashboard' : 'Back to home'}</Link>
    </div>
  )
}
