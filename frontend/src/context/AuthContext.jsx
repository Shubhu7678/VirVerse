import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { useToast } from '../components/ui/Toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

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
    toast.success('Signed in successfully')
  }, [loadSession, toast])

  const startDemo = useCallback(async () => {
    await api.post('/auth/demo')
    await loadSession()
    toast.success('Demo started. Your progress is kept for 24 hours')
  }, [loadSession, toast])

  // Step 1 only emails a 6-digit code; the account exists after verifySignup.
  const signup = useCallback(async (details) => (await api.post('/auth/signup', details)).data, [])

  const verifySignup = useCallback(async (email, code) => {
    await api.post('/auth/signup/verify', { email, code })
    await loadSession()
    toast.success('Email verified. Welcome to VirVerse!')
  }, [loadSession, toast])

  const resendSignupCode = useCallback(async (email) => (await api.post('/auth/signup/resend', { email })).data, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    setUser(null)
    toast.success('Signed out successfully')
  }, [toast])

  const updateGamification = useCallback(({ points, level }) => {
    setUser((current) => current ? { ...current, points, level } : current)
  }, [])

  const value = useMemo(
    () => ({ user, isAdmin: Boolean(user?.isAdmin), loading, login, startDemo, signup, verifySignup, resendSignupCode, logout, loadSession, updateGamification }),
    [user, loading, login, startDemo, signup, verifySignup, resendSignupCode, logout, loadSession, updateGamification],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
