import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useInteractiveRun from '../hooks/useInteractiveRun'
import { useTheme } from '../context/ThemeContext'
import { runCode } from '../api/execute'
import { getErrorMessage } from '../api/client'
import Button from '../components/Button'
import CodeEditor from '../components/ide/CodeEditor'
import ConsolePanel from '../components/ide/ConsolePanel'
import ResizeHandle from '../components/ide/ResizeHandle'
import Icon, { icons } from '../components/Icon'
import './playground.css'

const DEFAULT_C_CODE = `#include <stdio.h>

int main() {
    printf("Hello VirVerse!\\n");
    return 0;
}
`

const DEFAULT_JAVASCRIPT_CODE = `console.log("Hello VirVerse!")
`

const DEFAULT_PYTHON_CODE = `print("Hello VirVerse!")
`

const codeKey = (language) => `virvese:playground:${language}:code`
const defaultCode = (language) => language === 'javascript'
  ? DEFAULT_JAVASCRIPT_CODE
  : language === 'python' ? DEFAULT_PYTHON_CODE : DEFAULT_C_CODE
const loadCode = (language) =>
  localStorage.getItem(codeKey(language))
  ?? (language === 'c' ? localStorage.getItem('virvese:playground:code') : null)
  ?? defaultCode(language)

const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

