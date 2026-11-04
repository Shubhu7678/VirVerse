import { useState } from 'react'

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'def', 'print', 'input', 'int', 'float', 'import', 'from', 'in', 'range',
  'True', 'False', 'None', 'true', 'false', 'null', 'new', 'class', 'void',
  'char', 'double', 'return', 'include', 'scanf', 'printf',
])

function HighlightedCode({ code, language }) {
  const tokenPattern = /\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|var|function|return|if|else|for|while|def|print|input|int|float|import|from|in|range|True|False|None|true|false|null|new|class|void|char|double|include|scanf|printf)\b|\b\d+(?:\.\d+)?\b/g
  const parts = []
  let cursor = 0

  for (const [index, match] of [...code.matchAll(tokenPattern)].entries()) {
    const token = match[0]
    if (match.index > cursor) parts.push(code.slice(cursor, match.index))

    const isComment = token.startsWith('//') || (language === 'python' && token.startsWith('#'))
    const isString = token.startsWith('"') || token.startsWith("'")
    const className = isComment
      ? 'docs-token-comment'
      : isString
        ? 'docs-token-string'
        : /^\d/.test(token)
          ? 'docs-token-number'
          : KEYWORDS.has(token)
            ? 'docs-token-keyword'
            : ''

    parts.push(<span key={`${index}-${token}`} className={className}>{token}</span>)
    cursor = match.index + token.length
  }
  if (cursor < code.length) parts.push(code.slice(cursor))

  return <code>{parts}</code>
}

export default function ConceptSection({ concept, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = `docs-concept-${concept.id}`

  return (
    <section className={`docs-concept ${open ? 'is-open' : ''}`}>
      <h3>
        <button
          type="button"
          className="docs-concept-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={contentId}
        >
          <span className="docs-concept-number">{String(concept.index).padStart(2, '0')}</span>
          <span className="docs-concept-heading">
            <strong>{concept.title}</strong>
            <span>{concept.summary}</span>
          </span>
          <svg
            aria-hidden="true"
            className="docs-chevron"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>
      </h3>

      {open && (
        <div className="docs-concept-content" id={contentId}>
          <p className="docs-explanation">{concept.explanation}</p>

          <div className="docs-code-card">
            <div className="docs-code-label">Syntax</div>
            <pre><HighlightedCode code={concept.syntax} language={concept.language} /></pre>
          </div>

          <div className="docs-code-card docs-example-card">
            <div className="docs-code-label">Quick example</div>
            {concept.input && (
              <div className="docs-example-input">
                <span>Input</span>
                <code>{concept.input}</code>
              </div>
            )}
            <pre><HighlightedCode code={concept.example} language={concept.language} /></pre>
            <div className="docs-output">
              <span>Expected output</span>
              <pre>{concept.expectedOutput}</pre>
            </div>
          </div>

          <div className="docs-note-group">
            <h4><span aria-hidden="true">!</span> Common mistakes</h4>
            <ul>
              {concept.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
            </ul>
          </div>

          <div className="docs-note-group docs-tip-group">
            <h4><span aria-hidden="true">✦</span> Helpful tips</h4>
            <ul>
              {concept.tips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
