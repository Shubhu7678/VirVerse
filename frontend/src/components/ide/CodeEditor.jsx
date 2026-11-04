import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import './monacoSetup'

const options = {
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, monospace",
  minimap: { enabled: false },
  lineNumbers: 'on',
  tabSize: 4,
  insertSpaces: true,
  autoIndent: 'full',
  formatOnType: false,
  matchBrackets: 'always',
  bracketPairColorization: { enabled: true },
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  autoSurround: 'languageDefined',
  quickSuggestions: { other: true, comments: false, strings: false },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 12 },
  renderLineHighlight: 'all',
  smoothScrolling: true,
}

export default function CodeEditor({
  value, onChange, theme, editorTheme = 'app', onRun, onCursorPosition, onEditorMount,
  language = 'c', fontSize = 14, fontLigatures = false, wordWrap = false,
}) {
  // Monaco commands are registered once, so keep the latest handler in a ref.
  const runRef = useRef(onRun)
  const cursorRef = useRef(onCursorPosition)
  useEffect(() => {
    runRef.current = onRun
  }, [onRun])
  useEffect(() => {
    cursorRef.current = onCursorPosition
  }, [onCursorPosition])

  return (
    <Editor
      height="100%"
      language={language}
      theme={editorTheme === 'app'
        ? (theme === 'dark'
          ? (language === 'python' ? 'virverse-vscode-dark' : 'vs-dark')
          : 'vs')
        : editorTheme}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      options={{ ...options, fontSize, fontLigatures, wordWrap: wordWrap ? 'on' : 'off' }}
      loading={<div className="p-4 text-sm text-slate-500">Loading editor…</div>}
      onMount={(editor, monaco) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current())
        editor.onDidChangeCursorPosition(({ position }) => {
          cursorRef.current?.({ line: position.lineNumber, column: position.column })
        })
        const position = editor.getPosition()
        if (position) cursorRef.current?.({ line: position.lineNumber, column: position.column })
        onEditorMount?.(editor)
        editor.focus()
      }}
    />
  )
}
