import { useRef, useState } from 'react'
import useInteractiveRun from '../hooks/useInteractiveRun'
import { useTheme } from '../context/ThemeContext'
import Button from '../components/Button'
import CodeEditor from '../components/ide/CodeEditor'
import ConsolePanel from '../components/ide/ConsolePanel'
import ResizeHandle from '../components/ide/ResizeHandle'

const DEFAULT_CODE = `#include <stdio.h>

int main() {
    printf("Hello VirVerse!\\n");
    return 0;
}
`

const CODE_KEY = 'virvese:playground:code'

const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

const toolButton =
  'rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'

export default function Playground() {
  const [code, setCode] = useState(() => localStorage.getItem(CODE_KEY) ?? DEFAULT_CODE)
  const [tab, setTab] = useState('terminal')
  const { theme, toggle: toggleTheme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [consoleSize, setConsoleSize] = useState(0.4)
  const { run, execute, sendInput, stop, clear } = useInteractiveRun()
  const layoutRef = useRef(null)

  const updateCode = (value) => {
    setCode(value)
    localStorage.setItem(CODE_KEY, value)
  }

  const handleRun = () => {
    setTab('terminal')
    execute({ code })
  }

  const resetCode = () => {
    if (!window.confirm('Reset the playground to the default program? Your current code will be lost.')) return
    updateCode(DEFAULT_CODE)
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
    const url = URL.createObjectURL(new Blob([code], { type: 'text/x-csrc' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'main.c'
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearOutput = () => {
    clear()
    setTab('terminal')
  }

  return (
    // Cancel the layout's page padding so the playground uses the full content area.
    <div className="-m-4 min-h-[calc(100vh-4rem)] bg-slate-100 sm:-m-6">
      <div
        ref={layoutRef}
        style={{ '--console': `${consoleSize * 100}%` }}
        className="flex flex-col bg-slate-100 lg:h-[calc(100vh-4rem)]"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 font-mono text-lg font-bold text-white shadow-sm">C</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900">C Playground</h1>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700">INTERACTIVE</span>
              </div>
              <p className="truncate text-xs text-slate-500">Write, run, and test C programs in a secure sandbox</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={copyCode} className={toolButton}>
              {copied ? '✓ Copied' : 'Copy Code'}
            </button>
            <button onClick={downloadCode} className={toolButton}>
              Download .c
            </button>
            <button onClick={resetCode} className={toolButton}>
              Reset Code
            </button>
            <button onClick={toggleTheme} className={toolButton}>
              {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        <div className="mx-3 mt-3 flex h-[420px] min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mx-5 lg:h-auto lg:min-h-[200px] lg:flex-1">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2">
            <span className="font-mono text-xs font-medium text-slate-600">main.c</span>
            <span className="text-[11px] text-slate-400">C11 · GCC</span>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor value={code} onChange={updateCode} theme={theme} onRun={handleRun} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 px-3 py-3 sm:px-5">
          <Button type="button" onClick={handleRun} loading={run.running} disabled={run.running} className="w-auto!">
            {run.running ? 'Running…' : '▶ Run Code'}
          </Button>
          {run.running && (
            <button type="button" onClick={stop} className={`${toolButton} border-red-200 text-red-600 hover:bg-red-50`}>
              Stop
            </button>
          )}
          <button onClick={clearOutput} disabled={run.running} className={`${toolButton} rounded-lg`}>
            Clear Output
          </button>
          <span className="ml-auto hidden text-xs text-slate-500 sm:inline">{isMac ? '⌘' : 'Ctrl'} + Enter to run</span>
        </div>

        <ResizeHandle
          direction="vertical"
          containerRef={layoutRef}
          onChange={(r) => setConsoleSize(clamp(r, 0.15, 0.7))}
        />

        <div className="mx-3 mb-3 h-80 shrink-0 sm:mx-5 lg:h-(--console)">
          <ConsolePanel
            tab={tab}
            setTab={setTab}
            run={run}
            showTests={false}
            interactive
            sendInput={sendInput}
          />
        </div>
      </div>
    </div>
  )
}
