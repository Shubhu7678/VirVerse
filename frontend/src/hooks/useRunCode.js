import { useCallback, useRef, useState } from 'react'
import { runCode } from '../api/execute'
import { getErrorMessage } from '../api/client'

// Runs code through /api/execute, one request at a time. Used by the playground.
export default function useRunCode() {
  const [run, setRun] = useState({ running: false, runError: '', result: null })
  const busy = useRef(false)

  const execute = useCallback(async ({ code, stdin }) => {
    if (busy.current) return
    busy.current = true
    setRun({ running: true, runError: '', result: null })
    try {
      const result = await runCode({ code, stdin })
      setRun({ running: false, runError: '', result })
    } catch (err) {
      setRun({ running: false, runError: getErrorMessage(err, 'Could not run your code'), result: null })
    } finally {
      busy.current = false
    }
  }, [])

  const clear = useCallback(() => {
    if (!busy.current) setRun({ running: false, runError: '', result: null })
  }, [])

  return { run, execute, clear }
}
