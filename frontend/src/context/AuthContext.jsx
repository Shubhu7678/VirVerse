import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user)
        setMemberships(data.memberships ?? [])
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const loadSession = useCallback(async () => {
    const { data } = await api.get('/auth/me')
    setUser(data.user)
    setMemberships(data.memberships ?? [])
  }, [])

  const login = useCallback(async (credentials) => {
    await api.post('/auth/login', credentials)
    await loadSession()
  }, [loadSession])

  const startDemo = useCallback(async () => {
    await api.post('/auth/demo')
    await loadSession()
  }, [loadSession])

  const signup = useCallback(async (details) => {
    await api.post('/auth/signup', details)
    await loadSession()
  }, [loadSession])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    setUser(null)
    setMemberships([])
  }, [])

  const updateGamification = useCallback(({ points, level }) => {
    setUser((current) => current ? { ...current, points, level } : current)
  }, [])

  const value = useMemo(
    () => ({ user, memberships, isSuperAdmin: user?.platformRole === 'super_admin', loading, login, startDemo, signup, logout, loadSession, updateGamification }),
    [user, memberships, loading, login, startDemo, signup, logout, loadSession, updateGamification],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
