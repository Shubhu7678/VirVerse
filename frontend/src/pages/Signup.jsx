import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import './login.css'

const YEAR = new Date().getFullYear()

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

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
      await signup({ name: form.name.trim(), email: form.email, password: form.password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const fieldErrors = err?.response?.data?.errors
      if (fieldErrors) setErrors(fieldErrors)
      setServerError(getErrorMessage(err, 'Signup failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-story" aria-label="About VirVerse">
          <div className="login-orbit login-orbit-large" aria-hidden="true" />
          <div className="login-orbit login-orbit-small" aria-hidden="true" />
          <header className="login-nav">
            <Link to="/login" className="login-brand" aria-label="VirVerse home">
              <img src="/brand-mark.png" alt="" />
              <span>VirVerse</span>
            </Link>
            <span className="login-nav-note">A little progress every day.</span>
          </header>

          <div className="login-hero">
            <div className="login-eyebrow"><span /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1>Learn. Code.<br /><span>Grow.</span></h1>
            <p className="login-hero-copy">
              Build real skills, one challenge at a time. Pick up where you left off and keep creating.
            </p>
            <div className="login-code-card" aria-hidden="true">
              <div className="login-code-top"><i /><i /><i /><span>hello-world.c</span></div>
              <div className="login-code-lines">
                <span><b>01</b><em>int</em> main() {'{'}</span>
                <span><b>02</b>&nbsp;&nbsp;printf(<strong>&quot;hello, world&quot;</strong>);</span>
                <span><b>03</b>&nbsp;&nbsp;<em>return</em> 0;</span>
                <span><b>04</b>{'}'}</span>
              </div>
              <div className="login-code-glow" />
            </div>
            <div className="login-hero-foot">
              <span className="login-foot-mark"><img src="/brand-mark.png" alt="" /></span>
              <span>Learn at your pace.<br /><strong>Build at your level.</strong></span>
              <span className="login-foot-divider" />
              <span className="login-foot-tag">C · HTML · MORE</span>
            </div>
          </div>
          <p className="login-copyright">© {YEAR} VirVerse</p>
        </section>

        <section className="login-panel" aria-label="Create account">
          <div className="login-panel-top">
            <span>Already part of the journey?</span>
            <Link to="/login">Sign in <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="login-card signup-card">
            <div className="login-card-mark"><img src="/brand-mark.png" alt="" /></div>
            <p className="login-card-kicker">YOUR NEXT CHAPTER STARTS HERE</p>
            <h2>Create your account</h2>
            <p className="login-card-subtitle">Get started in less than a minute.</p>

            <form onSubmit={onSubmit} noValidate className="login-form">
              {serverError && (
                <div role="alert" className="login-error">
                  {serverError}
                </div>
              )}
              <Input
                id="name"
                name="name"
                label="Full name"
                placeholder="Jane Doe"
                autoComplete="name"
                value={form.name}
                onChange={onChange}
                error={errors.name}
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                error={errors.email}
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={onChange}
                error={errors.password}
              />
              <Input
                id="confirm"
                name="confirm"
                type="password"
                label="Confirm password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={onChange}
                error={errors.confirm}
              />
              <Button type="submit" loading={loading} className="login-submit">
                {loading ? 'Creating account…' : 'Create account'}
                {!loading && <span aria-hidden="true">→</span>}
              </Button>
            </form>
            <p className="login-signup-mobile">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
          <p className="login-panel-footer"><span /> Your learning space is waiting.</p>
        </section>
      </div>
    </main>
  )
}
