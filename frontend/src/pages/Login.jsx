import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'

export default function Login() {
  const { login, startDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const er = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email'
    if (!form.password) er.password = 'Password is required'
    return er
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  const beginDemo = async () => {
    setServerError('')
    setDemoLoading(true)
    try {
      await startDemo()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not start the demo'))
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep your momentum going."
      footer={<>New to VirVerse? <Link to="/signup">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="au-form">
        {serverError && <div role="alert" className="au-error">{serverError}</div>}
        <Input id="email" name="email" type="email" autoFocus label="Email address" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
        <Input id="password" name="password" type="password" label="Password" placeholder="Enter your password" autoComplete="current-password" value={form.password} onChange={onChange} error={errors.password} />
        <p className="-mt-1 text-right text-sm"><Link to="/forgot-password">Forgot password?</Link></p>
        <button type="submit" disabled={loading || demoLoading} className="au-btn au-btn-primary">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="au-or"><span>or</span></div>
      <button type="button" onClick={beginDemo} disabled={demoLoading || loading} className="au-btn au-btn-ghost">
        {demoLoading ? 'Starting demo…' : 'Try a private demo'}
      </button>
      <p className="au-hint">The demo gives you C Basics questions, no account needed.</p>
    </AuthShell>
  )
}
