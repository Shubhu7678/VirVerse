import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Icon, { icons } from '../components/Icon'
import './landing.css'

const YEAR = new Date().getFullYear()

const stats = [
  { value: '3', label: 'Languages to learn', detail: 'C, JavaScript, Python' },
  { value: '17', label: 'C topics', detail: 'From Hello World onward' },
  { value: '4', label: 'Learning tracks', detail: 'Including web development' },
  { value: '0', label: 'Setup required', detail: 'Everything runs in the browser' },
]

const stack = ['C', 'JavaScript', 'Python', 'HTML', 'Monaco editor', 'Docker sandbox', 'Instant feedback', 'Progress tracking', 'Classroom tools']

const features = [
  { icon: icons.code, title: 'In-browser playground', text: 'Write and run C, JavaScript and Python in a real editor. No installs, no configuration.', to: '/playground', cta: 'Open the playground' },
  { icon: icons.list, title: 'Structured roadmaps', text: 'Follow ordered topics from your first program to advanced concepts, one step at a time.', to: '/tasks', cta: 'Browse C topics' },
  { icon: icons.tasks, title: 'Practice problems', text: 'Turn what you learn into skill with graded tasks, test cases and instant results.', to: '/practice', cta: 'Browse problems' },
  { icon: icons.dashboard, title: 'Progress you can see', text: 'Track solved tasks, submissions and what to do next, and pick up where you left off.' },
  { icon: icons.terminal, title: 'Safe code execution', text: 'Every run happens in a short-lived, network-isolated container, so experiments never break anything.' },
  { icon: icons.profile, title: 'Built for classrooms', text: 'Organizations, sections and assignments let teachers guide a whole group of learners.' },
]

const tracks = [
  { name: 'C Programming', tag: '17 topics', text: 'Variables, control flow, arrays, strings and functions.', to: '/tasks', practice: '/practice' },
  { name: 'JavaScript', tag: 'Playground + practice', text: 'Core language fundamentals, functions, arrays and objects.', to: '/javascript', practice: '/javascript/practice' },
  { name: 'Python', tag: 'Playground + practice', text: 'Readable syntax, data structures and problem solving.', to: '/python', practice: '/python/practice' },
  { name: 'Web development', tag: 'HTML first', text: 'Learn HTML with guided tasks. CSS and JavaScript are coming soon.', to: '/web-development/html', practice: '/web-development/html-basics' },
]

const steps = [
  { title: 'Pick a track', text: 'Choose C, JavaScript, Python or web development.' },
  { title: 'Learn a topic', text: 'Read a short explanation with examples you can edit.' },
  { title: 'Solve problems', text: 'Run your code, check results, and submit when it passes.' },
  { title: 'Track growth', text: 'See your progress and move on to the next topic.' },
]

const faqs = [
  { q: 'Do I need to install anything?', a: 'No. The editor, compiler and interpreters run for you. Open a playground and start typing.' },
  { q: 'Which languages can I learn?', a: 'C, JavaScript and Python have full tracks and playgrounds. Web development currently covers HTML, with CSS and JavaScript on the way.' },
  { q: 'Is my code safe to run?', a: 'Yes. Code runs in isolated, short-lived containers with networking turned off.' },
  { q: 'Can a school or team use it?', a: 'Yes. Organizations can create departments, courses and sections, invite members and set assignments.' },
  { q: 'Will my progress be saved?', a: 'When you sign in, submissions and completed tasks are saved to your account.' },
]

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const items = node.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

function Heading({ eyebrow, title, sub }) {
  return (
    <div className="lp-heading" data-reveal>
      <p className="lp-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {sub && <p className="lp-sub">{sub}</p>}
    </div>
  )
}

