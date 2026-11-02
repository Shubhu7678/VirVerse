import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon, { icons } from '../components/Icon'
import './landing.css'

const YEAR = new Date().getFullYear()
const LandingScene = lazy(() => import('../components/LandingScene'))

const features = [
  {
    icon: icons.code,
    tag: 'LEARN BY BUILDING',
    title: 'Interactive Playground',
    description: 'Write and run C, JavaScript, and Python programs right in your browser. No setup, just start coding.',
    accent: 'violet',
  },
  {
    icon: icons.list,
    tag: 'A CLEAR PATH',
    title: 'Structured Learning Path',
    description: 'Follow a guided roadmap from your first program through the fundamentals of C.',
    accent: 'blue',
  },
  {
    icon: icons.tasks,
    tag: 'PRACTICE WITH PURPOSE',
    title: 'Practice Problems',
    description: 'Turn what you learn into confidence with hands-on coding challenges.',
    accent: 'cyan',
  },
  {
    icon: icons.dashboard,
    tag: 'SEE YOUR GROWTH',
    title: 'Track Your Progress',
    description: 'Keep your learning organized and pick up right where you left off.',
    accent: 'violet',
  },
]

const roadmap = [
  { number: '01', title: 'C Basics', detail: 'Hello World, input & output, variables', icon: icons.code },
  { number: '02', title: 'Control Flow', detail: 'If-else, switch, loops', icon: icons.tasks },
  { number: '03', title: 'Data Structures', detail: 'Arrays, strings, functions', icon: icons.list },
  { number: '04', title: 'Build & Explore', detail: 'Practice problems and web development', icon: icons.globe },
]

function ProductPreview() {
  return (
    <div className="landing-preview" aria-label="VirVerse learning workspace preview">
      <div className="landing-preview-topbar">
        <div className="landing-window-dots"><i /><i /><i /></div>
        <div className="landing-preview-address"><span /> virverse.dev / playground</div>
        <span className="landing-preview-avatar">VV</span>
      </div>
      <div className="landing-preview-body">
        <aside className="landing-preview-sidebar" aria-hidden="true">
          <div className="landing-preview-brand"><img src="/brand-mark.png" alt="" /><span>VirVerse</span></div>
          <div className="landing-preview-workspace"><span>&lt;/&gt;</span><b>Your workspace</b><small>Keep your momentum</small></div>
          <div className="landing-preview-nav landing-preview-nav-active"><Icon d={icons.dashboard} /> Dashboard</div>
          <div className="landing-preview-nav"><Icon d={icons.code} /> C Programming</div>
          <div className="landing-preview-nav landing-preview-nav-nested">Topics</div>
          <div className="landing-preview-nav landing-preview-nav-nested">Practice Problems</div>
          <div className="landing-preview-nav"><Icon d={icons.globe} /> Web Development</div>
          <div className="landing-preview-nav"><Icon d={icons.tasks} /> My Tasks</div>
        </aside>
        <div className="landing-preview-content">
          <div className="landing-preview-greeting">
            <div><small>YOUR LEARNING SPACE</small><strong>Welcome back, learner <span>✦</span></strong><p>Ready to make something today?</p></div>
            <span className="landing-preview-continue">Continue learning <Icon d={icons.arrow} /></span>
          </div>
          <div className="landing-preview-stats">
            <div><small>Questions</small><b>Explore</b><span className="landing-preview-bar landing-preview-bar-purple" /></div>
            <div><small>Your progress</small><b>Keep going</b><span className="landing-preview-bar landing-preview-bar-blue" /></div>
            <div><small>Next up</small><b>C Basics</b><span className="landing-preview-bar landing-preview-bar-cyan" /></div>
          </div>
          <div className="landing-preview-editor">
            <div className="landing-preview-editor-head"><span><i /> main.c</span><small>C11 · GCC</small></div>
            <pre><code><em>#include</em> <b>&lt;stdio.h&gt;</b>{'\n\n'}<strong>int</strong> main() {'{'}{'\n'}  printf(<u>&quot;Hello, VirVerse!&quot;</u>);{'\n'}  <strong>return</strong> 0;{'\n'}{'}'}</code></pre>
            <div className="landing-preview-run"><span>▶</span> Run Code <kbd>⌘ + Enter</kbd></div>
          </div>
        </div>
      </div>
      <div className="landing-preview-glow" aria-hidden="true" />
    </div>
  )
}

