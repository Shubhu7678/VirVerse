import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Input from '../components/Input'
import AuthShell from '../components/AuthShell'
import { resetPassword } from '../api/auth'
import { getErrorMessage } from '../api/client'
import { useToast } from '../components/ui/Toast'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const toast = useToast()
  const token = params.get('token') || ''
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const er = {}
    if (form.password.length < 8) er.password = 'Password must be at least 8 characters'
    else if (!/[A-Za-z]/.test(form.password)) er.password = 'Password must contain a letter'
    else if (!/\d/.test(form.password)) er.password = 'Password must contain a number'
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match'
    setErrors(er)
    if (Object.keys(er).length) return
    setLoading(true)
    try {
      await resetPassword(token, form.password)
      setDone(true)
      toast.success('Password changed successfully')
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not change your password'))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthShell title="This link is not valid" subtitle="The reset link is missing its code. Request a new one." footer={<Link to="/login">Back to sign in</Link>}>
        <Link to="/forgot-password" className="au-btn au-btn-primary">Request a new link</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={done ? 'Password changed' : 'Choose a new password'}
      subtitle={done ? 'You can now sign in with your new password.' : 'Use at least 8 characters with a letter and a number.'}
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {done ? (
        <Link to="/login" className="au-btn au-btn-primary">Sign in</Link>
      ) : (
        <form onSubmit={onSubmit} noValidate className="au-form">
          {serverError && (
            <div role="alert" className="au-error">
              {serverError} <Link to="/forgot-password">Get a new link</Link>
            </div>
          )}
          <Input id="password" name="password" type="password" label="New password" autoComplete="new-password" value={form.password} onChange={onChange} error={errors.password} />
          <Input id="confirm" name="confirm" type="password" label="Confirm new password" autoComplete="new-password" value={form.confirm} onChange={onChange} error={errors.confirm} />
          <button type="submit" disabled={loading} className="au-btn au-btn-primary">{loading ? 'Saving…' : 'Change password'}</button>
        </form>
      )}
    </AuthShell>
  )
}
