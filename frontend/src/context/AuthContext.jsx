import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import api, { setUnauthorizedHandler } from '../api/client'
import { purgeLegacyStorage } from '../utils/legacyStorage'
import { clearAsyncCache } from '../hooks/useAsync'
import { useToast } from '../components/ui/Toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const signedIn = useRef(false)

  useEffect(() => {
    signedIn.current = Boolean(user)
  }, [user])

  // A protected call answering 401 means the session ended: clear everything and show the sign-in page.
  useEffect(() => {
    setUnauthorizedHandler((message) => {
      if (!signedIn.current) return
      signedIn.current = false
      clearAsyncCache()
      setUser(null)
      toast.error(message || 'Your session has expired. Please sign in again.')
    })
    return () => setUnauthorizedHandler(null)
  }, [toast])

  useEffect(() => {
    purgeLegacyStorage()
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
    const { data } = await api.post('/auth/login', credentials)
    clearAsyncCache()
    setUser(data.user)
  }, [])

  const startDemo = useCallback(async () => {
    const { data } = await api.post('/auth/demo')
    clearAsyncCache()
    setUser(data.user)
  }, [])

  // Step 1 only emails a 6-digit code; the account exists after verifySignup.
  const signup = useCallback(async (details) => (await api.post('/auth/signup', details)).data, [])

  const verifySignup = useCallback(async (email, code) => {
    const { data } = await api.post('/auth/signup/verify', { email, code })
    setUser(data.user)
    toast.success('Email verified. Welcome to VirVerse!')
  }, [toast])

  const resendSignupCode = useCallback(async (email) => (await api.post('/auth/signup/resend', { email })).data, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    clearAsyncCache() // never show one account's cached data to the next
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
