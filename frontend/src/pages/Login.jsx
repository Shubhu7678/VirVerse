import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import './login.css'

const YEAR = new Date().getFullYear()

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

        <section className="login-panel" aria-label="Sign in">
          <div className="login-panel-top">
            <span>Already part of the journey?</span>
            <Link to="/signup">Create account <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="login-card">
            <div className="login-card-mark"><img src="/brand-mark.png" alt="" /></div>
            <p className="login-card-kicker">GOOD TO HAVE YOU BACK</p>
            <h2>Welcome back <span aria-hidden="true">👋</span></h2>
            <p className="login-card-subtitle">Sign in and keep your momentum going.</p>

            <form onSubmit={onSubmit} noValidate className="login-form">
              {serverError && (
                <div role="alert" className="login-error">
                  {serverError}
                </div>
              )}
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
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={onChange}
                error={errors.password}
              />
              <Button type="submit" loading={loading} className="login-submit">
                {loading ? 'Signing in…' : 'Sign in'}
                {!loading && <span aria-hidden="true">→</span>}
              </Button>
            </form>

            <div className="login-separator"><span>OR TAKE A LOOK AROUND</span></div>
            <div className="login-demo">
              <div className="login-demo-icon" aria-hidden="true">&lt;/&gt;</div>
              <div className="login-demo-copy">
                <strong>Curious about VirVerse?</strong>
                <span>Try a private demo with C Basics questions.</span>
              </div>
              <button
                type="button"
                onClick={beginDemo}
                disabled={demoLoading || loading}
                className="login-demo-button"
              >
                {demoLoading ? 'Starting…' : 'Explore'}
                {!demoLoading && <span aria-hidden="true">↗</span>}
              </button>
            </div>
            <p className="login-signup-mobile">
              New to VirVerse? <Link to="/signup">Create an account</Link>
            </p>
          </div>
          <p className="login-panel-footer"><span /> Your learning space is waiting.</p>
        </section>
      </div>
    </main>
  )
}