function DashboardShot() {
  return (
    <div className="landing-shot-window landing-shot-dashboard" aria-hidden="true">
      <div className="landing-shot-toolbar"><span /><b>VirVerse</b><i>⌕</i><i>◐</i><i>VV</i></div>
      <div className="landing-shot-layout">
        <div className="landing-shot-sidebar"><b>VV <span>VirVerse</span></b><i className="selected">⌂　Dashboard</i><i>〈〉　C Programming</i><i className="nested">Topics</i><i className="nested">Practice Problems</i><i>▣　Web Development</i><i>◉　My Tasks</i><i>◷　Submissions</i><small>LEARNER PROFILE</small><strong>DL　Demo Learner</strong></div>
        <div className="landing-shot-main">
          <div className="landing-shot-welcome"><small>YOUR LEARNING SPACE</small><b>Welcome back, Demo 👋</b><span>Keep learning, keep coding. You're on the right track!</span><em>Continue learning　→</em></div>
          <div className="landing-shot-stat-row"><div><small>Total questions</small><b>10</b><span>◉</span></div><div><small>Solved</small><b>4</b><span>✓</span></div><div><small>Remaining</small><b>6</b><span>◷</span></div></div>
          <div className="landing-shot-activity"><div><b>Recent submissions</b><small>View all →</small></div><span className="landing-shot-activity-icon">&lt;/&gt;</span><strong>Great progress!</strong><small>Your latest coding activity appears here.</small><i /></div>
        </div>
      </div>
    </div>
  )
}

function TopicsShot() {
  return (
    <div className="landing-shot-window landing-shot-topics" aria-hidden="true">
      <div className="landing-shot-toolbar"><span /><b>VirVerse</b><i>⌕</i><i>◐</i><i>VV</i></div>
      <div className="landing-shot-topic-hero"><small>C PROGRAMMING</small><b>C <span>Programming</span></b><p>Build a strong foundation, one topic at a time.</p><div><i><span>35%</span></i><small>4 of 17 topics explored</small></div></div>
      <div className="landing-shot-topic-grid">
        {[
          ['01', 'C Basics & Hello World', 'In progress', '</>'],
          ['02', 'Variables & Data Types', 'Ready to start', 'int'],
          ['03', 'Input & Output', 'Ready to start', 'I/O'],
          ['04', 'Operators', 'Locked', '+'],
        ].map(([number, title, status, mark]) => (
          <div className="landing-shot-topic-card" key={number}><i>{number}</i><span>{mark}</span><small>{status}</small><b>{title}</b><em><span /></em></div>
        ))}
      </div>
    </div>
  )
}

function PlaygroundShot() {
  return (
    <div className="landing-shot-window landing-shot-playground" aria-hidden="true">
      <div className="landing-shot-toolbar"><span /><b>VirVerse</b><small>C PLAYGROUND</small><i>Copy</i><i>Reset</i></div>
      <div className="landing-shot-code-head"><b>▤　main.c <span>●</span></b><small>C11 · GCC</small></div>
      <div className="landing-shot-code">
        <span>1</span><em>#include</em> <strong>&lt;stdio.h&gt;</strong>
        <span>2</span>
        <span>3</span><b>int</b> main() {'{'}
        <span>4</span><i>　printf(</i><u>&quot;Hello, VirVerse!&quot;</u><i>);</i>
        <span>5</span><b>　return</b> 0;
        <span>6</span>{'}'}
      </div>
      <div className="landing-shot-run">▶　Run Code <small>⌘ + Enter</small></div>
      <div className="landing-shot-terminal"><b>⌁　Terminal</b><span>Run details</span><i>Ready</i><small>Run your program. Output appears here when requested.</small></div>
    </div>
  )
}

