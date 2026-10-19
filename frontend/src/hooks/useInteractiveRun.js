import { useCallback, useEffect, useRef, useState } from 'react'

const emptyRun = () => ({
  running: false,
  ready: false,
  runError: '',
  result: null,
  events: [],
})

export default function useInteractiveRun() {
  const [run, setRun] = useState(emptyRun)
  const socketRef = useRef(null)
  const completeRef = useRef(false)

  useEffect(() => () => {
    socketRef.current?.close()
  }, [])

  const execute = useCallback(({ code }) => {
    if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) return

    completeRef.current = false
    setRun({ ...emptyRun(), running: true })
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/execute/interactive`)
    socketRef.current = socket

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'start', code }))
    })
    socket.addEventListener('message', (event) => {
      let message
      try {
        message = JSON.parse(event.data)
      } catch {
        completeRef.current = true
        setRun((current) => ({ ...current, running: false, runError: 'Received an invalid response from the code runner.' }))
        socket.close()
        return
      }

      if (message.type === 'compile') {
        setRun((current) => ({
          ...current,
          compileOutput: message.output,
          ...(message.ok ? {} : { result: { status: 'Compilation Error', compileOutput: message.output } }),
        }))
      } else if (message.type === 'ready') {
        setRun((current) => ({ ...current, ready: true }))
      } else if (message.type === 'output') {
        setRun((current) => ({
          ...current,
          events: [...current.events, { stream: message.stream, data: message.data }],
        }))
      } else if (message.type === 'exit') {
        completeRef.current = true
        setRun((current) => ({
          ...current,
          running: false,
          ready: false,
          result: {
            ...current.result,
            status: message.status,
            exitCode: message.exitCode,
            timeMs: message.timeMs,
            stdout: current.events.filter((item) => item.stream === 'stdout').map((item) => item.data).join(''),
            stderr: current.events.filter((item) => item.stream === 'stderr').map((item) => item.data).join(''),
            compileOutput: current.compileOutput,
          },
        }))
      } else if (message.type === 'error') {
        completeRef.current = true
        setRun((current) => ({ ...current, running: false, ready: false, runError: message.message }))
      }
    })
    socket.addEventListener('error', () => {
      if (!completeRef.current) {
        completeRef.current = true
        setRun((current) => ({
          ...current,
          running: false,
          ready: false,
          runError: 'Could not connect to the code runner. Please try again.',
        }))
      }
    })
    socket.addEventListener('close', () => {
      if (!completeRef.current) {
        completeRef.current = true
        setRun((current) => ({
          ...current,
          running: false,
          ready: false,
          runError: 'The code runner connection closed unexpectedly.',
        }))
      }
      if (socketRef.current === socket) socketRef.current = null
    })
  }, [])

  const sendInput = useCallback((data) => {
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'input', data }))
      return true
    }
    return false
  }, [])

  const stop = useCallback(() => {
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'stop' }))
    socket?.close()
    socketRef.current = null
    completeRef.current = true
    setRun((current) => ({ ...current, running: false, ready: false }))
  }, [])

  const clear = useCallback(() => {
    if (run.running) return
    socketRef.current?.close()
    socketRef.current = null
    completeRef.current = true
    setRun(emptyRun())
  }, [run.running])

  return { run, execute, sendInput, stop, clear }
}
