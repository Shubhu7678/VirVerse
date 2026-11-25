import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import CodeInput from '../components/CodeInput'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import { useToast } from '../components/ui/Toast'

export default function Signup() {
  const { signup, verifySignup, resendSignupCode } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  // After the form is accepted we wait here for the 6-digit code that was emailed.
  const [verifying, setVerifying] = useState(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [notice, setNotice] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const er = {}
    if (!form.name.trim()) er.name = 'Name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email'
    if (form.password.length < 8) er.password = 'Password must be at least 8 characters'
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      er.password = 'Password must contain a letter and a number'
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match'
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
      const info = await signup({ name: form.name.trim(), email: form.email, password: form.password })
      setVerifying(info)
      setCooldown(info.resendInSeconds ?? 60)
      setCode('')
      setNotice('')
      toast.success(`Verification code sent to ${info.email}`)
    } catch (err) {
      const fieldErrors = err?.response?.data?.errors
      if (fieldErrors) setErrors(fieldErrors)
      setServerError(getErrorMessage(err, 'Signup failed'))
    } finally {
      setLoading(false)
    }
  }

  const submitCode = async (value = code) => {
    if (value.length !== 6) {
      setCodeError('Enter all 6 digits')
      return
    }
    setCodeError('')
    setLoading(true)
    try {
      await verifySignup(verifying.email, value)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setCodeError(getErrorMessage(err, 'Could not verify the code'))
      if (['CODE_EXPIRED', 'TOO_MANY_ATTEMPTS'].includes(err?.response?.data?.code)) setVerifying(null)
      else setCode('')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setCodeError('')
    setNotice('')
    try {
      const info = await resendSignupCode(verifying.email)
      setCooldown(info.resendInSeconds ?? 60)
      setCode('')
      setNotice('A new code is on its way.')
      toast.success('New code sent. Check your inbox')
    } catch (err) {
      const wait = err?.response?.data?.retryAfter
      if (wait) setCooldown(wait)
      setCodeError(getErrorMessage(err, 'Could not send a new code'))
    }
  }

  const rules = [
    { ok: form.password.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Za-z]/.test(form.password) && /\d/.test(form.password), label: 'A letter and a number' },
  ]

  if (verifying) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={<>We sent a 6-digit code to <strong className="text-fg">{verifying.email}</strong>. It expires in 10 minutes.</>}
        footer={<>Wrong email? <button type="button" className="au-link-button" onClick={() => { setVerifying(null); setCodeError(''); setServerError('') }}>Go back</button></>}
      >
        <form onSubmit={(e) => { e.preventDefault(); submitCode() }} noValidate className="au-form">
          {codeError && <div role="alert" className="au-error">{codeError}</div>}
          {notice && <div role="status" className="text-sm text-success">{notice}</div>}
          <CodeInput value={code} onChange={(v) => { setCode(v); setCodeError('') }} onComplete={submitCode} disabled={loading} error={codeError} />
          <button type="submit" disabled={loading || code.length !== 6} className="au-btn au-btn-primary">{loading ? 'Verifying…' : 'Verify and create account'}</button>
          <p className="text-center text-sm text-fg-muted">
            Did not get it? Check spam.{' '}
            {cooldown > 0
              ? <span>Resend in {cooldown}s</span>
              : <button type="button" className="au-link-button" onClick={resend}>Send a new code</button>}
          </p>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start learning in less than a minute."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="au-form">
        {serverError && <div role="alert" className="au-error">{serverError}</div>}
        <Input id="name" name="name" label="Full name" placeholder="Jane Doe" autoComplete="name" value={form.name} onChange={onChange} error={errors.name} />
        <Input id="email" name="email" type="email" label="Email address" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
        <Input id="password" name="password" type="password" label="Password" placeholder="At least 8 characters" autoComplete="new-password" value={form.password} onChange={onChange} error={errors.password} />
        <ul className="au-rules" aria-label="Password requirements">
          {rules.map((r) => <li key={r.label} className={r.ok ? 'is-ok' : ''}>{r.ok ? '✓' : '○'} {r.label}</li>)}
        </ul>
        <Input id="confirm" name="confirm" type="password" label="Confirm password" placeholder="Repeat your password" autoComplete="new-password" value={form.confirm} onChange={onChange} error={errors.confirm} />
        <button type="submit" disabled={loading} className="au-btn au-btn-primary">
          {loading ? 'Sending your code…' : 'Continue'}
        </button>
      </form>
    </AuthShell>
  )
}
