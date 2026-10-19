import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import './monacoSetup'

const options = {
  fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
  minimap: { enabled: false },
  lineNumbers: 'on',
  tabSize: 4,
  insertSpaces: true,
  autoIndent: 'full',
  formatOnType: true,
  matchBrackets: 'always',
  bracketPairColorization: { enabled: true },
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 12 },
  renderLineHighlight: 'line',
  smoothScrolling: true,
}

export default function CodeEditor({ value, onChange, theme, onRun, fontSize = 14, wordWrap = false }) {
  // Monaco commands are registered once, so keep the latest handler in a ref.
  const runRef = useRef(onRun)
  useEffect(() => {
    runRef.current = onRun
  }, [onRun])

  return (
    <Editor
      height="100%"
      language="c"
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      options={{ ...options, fontSize, wordWrap: wordWrap ? 'on' : 'off' }}
      loading={<div className="p-4 text-sm text-slate-500">Loading editor…</div>}
      onMount={(editor, monaco) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current())
        editor.focus()
      }}
    />
  )
}
