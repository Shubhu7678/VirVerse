import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Icon, { icons } from './Icon'
import '../pages/login.css'

const PathScene = lazy(() => import('./PathScene'))
const YEAR = new Date().getFullYear()

const points = [
  'Run C, JavaScript and Python in your browser',
  'Follow guided roadmaps and practice problems',
  'Track every submission and pick up where you left off',
]

/** Shared frame for the sign in and sign up screens. */
export default function AuthShell({ title, subtitle, footer, children }) {
  const { theme, toggle } = useTheme()
  return (
    <div className="au">
      <aside className="au-side" aria-label="About VirVerse">
        <Suspense fallback={null}><PathScene className="au-scene" scale={0.55} /></Suspense>
        <Link to="/" className="au-brand" aria-label="VirVerse home"><img src="/brand-mark.svg" alt="" /><span>VirVerse</span></Link>
        <div className="au-side-body">
          <h2>Learn to code by <span>writing real code.</span></h2>
          <ul>
            {points.map((p) => <li key={p}><Icon d={icons.check} className="size-4" /> {p}</li>)}
          </ul>
          <div className="au-code" aria-hidden="true">
            <div className="au-code-bar"><i /><i /><i /><span>main.c</span></div>
            <pre><code><b>int</b> main() {'{'}{'\n'}{'  '}printf(<u>&quot;Hello, VirVerse!&quot;</u>);{'\n'}{'  '}<b>return</b> 0;{'\n'}{'}'}</code></pre>
          </div>
        </div>
        <p className="au-copy">© {YEAR} VirVerse</p>
      </aside>

      <main className="au-main">
        <div className="au-top">
          <Link to="/" className="au-back"><Icon d={icons.back} className="size-4" /> Back to home</Link>
          <button type="button" className="au-icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            <Icon d={theme === 'dark' ? icons.sun : icons.moon} className="size-4" />
          </button>
        </div>
        <div className="au-card">
          <Link to="/" className="au-brand au-brand-mobile" aria-label="VirVerse home"><img src="/brand-mark.svg" alt="" /><span>VirVerse</span></Link>
          <h1>{title}</h1>
          <p className="au-sub">{subtitle}</p>
          {children}
        </div>
        <p className="au-foot">{footer}</p>
      </main>
    </div>
  )
}
