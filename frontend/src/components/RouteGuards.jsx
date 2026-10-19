import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function GuestRoute() {
  const { user, loading, isSuperAdmin } = useAuth()

  if (loading) return <FullPageSpinner />
  if (user) return <Navigate to={isSuperAdmin ? '/platform' : '/dashboard'} replace />
  return <Outlet />
}

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-8 text-brand-600" />
    </div>
  )
}

export function SuperAdminRoute() {
  const { isSuperAdmin } = useAuth()
  return isSuperAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />
}
