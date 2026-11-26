import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import AuthShell from '../components/AuthShell'
import { requestPasswordReset } from '../api/auth'
import { getErrorMessage } from '../api/client'
import { useToast } from '../components/ui/Toast'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email')
      return
    }
    setLoading(true)
    try {
      const { message } = await requestPasswordReset(email)
      setSent(message)
      toast.success('Reset link sent. Check your inbox')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send the reset link'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to choose a new one."
      footer={<>Remembered it? <Link to="/login">Back to sign in</Link></>}
    >
      {sent ? (
        <div role="status" className="au-form">
          <p className="text-sm leading-relaxed text-fg">{sent}</p>
          <p className="text-sm text-fg-muted">Nothing arrived? Check your spam folder, or ask your admin to send you a link.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="au-form">
          {error && <div role="alert" className="au-error">{error}</div>}
          <Input id="email" name="email" type="email" autoFocus label="Email address" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={loading} className="au-btn au-btn-primary">{loading ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
    </AuthShell>
  )
}
