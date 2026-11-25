import { useEffect, useRef, useState } from 'react'
import { Check, Pause, Play } from 'lucide-react'
import { HighlightedCode } from './ide/ConceptSection'
import '../components/ide/documentation.css'

const CODE = 'first, second = input().split()\nprint(second, first)'

const STEPS = [
  { title: 'Pick a language', text: 'Choose C, JavaScript or Python. Every language starts with 10 free questions.', title2: 'Learning paths', ms: 4200 },
  { title: 'Read a short lesson', text: 'Each question has a beginner lesson: plain words, small examples, and what you will see.', title2: 'Python guide · Lesson 11', ms: 5200 },
  { title: 'Write your answer', text: 'Read the problem on the left and write code in a real editor on the right.', title2: 'Swap Two Values', ms: 6200 },
  { title: 'Run it instantly', text: 'Give it some input and see the output in the browser. Nothing to install.', title2: 'Swap Two Values', ms: 4800 },
  { title: 'Submit and earn points', text: 'Your code is checked against every test case. Solve questions to earn points and climb the leaderboard.', title2: 'Swap Two Values', ms: 5200 },
]

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return undefined
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function Pick() {
  const langs = [
    { key: 'C', name: 'C programming', note: '17 topics', on: false },
    { key: 'JS', name: 'JavaScript', note: 'Playground + practice', on: false },
    { key: 'Py', name: 'Python', note: 'Beginner guide + practice', on: true },
  ]
  return (
    <div className="lp-demo-pick">
      <p className="lp-demo-label">Choose where to start</p>
      <div className="lp-demo-langs">
        {langs.map((l) => (
          <div key={l.key} className={`lp-demo-lang ${l.on ? 'is-on' : ''}`}>
            <span className="lp-demo-glyph">{l.key}</span>
            <b>{l.name}</b>
            <small>{l.note}</small>
          </div>
        ))}
      </div>
      <ul className="lp-demo-topics">
        <li style={{ '--d': '600ms' }}><span>01</span> Python Basics <em>Open · 10 free questions</em></li>
        <li className="is-locked" style={{ '--d': '760ms' }}><span>02</span> Numbers and Operators <em>Locked</em></li>
        <li className="is-locked" style={{ '--d': '920ms' }}><span>03</span> Conditions and Logic <em>Locked</em></li>
      </ul>
      <div className="lp-demo-free"><Check className="size-4" aria-hidden="true" /> Your admin can unlock the rest when you are ready</div>
    </div>
  )
}

function Lesson() {
  return (
    <div className="lp-demo-lesson">
      <p className="lp-demo-label">Lesson 11 of 40 · Reordering values</p>
      <div className="lp-demo-plain"><small>In plain words</small>Variables are labelled boxes. Reordering means choosing which box to print first.</div>
      <div className="lp-demo-codebox">
        <pre><HighlightedCode code={'a, b = input().split()\nprint(b, a)'} language="python" /></pre>
        <div className="lp-demo-io">
          <div><small>You type</small><code>sun moon</code></div>
          <div><small>What you see</small><code className="is-ok">moon sun</code></div>
        </div>
      </div>
      <div className="lp-demo-quiz"><small>Quick check</small>What does print("a", "b") show?<span>a b ✓</span></div>
    </div>
  )
}

