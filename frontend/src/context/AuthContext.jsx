import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const loadSession = useCallback(async () => {
    const { data } = await api.get('/auth/me')
    setUser(data.user)
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
  }, [])

  const updateGamification = useCallback(({ points, level }) => {
    setUser((current) => current ? { ...current, points, level } : current)
  }, [])

  const value = useMemo(
    () => ({ user, isAdmin: Boolean(user?.isAdmin), loading, login, startDemo, signup, logout, loadSession, updateGamification }),
    [user, loading, login, startDemo, signup, logout, loadSession, updateGamification],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