export default function Playground({ language = 'c' }) {
  const navigate = useNavigate()
  const [code, setCode] = useState(() => loadCode(language))
  const [stdin, setStdin] = useState('')
  const [tab, setTab] = useState(language === 'c' ? 'terminal' : 'input')
  const { theme, toggle: toggleTheme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [consoleSize, setConsoleSize] = useState(0.4)
  const { run, execute, sendInput, stop, clear } = useInteractiveRun()
  const [scriptRun, setScriptRun] = useState({ running: false, runError: '', result: null })
  const layoutRef = useRef(null)
  const isJavaScript = language === 'javascript'
  const isScript = language !== 'c'
  const currentRun = isScript ? scriptRun : run

  const updateCode = (value) => {
    setCode(value)
    localStorage.setItem(codeKey(language), value)
    if (language === 'c') localStorage.setItem('virvese:playground:code', value)
  }

  const handleRun = async () => {
    if (isScript) {
      if (scriptRun.running) return
      setTab('output')
      setScriptRun({ running: true, runError: '', result: null })
      try {
        const result = await runCode({ code, stdin, language })
        setScriptRun({ running: false, runError: '', result })
      } catch (error) {
        setScriptRun({
          running: false,
          runError: getErrorMessage(error, `Could not run your ${language} program.`),
          result: null,
        })
      }
      return
    }
    setTab('terminal')
    execute({ code })
  }

  const resetCode = () => {
    if (!window.confirm('Reset the playground to the default program? Your current code will be lost.')) return
    updateCode(defaultCode(language))
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.alert('Could not copy automatically. Select the code and copy it manually.')
    }
  }

  const downloadCode = () => {
    const extension = isJavaScript ? 'js' : language === 'python' ? 'py' : 'c'
    const contentType = isJavaScript ? 'text/javascript' : language === 'python' ? 'text/x-python' : 'text/x-csrc'
    const url = URL.createObjectURL(new Blob([code], { type: contentType }))
    const link = document.createElement('a')
    link.href = url
    link.download = `main.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearOutput = () => {
    if (isScript) {
      setScriptRun({ running: false, runError: '', result: null })
      setTab('input')
      return
    }
    clear()
    setTab('terminal')
  }

  return (
    // Cancel the layout's page padding so the playground uses the full content area.
    <div className="playground-page -m-4 min-h-[calc(100vh-4rem)] sm:-m-6">
      <div
        ref={layoutRef}
        style={{ '--console': `${consoleSize * 100}%` }}
        className="playground-layout flex flex-col lg:h-[calc(100vh-4rem)]"
      >
        <div className="playground-header flex shrink-0 flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <p className="playground-eyebrow">{isScript ? `${language.toUpperCase()} PLAYGROUND` : 'C PLAYGROUND'}</p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="playground-title">{isScript ? `${isJavaScript ? 'JavaScript' : 'Python'} Playground` : 'C Playground'}</h1>
                <span className="playground-interactive">{isJavaScript ? 'NODE.JS' : isScript ? 'PYTHON 3' : 'INTERACTIVE'}</span>
              </div>
              <p className="playground-subtitle">
                {isScript
                  ? `Experiment with ${isJavaScript ? 'JavaScript and Node.js' : 'Python'} in a secure sandbox`
                  : 'Write, run, and test C programs in a secure sandbox'}
              </p>
            </div>
          </div>
          <div className="playground-tools">
            <label className="playground-tool-button">
              Language
              <select
                aria-label="Playground language"
                value={language}
                onChange={(event) => navigate(event.target.value === 'c' ? '/playground' : `/${event.target.value}/playground`)}
                className="bg-transparent font-semibold outline-none"
              >
                <option value="c">C</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </label>
            <button onClick={copyCode} className="playground-tool-button">
              <Icon d={icons.copy} className="size-4" />
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <button onClick={downloadCode} className="playground-tool-button">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
              </svg>
              Download .{isJavaScript ? 'js' : language === 'python' ? 'py' : 'c'}
            </button>
            <button onClick={resetCode} className="playground-tool-button">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 11a9 9 0 0 1 15.4-6.4L21 7M21 3v4h-4M21 13a9 9 0 0 1-15.4 6.4L3 17m0 4v-4h4" />
              </svg>
              Reset Code
            </button>
            <button onClick={toggleTheme} className="playground-tool-button playground-theme-button">
              <Icon d={theme === 'dark' ? icons.sun : icons.moon} className="size-4" />
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        <div className="playground-editor-card mx-3 mt-3 flex h-[420px] min-h-[320px] flex-col overflow-hidden rounded-2xl sm:mx-5 lg:h-auto lg:min-h-[200px] lg:flex-1">
          <div className="playground-editor-bar flex shrink-0 items-center justify-between px-4 py-2">
            <span className="playground-file-tab"><span aria-hidden="true">▤</span> main.{isJavaScript ? 'js' : language === 'python' ? 'py' : 'c'} <i /></span>
            <span className="playground-editor-language">{isJavaScript ? 'Node.js' : language === 'python' ? 'Python 3' : 'C11 · GCC'}</span>
          </div>
          <div className="playground-editor-host min-h-0 flex-1">
            <CodeEditor
              value={code}
              onChange={updateCode}
              theme={theme}
              onRun={handleRun}
              onCursorPosition={setCursorPosition}
              language={language}
            />
          </div>
          <div className="playground-editor-status">
            <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
            <span>Spaces: 4</span>
            <span>UTF-8</span>
            <span>{isJavaScript ? 'JavaScript' : language === 'python' ? 'Python' : 'C'}</span>
          </div>
        </div>

        <div className="playground-action-bar flex shrink-0 flex-wrap items-center gap-3 px-3 py-3 sm:px-5">
          <Button type="button" onClick={handleRun} loading={currentRun.running} disabled={currentRun.running} className="playground-run-button w-auto!">
            {!currentRun.running && <span aria-hidden="true">▶</span>}
            {currentRun.running ? 'Running…' : 'Run Code'}
            {!currentRun.running && <kbd>{isMac ? '⌘' : 'Ctrl'} + Enter</kbd>}
          </Button>
          {!isScript && run.running && (
            <button type="button" onClick={stop} className="playground-tool-button playground-stop-button">
              Stop
            </button>
          )}
          <span className="playground-shortcut ml-auto hidden sm:inline">Press {isMac ? '⌘' : 'Ctrl'} + Enter to run</span>
        </div>

        <ResizeHandle
          direction="vertical"
          containerRef={layoutRef}
          onChange={(r) => setConsoleSize(clamp(r, 0.15, 0.7))}
        />

        <div className="playground-console mx-3 mb-3 h-80 shrink-0 sm:mx-5 lg:h-(--console)">
          <ConsolePanel
            tab={tab}
            setTab={setTab}
            run={currentRun}
            stdin={stdin}
            setStdin={setStdin}
            showTests={false}
            interactive={!isScript}
            sendInput={isScript ? undefined : sendInput}
            onClear={clearOutput}
            clearDisabled={currentRun.running}
          />
        </div>
      </div>
    </div>
  )
}