function Ide({ typed, showConsole }) {
  const shown = CODE.slice(0, typed)
  return (
    <div className="lp-demo-ide">
      <aside className="lp-demo-problem">
        <b>Swap Two Values</b>
        <span className="lp-demo-pill">Easy</span>
        <p><small>Task</small>Read two values and print them in reverse order.</p>
        <p><small>Example input</small><code>red blue</code></p>
        <p><small>Expected output</small><code>blue red</code></p>
      </aside>
      <div className="lp-demo-right">
        <div className="lp-demo-editor">
          <div className="lp-demo-tab">main.py</div>
          <pre><HighlightedCode code={shown || ' '} language="python" />{typed < CODE.length && <i className="lp-demo-caret" />}</pre>
        </div>
        <div className={`lp-demo-console ${showConsole ? 'is-open' : ''}`}>
          <div className="lp-demo-actions"><span className="is-run">▶ Run code</span><span>Submit</span></div>
          {showConsole && (
            <div className="lp-demo-out">
              <small>Input</small><code>red blue</code>
              <small>Output</small><code className="is-ok">blue red</code>
              <em>Exited with code 0</em>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Submit() {
  const cases = ['Case 1', 'Case 2', 'Hidden 1', 'Hidden 2']
  return (
    <div className="lp-demo-submit">
      <div className="lp-demo-accepted"><Check className="size-5" aria-hidden="true" /> Accepted <span>4 / 4 tests passed</span></div>
      <ul>
        {cases.map((c, i) => (
          <li key={c} style={{ '--d': `${i * 220}ms` }}><Check className="size-3.5" aria-hidden="true" /> {c} <span>Passed</span></li>
        ))}
      </ul>
      <div className="lp-demo-reward">
        <b>+10 points</b>
        <div className="lp-demo-board">
          <div><span>1</span> Maya <em>120</em></div>
          <div className="is-you"><span>2</span> You <em>110</em></div>
          <div><span>3</span> Arjun <em>90</em></div>
        </div>
      </div>
    </div>
  )
}

export default function ProductDemo() {
  const reduced = useReducedMotion()
  const rootRef = useRef(null)
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [typed, setTyped] = useState(0)
  const playing = !paused && visible && !reduced

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Move to the next scene after its time is up, looping forever while playing.
  useEffect(() => {
    if (!playing) return undefined
    const timer = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEPS[step].ms)
    return () => clearTimeout(timer)
  }, [playing, step])

  // Type the code out while the "write" scene is on screen; later scenes show all of it.
  useEffect(() => {
    if (step < 2 || reduced) {
      const reset = setTimeout(() => setTyped(step < 2 && !reduced ? 0 : CODE.length), 0)
      return () => clearTimeout(reset)
    }
    if (step > 2) return undefined
    if (!playing) return undefined
    const timer = setInterval(() => setTyped((t) => (t >= CODE.length ? t : t + 1)), 55)
    return () => clearInterval(timer)
  }, [step, playing, reduced])

  const goTo = (i) => {
    setStep(i)
    setTyped(i >= 3 ? CODE.length : 0)
  }
  const current = STEPS[step]

  return (
    <div className="lp-demo" ref={rootRef}>
      <ol className="lp-demo-steps">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button type="button" className={i === step ? 'is-active' : ''} aria-current={i === step ? 'step' : undefined} onClick={() => goTo(i)}>
              <span className="lp-demo-num">{i + 1}</span>
              <span className="lp-demo-copy"><b>{s.title}</b><small>{s.text}</small></span>
              {i === step && playing && <i className="lp-demo-progress" style={{ animationDuration: `${s.ms}ms` }} key={`${step}-${playing}`} />}
            </button>
          </li>
        ))}
      </ol>

      <div className="lp-demo-window" role="img" aria-label={`Animated preview, step ${step + 1} of ${STEPS.length}: ${current.title}`}>
        <div className="lp-mock-bar">
          <span className="lp-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="lp-mock-title">{current.title2}</span>
          <button type="button" className="lp-demo-play" onClick={() => setPaused((p) => !p)} aria-pressed={paused} aria-label={paused ? 'Play the preview' : 'Pause the preview'}>
            {paused || reduced ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
          </button>
        </div>
        <div className="lp-demo-stage" aria-hidden="true" key={step}>
          {step === 0 && <Pick />}
          {step === 1 && <Lesson />}
          {step === 2 && <Ide typed={typed} showConsole={false} />}
          {step === 3 && <Ide typed={CODE.length} showConsole />}
          {step === 4 && <Submit />}
        </div>
      </div>
    </div>
  )
}
