import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'

const OrgContext = createContext(null)

export function OrgProvider({ children }) {
  const { user, memberships } = useAuth()
  const [organizationId, setOrganizationId] = useState(null)
  const [activeOrganization, setActiveOrganization] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('virvese:activeOrgId')
      setOrganizationId(null)
      setActiveOrganization(null)
      return
    }
    const available = memberships.filter((m) => m.organization?.status === 'active')
    const stored = localStorage.getItem(`virvese:activeOrgId:${user.id}`)
    const selected = available.find((m) => String(m.organization._id) === stored) ?? available[0]
    if (selected) {
      localStorage.setItem(`virvese:activeOrgId:${user.id}`, selected.organization._id)
      localStorage.setItem('virvese:activeOrgId', selected.organization._id)
      setOrganizationId(selected.organization._id)
    } else {
      localStorage.removeItem('virvese:activeOrgId')
      setOrganizationId(null)
      setActiveOrganization(null)
    }
  }, [user, memberships])

  useEffect(() => {
    if (!user || !organizationId) return
    let cancelled = false
    setLoading(true)
    api.get('/orgs/active')
      .then(({ data }) => { if (!cancelled) setActiveOrganization(data) })
      .catch(() => { if (!cancelled) setActiveOrganization(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [organizationId, user])

  const selectOrganization = useCallback((id) => {
    const membership = memberships.find((m) => String(m.organization?._id) === String(id))
    if (!membership || membership.organization.status !== 'active') {
      throw new Error('You are not an active member of that organization')
    }
    localStorage.setItem(`virvese:activeOrgId:${user.id}`, id)
    localStorage.setItem('virvese:activeOrgId', id)
    setActiveOrganization(null)
    setOrganizationId(id)
  }, [memberships, user])

  const value = useMemo(() => ({
    organizationId,
    activeOrganization,
    loading,
    memberships,
    selectOrganization,
  }), [organizationId, activeOrganization, loading, memberships, selectOrganization])

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrg() {
  const context = useContext(OrgContext)
  if (!context) throw new Error('useOrg must be used within OrgProvider')
  return context
}
