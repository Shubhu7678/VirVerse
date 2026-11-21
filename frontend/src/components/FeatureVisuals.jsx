/* Small CSS-animated illustrations used by the bento feature grid. Each one loops on its own. */

export function PlaygroundVisual() {
  return (
    <div className="fv fv-play" aria-hidden="true">
      <div className="fv-bar"><i /><i /><i /><span>main.c</span><b>▶ Run</b></div>
      <pre><code>
        <span className="fv-l" style={{ '--n': 0 }}><em>int</em> main() {'{'}</span>
        <span className="fv-l" style={{ '--n': 1 }}>{'  '}printf(<u>&quot;Hello!&quot;</u>);</span>
        <span className="fv-l" style={{ '--n': 2 }}>{'  '}<em>return</em> 0;<i className="fv-caret" /></span>
        <span className="fv-l" style={{ '--n': 3 }}>{'}'}</span>
      </code></pre>
      <div className="fv-out"><span>▍</span> Hello!</div>
    </div>
  )
}

export function RoadmapVisual() {
  const topics = ['Hello World', 'Variables', 'Loops', 'Arrays', 'Pointers']
  return (
    <ol className="fv fv-road" aria-hidden="true">
      {topics.map((t, i) => (
        <li key={t} style={{ '--n': i }}><i /><span>{t}</span></li>
      ))}
    </ol>
  )
}

export function PracticeVisual() {
  return (
    <div className="fv fv-tests" aria-hidden="true">
      {['Test 1', 'Test 2', 'Test 3', 'Test 4'].map((t, i) => (
        <div key={t} style={{ '--n': i }}><span>{t}</span><b>✓ Passed</b></div>
      ))}
      <div className="fv-accepted">Accepted</div>
    </div>
  )
}

export function ProgressVisual() {
  const levels = [0, 2, 1, 3, 0, 1, 2, 3, 3, 1, 0, 2, 3, 2, 1, 3, 3, 2, 1, 0, 3, 2, 3, 3, 1, 2, 3, 3]
  return (
    <div className="fv fv-heat" aria-hidden="true">
      <div className="fv-grid">
        {levels.map((l, i) => <i key={i} data-l={l} style={{ '--n': i }} />)}
      </div>
      <p><b>12</b> day streak</p>
    </div>
  )
}

export function SandboxVisual() {
  return (
    <div className="fv fv-box" aria-hidden="true">
      <span className="fv-ring r1" /><span className="fv-ring r2" />
      <div className="fv-chip"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg> network off</div>
    </div>
  )
}

export function ClassroomVisual() {
  const names = ['AS', 'MK', 'RJ', 'LP', 'DN']
  return (
    <div className="fv fv-class" aria-hidden="true">
      <div className="fv-avatars">{names.map((n, i) => <span key={n} style={{ '--n': i }}>{n}</span>)}</div>
      {[78, 52, 31].map((w, i) => <div className="fv-row" key={w} style={{ '--n': i }}><span>Section {String.fromCharCode(65 + i)}</span><em><i style={{ '--w': `${w}%` }} /></em></div>)}
    </div>
  )
}