export default function LandingPage() {
  const { user, loading, isSuperAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const destination = user ? (isSuperAdmin ? '/platform' : '/dashboard') : '/signup'
  const actionLabel = loading ? 'Checking session…' : user ? 'Go to Dashboard' : 'Get Started'

  return (
    <main className="landing-page">
      <header className="landing-header">
        <a className="landing-brand" href="#home" aria-label="VirVerse home">
          <img src="/brand-mark.png" alt="" />
          <span>VirVerse</span>
        </a>
        <nav id="landing-navigation" className={`landing-nav ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#home" className="is-current" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#roadmap" onClick={() => setMobileMenuOpen(false)}>Roadmap</a>
          <a href="#playground" onClick={() => setMobileMenuOpen(false)}>Playground</a>
          <Link to="/javascript" onClick={() => setMobileMenuOpen(false)}>JavaScript</Link>
          <Link to="/python" onClick={() => setMobileMenuOpen(false)}>Python</Link>
          <div className="landing-nav-actions">
            {!user && !loading && <Link className="landing-nav-login" to="/login" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>}
            <Link
              to={destination}
              className={`landing-nav-cta ${loading ? 'is-loading' : ''}`}
              onClick={(event) => {
                if (loading) {
                  event.preventDefault()
                  return
                }
                setMobileMenuOpen(false)
              }}
              aria-disabled={loading}
            >
              {actionLabel} {!loading && <Icon d={icons.arrow} className="size-3.5" />}
            </Link>
          </div>
        </nav>
        <div className="landing-header-actions">
          {!user && !loading && <Link className="landing-login-link" to="/login">Sign in</Link>}
          <Link
            to={destination}
            className={`landing-header-cta ${loading ? 'is-loading' : ''}`}
            onClick={(event) => loading && event.preventDefault()}
            aria-disabled={loading}
          >
            {actionLabel} {!loading && <Icon d={icons.arrow} className="size-3.5" />}
          </Link>
          <button
            type="button"
            className="landing-mobile-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Icon d={mobileMenuOpen ? icons.check : icons.menu} className="size-5" />
          </button>
        </div>
      </header>

      <div className="landing-content">
        <section className="landing-hero" id="home">
          <div className="landing-hero-copy">
            <div className="landing-live-pill"><span /> INTERACTIVE · PRACTICE · TRACK PROGRESS</div>
            <h1>Learn programming<br />by <span>doing.</span></h1>
            <p className="landing-hero-lede">
              A modern, interactive platform to learn C, JavaScript, and Python, practice problems, run code in your browser, and build real programming skills step by step.
            </p>
            <div className="landing-hero-actions">
              <Link
                to={destination}
                onClick={(event) => loading && event.preventDefault()}
                aria-disabled={loading}
                className={`landing-primary-cta ${loading ? 'is-loading' : ''}`}
              >
                {user ? 'Go to Dashboard' : loading ? 'Checking session…' : 'Start Learning'}
                {!loading && <Icon d={icons.arrow} className="size-4" />}
              </Link>
              <Link to="/playground" className="landing-secondary-cta"><Icon d={icons.code} className="size-4" /> Visit Playground</Link>
              <Link to="/javascript" className="landing-secondary-cta">Explore JavaScript <Icon d={icons.arrow} className="size-4" /></Link>
              <Link to="/python" className="landing-secondary-cta">Explore Python <Icon d={icons.arrow} className="size-4" /></Link>
            </div>
            <div className="landing-hero-highlights">
              <span><Icon d={icons.code} /> Code in your browser</span>
              <span><Icon d={icons.list} /> Learn step by step</span>
              <span><Icon d={icons.check} /> Practice and progress</span>
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-hero-scene" aria-hidden="true">
              <Suspense fallback={null}><LandingScene /></Suspense>
            </div>
            <div className="landing-visual-orbit landing-visual-orbit-one" />
            <div className="landing-visual-orbit landing-visual-orbit-two" />
            <span className="landing-floating-code landing-floating-code-one">&lt;/&gt;</span>
            <ProductPreview />
          </div>
          <a className="landing-scroll-cue" href="#inside-virverse">
            <span>SCROLL TO EXPLORE</span>
            <i><Icon d={icons.arrow} className="size-3.5" /></i>
          </a>
        </section>

        <section className="landing-showcase landing-section" id="inside-virverse">
          <div className="landing-section-heading">
            <div><p className="landing-section-kicker">✦ A LOOK INSIDE VIRVERSE</p><h2>More than lessons.<br /><span>Your whole learning workspace.</span></h2></div>
            <p>See what’s waiting for you: guided learning, a real coding workspace, and progress you can actually follow.</p>
          </div>
          <div className="landing-shot-grid">
            <article className="landing-shot-card">
              <div className="landing-shot-frame"><DashboardShot /></div>
              <div className="landing-shot-caption"><span>01</span><div><h3>Your learning dashboard</h3><p>Progress, next steps, and submissions in one place.</p></div><Icon d={icons.arrow} className="size-4" /></div>
            </article>
            <article className="landing-shot-card">
              <div className="landing-shot-frame"><TopicsShot /></div>
              <div className="landing-shot-caption"><span>02</span><div><h3>A roadmap that makes sense</h3><p>Move from C fundamentals to more advanced topics.</p></div><Icon d={icons.arrow} className="size-4" /></div>
            </article>
            <article className="landing-shot-card">
              <div className="landing-shot-frame"><PlaygroundShot /></div>
              <div className="landing-shot-caption"><span>03</span><div><h3>Code right in your browser</h3><p>Write, run, and learn without a complicated setup.</p></div><Icon d={icons.arrow} className="size-4" /></div>
            </article>
          </div>
        </section>

        <section className="landing-features landing-section" id="features">
          <div className="landing-section-heading">
            <div><p className="landing-section-kicker">✦ FEATURES</p><h2>Everything you need to<br /><span>master programming.</span></h2></div>
            <p>Built for learners who prefer hands-on practice. From an in-browser editor to structured topics and real problems, the tools to grow your skills are right here.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map((feature) => (
              <article className={`landing-feature-card accent-${feature.accent}`} key={feature.title}>
                <span className="landing-feature-icon"><Icon d={feature.icon} className="size-5" /></span>
                <p>{feature.tag}</p>
                <h3>{feature.title}</h3>
                <span className="landing-feature-description">{feature.description}</span>
                {feature.title === 'Interactive Playground' && (
                  <Link to="/playground" className="landing-feature-link">Open Playground <Icon d={icons.arrow} className="size-3.5" /></Link>
                )}
                {feature.title === 'Practice Problems' && (
                  <Link to="/practice" className="landing-feature-link">Browse Problems <Icon d={icons.arrow} className="size-3.5" /></Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="landing-roadmap landing-section" id="roadmap">
          <div className="landing-section-heading">
            <div><p className="landing-section-kicker">✦ LEARNING ROADMAP</p><h2>From zero to <span>confident coder.</span></h2></div>
            <p>A clear and structured path to take you from the basics to advanced programming concepts.</p>
          </div>
          <div className="landing-roadmap-track">
            {roadmap.map((step, index) => (
              <article className="landing-roadmap-step" key={step.number}>
                <div className="landing-roadmap-node"><span>{step.number}</span><Icon d={step.icon} className="size-4" /></div>
                {index < roadmap.length - 1 && <span className="landing-roadmap-connector" />}
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
          <div className="landing-roadmap-links">
            <Link to="/tasks">Explore C topics <Icon d={icons.arrow} className="size-3.5" /></Link>
            <Link to="/web-development/html">Explore web development <Icon d={icons.arrow} className="size-3.5" /></Link>
          </div>
        </section>

        <section className="landing-playground-section landing-section" id="playground">
          <div className="landing-playground-copy">
            <p className="landing-section-kicker">✦ TRY IT YOURSELF</p>
            <h2>Real coding experience<br />in your browser.</h2>
            <p>No setup. No installation. Just open your workspace and start coding.</p>
            <div className="landing-playground-actions">
              <Link to="/playground" className="landing-primary-cta">Open C Playground <Icon d={icons.arrow} className="size-4" /></Link>
              <Link to="/javascript/playground" className="landing-secondary-cta">Open JavaScript Playground</Link>
              <Link to="/python/playground" className="landing-secondary-cta">Open Python Playground</Link>
              <Link to="/practice" className="landing-secondary-cta">View Practice Problems</Link>
            </div>
          </div>
          <div className="landing-playground-demo" aria-hidden="true">
            <div className="landing-demo-top"><span><i /><i /><i /></span><b>main.c</b><small>C11 · GCC</small></div>
            <pre><code><em>#include</em> <b>&lt;stdio.h&gt;</b>{'\n\n'}<strong>int</strong> main() {'{'}{'\n'}  printf(<u>&quot;Hello, world!&quot;</u>);{'\n'}  <strong>return</strong> 0;{'\n'}{'}'}</code></pre>
            <div className="landing-demo-button"><span>▶</span> Run Code</div>
            <div className="landing-demo-terminal"><span>●</span> Interactive terminal <b>Ready</b></div>
          </div>
        </section>

        <section className="landing-final-cta">
          <div className="landing-cta-decoration" aria-hidden="true">&lt;/&gt;</div>
          <div><p className="landing-section-kicker">✦ YOUR JOURNEY STARTS HERE</p><h2>Ready to start your coding journey?</h2><p>Join VirVerse and take your first step toward building real programming skills.</p></div>
          <Link to={destination} onClick={(event) => loading && event.preventDefault()} aria-disabled={loading} className={`landing-primary-cta ${loading ? 'is-loading' : ''}`}>
            {actionLabel} {!loading && <Icon d={icons.arrow} className="size-4" />}
          </Link>
        </section>
      </div>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home"><img src="/brand-mark.png" alt="" /><span>VirVerse</span></a>
        <p>Learn by doing. Build with confidence.</p>
        <nav aria-label="Footer navigation"><a href="#features">Features</a><a href="#roadmap">Roadmap</a><Link to="/login">Sign in</Link><Link to="/signup">Sign up</Link></nav>
        <span className="landing-copyright">© {YEAR} VirVerse</span>
      </footer>
    </main>
  )
}
