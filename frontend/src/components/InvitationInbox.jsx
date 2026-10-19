import { useCallback, useEffect, useRef, useState } from 'react'
import api, { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import Modal from './Modal'
import { ErrorBlock } from './States'

const roleNames = {
  org_admin: 'Organization Admin',
  teacher: 'Teacher',
  student: 'Student',
}

export default function InvitationInbox() {
  const { loadSession } = useAuth()
  const [invitations, setInvitations] = useState([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [acceptingId, setAcceptingId] = useState(null)
  const didAutoOpen = useRef(false)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/invitations/mine')
    const pending = data.invitations ?? []
    setInvitations(pending)
    if (pending.length && !didAutoOpen.current) {
      setOpen(true)
      didAutoOpen.current = true
    }
  }, [])

  // Synchronize the signed-in user's inbox with the server after the layout mounts.
  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    refresh().catch((err) => setError(getErrorMessage(err)))
  }, [refresh])

  const accept = async (invitation) => {
    setError('')
    setAcceptingId(invitation.id)
    try {
      await api.post(`/invitations/${invitation.id}/accept`)
      await loadSession()
      await refresh()
      if (invitations.length <= 1) setOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
      await refresh().catch((refreshError) => setError(getErrorMessage(refreshError)))
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <>
      {invitations.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
        >
          Invitations <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs text-white">{invitations.length}</span>
        </button>
      )}
      {open && (
        <Modal title="Organization invitations" onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              These invitations were sent to your signed-in email address.
            </p>
            {error && <ErrorBlock message={error} />}
            {invitations.map((invitation) => (
              <section key={invitation.id} className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold">{invitation.organization.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Join as {roleNames[invitation.role] ?? invitation.role}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                </p>
                <Button
                  className="mt-3"
                  loading={acceptingId === invitation.id}
                  disabled={acceptingId !== null}
                  onClick={() => accept(invitation)}
                >
                  Accept invitation
                </Button>
              </section>
            ))}
            {invitations.length === 0 && !error && (
              <p className="text-sm text-slate-500">You have no pending invitations.</p>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