function HeroMock() {
  return (
    <div className="lp-mock" role="img" aria-label="Preview of the VirVerse editor running a C program that prints Hello, VirVerse">
      <div className="lp-mock-bar">
        <span className="lp-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="lp-mock-title">main.c</span>
        <span className="lp-mock-meta">C11 · GCC</span>
      </div>
      <pre className="lp-code" aria-hidden="true"><code>
        <span className="c-k">#include</span> <span className="c-s">&lt;stdio.h&gt;</span>{'\n\n'}
        <span className="c-t">int</span> <span className="c-f">main</span>() {'{'}{'\n'}
        {'  '}<span className="c-f">printf</span>(<span className="c-s">&quot;Hello, VirVerse!\n&quot;</span>);{'\n'}
        {'  '}<span className="c-k">return</span> 0;{'\n'}
        {'}'}
      </code></pre>
      <div className="lp-mock-run" aria-hidden="true"><span><Icon d={icons.terminal} className="size-4" /> Output</span><b><i /> Exited with code 0</b></div>
      <pre className="lp-out" aria-hidden="true">Hello, VirVerse!</pre>
      <div className="lp-mock-cards" aria-hidden="true">
        <div><small>Solved</small><b>4 / 10</b><span className="lp-bar"><i style={{ width: '40%' }} /></span></div>
        <div><small>Next up</small><b>Input &amp; Output</b><span className="lp-bar"><i style={{ width: '15%' }} /></span></div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { user, loading, isSuperAdmin } = useAuth()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useReveal()
  const destination = user ? (isSuperAdmin ? '/platform' : '/dashboard') : '/signup'
  const ctaLabel = loading ? 'Checking session…' : user ? 'Go to dashboard' : 'Start learning'
  const guard = (event) => { if (loading) event.preventDefault(); else setMenuOpen(false) }
  const close = () => setMenuOpen(false)

  return (
    <div className="lp" ref={rootRef} id="home">
      <a className="lp-skip" href="#main">Skip to content</a>
      <header className="lp-header">
        <div className="lp-wrap lp-header-in">
          <a className="lp-brand" href="#home" aria-label="VirVerse home"><img src="/brand-mark.svg" alt="" /><span>VirVerse</span></a>
          <nav id="lp-nav" className={`lp-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <a href="#features" onClick={close}>Features</a>
            <a href="#tracks" onClick={close}>Tracks</a>
            <a href="#process" onClick={close}>How it works</a>
            <a href="#teams" onClick={close}>For teams</a>
            <a href="#faq" onClick={close}>FAQ</a>
            {!user && !loading && <Link className="lp-nav-login" to="/login" onClick={close}>Sign in</Link>}
            <Link to={destination} className="lp-btn lp-btn-primary lp-nav-cta" onClick={guard} aria-disabled={loading}>{ctaLabel}</Link>
          </nav>
          <div className="lp-actions">
            {!user && !loading && <Link className="lp-link lp-hide-sm" to="/login">Sign in</Link>}
            <button type="button" className="lp-icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
              <Icon d={theme === 'dark' ? icons.sun : icons.moon} className="size-4" />
            </button>
            <Link to={destination} className="lp-btn lp-btn-primary lp-btn-sm lp-hide-sm" onClick={guard} aria-disabled={loading}>{ctaLabel}</Link>
            <button type="button" className="lp-icon-btn lp-menu-btn" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="lp-nav" onClick={() => setMenuOpen((o) => !o)}>
              <Icon d={menuOpen ? icons.close : icons.menu} className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-in">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow lp-eyebrow-pill"><span className="lp-pulse" /> Learn C · JavaScript · Python · HTML</p>
              <h1>Learn to code by <span className="lp-grad">writing real code.</span></h1>
              <p className="lp-lede">VirVerse is an interactive platform with guided roadmaps, practice problems and an in-browser editor, so you build real programming skills step by step.</p>
              <div className="lp-cta-row">
                <Link to={destination} className="lp-btn lp-btn-primary" onClick={guard} aria-disabled={loading}>{ctaLabel}</Link>
                <Link to="/playground" className="lp-btn lp-btn-ghost">Try the playground</Link>
              </div>
              <ul className="lp-checks">
                <li><Icon d={icons.check} className="size-4" /> No installs</li>
                <li><Icon d={icons.check} className="size-4" /> Instant feedback</li>
                <li><Icon d={icons.check} className="size-4" /> Free to start</li>
              </ul>
            </div>
            <HeroMock />
          </div>
          <div className="lp-wrap">
            <dl className="lp-stats">
              {stats.map((s) => (
                <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd><small>{s.detail}</small></div>
              ))}
            </dl>
          </div>
        </section>

        <section className="lp-marquee" aria-label="What is included">
          <div className="lp-marquee-track" aria-hidden="true">
            {[...stack, ...stack].map((item, i) => <span key={i}>{item}</span>)}
          </div>
          <p className="lp-sr">{stack.join(', ')}</p>
        </section>

        <section className="lp-section" id="features">
          <div className="lp-wrap">
            <Heading eyebrow="Features" title="Everything you need to learn programming." sub="A focused toolkit that replaces a pile of tutorials, installers and scattered notes." />
            <div className="lp-grid lp-grid-3">
              {features.map((f) => (
                <article className="lp-card" key={f.title} data-reveal>
                  <span className="lp-icon"><Icon d={f.icon} className="size-5" /></span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                  {f.to && <Link className="lp-more" to={f.to}>{f.cta} <Icon d={icons.arrow} className="size-3.5" /></Link>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-alt" id="tracks">
          <div className="lp-wrap">
            <Heading eyebrow="Tracks" title="Pick a language and start building." sub="Every track has topics to read, a playground to experiment in and problems to solve." />
            <div className="lp-grid lp-grid-4">
              {tracks.map((t) => (
                <article className="lp-card lp-track" key={t.name} data-reveal>
                  <span className="lp-badge">{t.tag}</span>
                  <h3>{t.name}</h3>
                  <p>{t.text}</p>
                  <div className="lp-track-links">
                    <Link className="lp-btn lp-btn-ghost lp-btn-sm" to={t.to}>Open {t.name} topics</Link>
                    <Link className="lp-more" to={t.practice}>Practice {t.name}</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section" id="process">
          <div className="lp-wrap">
            <Heading eyebrow="How it works" title="From first line to confident coder." sub="A simple loop that keeps you moving forward." />
            <ol className="lp-steps">
              {steps.map((s, i) => (
                <li key={s.title} data-reveal>
                  <span className="lp-step-n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="lp-center" data-reveal><Link to={destination} className="lp-btn lp-btn-primary" onClick={guard} aria-disabled={loading}>{ctaLabel}</Link></div>
          </div>
        </section>

        <section className="lp-section lp-alt" id="teams">
          <div className="lp-wrap lp-split">
            <div data-reveal>
              <p className="lp-eyebrow">For teams and classrooms</p>
              <h2>Teach a whole group, not one learner at a time.</h2>
              <p className="lp-sub">Create an organization, split it into departments, courses and sections, invite members and set assignments. Follow how each learner is doing.</p>
              <ul className="lp-list">
                <li><Icon d={icons.check} className="size-4" /> Invitations by email</li>
                <li><Icon d={icons.check} className="size-4" /> Assignments per section</li>
                <li><Icon d={icons.check} className="size-4" /> Per-learner progress view</li>
              </ul>
            </div>
            <div className="lp-panel" data-reveal aria-hidden="true">
              <div className="lp-panel-row"><b>Section A · Intro to C</b><span className="lp-badge">Sample</span></div>
              <div className="lp-panel-row"><span>Assignment: Loops</span><span className="lp-bar"><i style={{ width: '72%' }} /></span></div>
              <div className="lp-panel-row"><span>Assignment: Arrays</span><span className="lp-bar"><i style={{ width: '38%' }} /></span></div>
              <div className="lp-panel-row"><span>Assignment: Functions</span><span className="lp-bar"><i style={{ width: '9%' }} /></span></div>
            </div>
          </div>
        </section>

        <section className="lp-section" id="faq">
          <div className="lp-wrap lp-narrow">
            <Heading eyebrow="FAQ" title="Questions, answered." />
            <div className="lp-faq" data-reveal>
              {faqs.map((f) => (
                <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-wrap">
          <div className="lp-final" data-reveal>
            <h2>Your next skill is one program away.</h2>
            <p>Create a free account and run your first program in under a minute.</p>
            <Link to={destination} className="lp-btn lp-btn-primary" onClick={guard} aria-disabled={loading}>{ctaLabel}</Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-in">
          <div className="lp-footer-brand">
            <a className="lp-brand" href="#home"><img src="/brand-mark.svg" alt="" /><span>VirVerse</span></a>
            <p>Learn by doing. Build with confidence.</p>
          </div>
          <nav aria-label="Tracks"><h3>Tracks</h3><Link to="/tasks">C programming</Link><Link to="/javascript">JavaScript</Link><Link to="/python">Python</Link><Link to="/web-development/html">Web development</Link></nav>
          <nav aria-label="Tools"><h3>Tools</h3><Link to="/playground">C playground</Link><Link to="/javascript/playground">JavaScript playground</Link><Link to="/python/playground">Python playground</Link><Link to="/practice">Practice problems</Link></nav>
          <nav aria-label="Account"><h3>Account</h3><Link to="/login">Sign in</Link><Link to="/signup">Create account</Link><a href="#faq">FAQ</a></nav>
        </div>
        <div className="lp-wrap lp-copy">© {YEAR} VirVerse. All rights reserved.</div>
      </footer>
    </div>
  )
}
