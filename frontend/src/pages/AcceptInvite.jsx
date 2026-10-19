import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'
import { ErrorBlock, LoadingBlock } from '../components/States'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage } from '../api/client'

const roleLabel = { org_admin: 'administrator', teacher: 'teacher', student: 'student' }

export default function AcceptInvite() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const { loadSession } = useAuth()
  const navigate = useNavigate()
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', password: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/invitations/preview', { params: { token } })
      .then((r) => setInvite(r.data))
      .catch((e) => setError(getErrorMessage(e)))
  }, [token])

  const accept = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/invitations/accept', { token, ...form })
      await loadSession()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Accept invitation" subtitle={invite ? `Join ${invite.organization} as ${roleLabel[invite.role]}` : ''}>
      {!invite && !error && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {invite && (
        <form onSubmit={accept} className="mt-4 space-y-4">
          <p className="text-sm text-slate-500">Invitation for <b>{invite.email}</b></p>
          {invite.existingAccount ? (
            <>
              <p className="text-sm">You already have an account. Sign in with this email, then open this link again.</p>
              <Link to="/login" className="font-medium text-brand-600">Go to sign in</Link>
              <Button loading={loading}>Accept invitation</Button>
            </>
          ) : (
            <>
              <Input id="i-name" label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input id="i-pw" label="Password (min 8 characters)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <Button loading={loading}>Create account</Button>
            </>
          )}
        </form>
      )}
    </AuthLayout>
  )
}
